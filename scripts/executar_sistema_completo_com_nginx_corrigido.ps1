# =============================================
# EXECUTOR DO SISTEMA COMPLETO COM NGINX (CORRIGIDO)
# =============================================

Write-Host "EXECUTOR DO SISTEMA COMPLETO COM NGINX (CORRIGIDO)" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Verifica se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js não encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verifica se as dependências estão instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependências principais..." -ForegroundColor Yellow
    npm install
}

# Verifica se as dependências do backend estão instaladas
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "Instalando dependências do backend..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

# Verifica se as dependências do frontend estão instaladas
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "Instalando dependências do frontend..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

# Verifica se as dependências do chatbot estão instaladas
if (-not (Test-Path "chatbot/node_modules")) {
    Write-Host "Instalando dependências do chatbot..." -ForegroundColor Yellow
    Set-Location chatbot
    npm install
    Set-Location ..
}

# Encerra processos existentes nas portas
Write-Host "Encerrando processos existentes..." -ForegroundColor Yellow
try {
    $processes3000 = netstat -ano | findstr :3000 | ForEach-Object { ($_ -split '\s+')[4] }
    $processes3001 = netstat -ano | findstr :3001 | ForEach-Object { ($_ -split '\s+')[4] }
    $processes80 = netstat -ano | findstr :80 | ForEach-Object { ($_ -split '\s+')[4] }
    
    foreach ($pid in $processes3000) {
        taskkill /PID $pid /F 2>$null
        Write-Host "Processo na porta 3000 encerrado: $pid" -ForegroundColor Green
    }
    
    foreach ($pid in $processes3001) {
        taskkill /PID $pid /F 2>$null
        Write-Host "Processo na porta 3001 encerrado: $pid" -ForegroundColor Green
    }
    
    foreach ($pid in $processes80) {
        taskkill /PID $pid /F 2>$null
        Write-Host "Processo na porta 80 encerrado: $pid" -ForegroundColor Green
    }
} catch {
    Write-Host "Nenhum processo encontrado nas portas" -ForegroundColor Gray
}

# Configurar Nginx
Write-Host ""
Write-Host "Configurando Nginx..." -ForegroundColor Yellow
$nginxPath = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe"
$nginxDir = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0"

if (Test-Path $nginxPath) {
    # Parar Nginx se estiver rodando
    try {
        & $nginxPath -s stop 2>$null
        Start-Sleep -Seconds 2
        Write-Host "Nginx parado" -ForegroundColor Green
    } catch {
        Write-Host "Nginx não estava rodando" -ForegroundColor Gray
    }
    
    # Criar diretórios necessários
    $logsDir = "$nginxDir\logs"
    $htmlDir = "$nginxDir\html"
    
    if (-not (Test-Path $logsDir)) {
        New-Item -ItemType Directory -Path $logsDir -Force
        Write-Host "Diretório de logs criado" -ForegroundColor Green
    }
    
    if (-not (Test-Path $htmlDir)) {
        New-Item -ItemType Directory -Path $htmlDir -Force
        Write-Host "Diretório html criado" -ForegroundColor Green
    }
    
    # Copiar configuração
    $nginxConfigPath = "$nginxDir\conf\nginx.conf"
    $nginxMimePath = "$nginxDir\conf\mime.types"
    
    Copy-Item "config\nginx.conf" $nginxConfigPath -Force
    Copy-Item "config\mime.types" $nginxMimePath -Force
    Write-Host "Configuração do Nginx copiada" -ForegroundColor Green
    
    # Testar configuração
    Push-Location $nginxDir
    $testResult = & $nginxPath -t 2>&1
    Pop-Location
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Configuração do Nginx válida" -ForegroundColor Green
    } else {
        Write-Host "ERRO: Configuração do Nginx inválida" -ForegroundColor Red
        Write-Host "Erro: $testResult" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
} else {
    Write-Host "Nginx não encontrado em: $nginxPath" -ForegroundColor Red
    Write-Host "Instale o Nginx ou ajuste o caminho no script" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Iniciando Sistema Completo com Nginx..." -ForegroundColor Green
Write-Host ""

# Inicia o Backend
Write-Host "[1/4] Iniciando Backend (Node.js)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Backend iniciado em http://localhost:3001' -ForegroundColor Green; Set-Location '$PWD\backend'; node backend.js" -WindowStyle Normal

# Aguarda 3 segundos
Write-Host "[2/4] Aguardando 3 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Inicia o Frontend
Write-Host "[3/4] Iniciando Frontend (React)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Frontend iniciado em http://localhost:3000' -ForegroundColor Green; Set-Location '$PWD\frontend'; npm start" -WindowStyle Normal

# Aguarda 5 segundos
Write-Host "[4/4] Aguardando 5 segundos para estabilização..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Inicia o Nginx
Write-Host "[5/5] Iniciando Nginx..." -ForegroundColor Green
if (Test-Path $nginxPath) {
    try {
        # Iniciar Nginx
        Start-Process $nginxPath -WindowStyle Hidden
        Start-Sleep -Seconds 3
        
        # Verificar se Nginx iniciou
        $nginxProcess = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
        if ($nginxProcess) {
            Write-Host "Nginx iniciado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "Atenção: Nginx pode não ter iniciado" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Erro ao iniciar Nginx: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Execute manualmente: $nginxPath" -ForegroundColor White
    }
} else {
    Write-Host "Nginx não encontrado em: $nginxPath" -ForegroundColor Red
    Write-Host "Instale o Nginx ou ajuste o caminho no script" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    SISTEMA COMPLETO INICIADO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs de Acesso:" -ForegroundColor Blue
Write-Host "Backend: http://localhost:3001" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "URL Principal: http://localhost" -ForegroundColor White
Write-Host "URL Nginx: http://localhost/venturosa" -ForegroundColor White
Write-Host ""
Write-Host "LOGINS DE TESTE:" -ForegroundColor Yellow
Write-Host "Master: CPF 12345678900 / Senha admin123" -ForegroundColor White
Write-Host "Secretaria: CPF 98765432100 / Senha secretaria123" -ForegroundColor White
Write-Host ""
Write-Host "PARA INICIAR O WHATSAPP (OPCIONAL):" -ForegroundColor Yellow
Write-Host "Execute em um novo terminal: node chat.js" -ForegroundColor White
Write-Host ""
Write-Host "PARA FINALIZAR O SISTEMA COMPLETO:" -ForegroundColor Yellow
Write-Host "Execute: .\fechar_sistema_completo_com_nginx.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
Read-Host
