# =============================================
# INICIADOR SIMPLES DO SISTEMA
# =============================================

Write-Host "SISTEMA DE OUVIDORIA - INICIADOR SIMPLES" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js nao encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se as dependencias estao instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    Set-Location config
    npm install
    Set-Location ..
}

# Verificar se as dependencias do frontend estao instaladas
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "Instalando dependencias do frontend..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

# Encerrar processos existentes
Write-Host "Encerrando processos existentes..." -ForegroundColor Yellow
try {
    $processes3000 = netstat -ano | findstr :3000 | ForEach-Object { ($_ -split '\s+')[4] }
    $processes3001 = netstat -ano | findstr :3001 | ForEach-Object { ($_ -split '\s+')[4] }
    
    foreach ($pid in $processes3000) {
        taskkill /PID $pid /F 2>$null
        Write-Host "Processo na porta 3000 encerrado: $pid" -ForegroundColor Green
    }
    
    foreach ($pid in $processes3001) {
        taskkill /PID $pid /F 2>$null
        Write-Host "Processo na porta 3001 encerrado: $pid" -ForegroundColor Green
    }
} catch {
    Write-Host "Nenhum processo encontrado nas portas" -ForegroundColor Gray
}

# Parar Nginx se estiver rodando
Write-Host "Parando Nginx..." -ForegroundColor Yellow
$nginxPath = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe"
if (Test-Path $nginxPath) {
    try {
        & $nginxPath -s stop 2>$null
        Start-Sleep -Seconds 2
        Write-Host "Nginx parado" -ForegroundColor Green
    } catch {
        Write-Host "Nginx nao estava rodando" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Iniciando Sistema..." -ForegroundColor Green
Write-Host ""

# Iniciar o Backend
Write-Host "[1/3] Iniciando Backend (Node.js)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Backend iniciado em http://localhost:3001' -ForegroundColor Green; node backend/backend.js"

# Aguardar 3 segundos
Write-Host "[2/3] Aguardando 3 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Iniciar o Frontend
Write-Host "[3/3] Iniciando Frontend (React)..." -ForegroundColor Green
Set-Location frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Frontend iniciado em http://localhost:3000' -ForegroundColor Green; npm start" -WindowStyle Normal
Set-Location ..

# Aguardar 5 segundos
Write-Host "Aguardando 5 segundos para estabilizacao..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Iniciar Nginx
Write-Host "Iniciando Nginx..." -ForegroundColor Green
if (Test-Path $nginxPath) {
    try {
        # Copiar configuracao se necessario
        $nginxConfigPath = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\conf\nginx.conf"
        if (-not (Test-Path $nginxConfigPath)) {
            Copy-Item "config\nginx.conf" $nginxConfigPath -Force
            Write-Host "Configuracao do Nginx copiada" -ForegroundColor Green
        }
        
        # Iniciar Nginx
        Start-Process -FilePath $nginxPath -WindowStyle Hidden
        Start-Sleep -Seconds 3
        
        $nginxProcess = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
        if ($nginxProcess) {
            Write-Host "Nginx iniciado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "Nginx pode nao ter iniciado" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Erro ao iniciar Nginx" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "    SISTEMA INICIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

Write-Host "URLs de Acesso:" -ForegroundColor Cyan
Write-Host "Local: http://localhost/venturosa" -ForegroundColor White
Write-Host "Rede: http://ouvadmin/venturosa" -ForegroundColor White
Write-Host "Backend: http://localhost:3001" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White

Write-Host ""
Write-Host "Para iniciar o WhatsApp (opcional):" -ForegroundColor Yellow
Write-Host "Execute em um novo terminal: node chat.js" -ForegroundColor White

Write-Host ""
Write-Host "Para finalizar o sistema:" -ForegroundColor Yellow
Write-Host "Execute: .\scripts\fechar_sistema_completo_com_nginx.ps1" -ForegroundColor White

Write-Host ""
Write-Host "Sistema pronto para uso!" -ForegroundColor Green
Read-Host "Pressione Enter para sair" 