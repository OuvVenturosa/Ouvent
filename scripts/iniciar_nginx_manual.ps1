Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    INICIAR NGINX MANUALMENTE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Caminho para o nginx.exe (ajuste conforme necessário)
$nginxPath = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe"

# Verificar se Nginx existe
if (-not (Test-Path $nginxPath)) {
    Write-Host "❌ Nginx não encontrado em: $nginxPath" -ForegroundColor Red
    Write-Host "Verifique se o Nginx está instalado no caminho correto" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "OK - Nginx encontrado: $nginxPath" -ForegroundColor Green

# Parar Nginx se estiver rodando
Write-Host ""
Write-Host "Parando Nginx se estiver rodando..." -ForegroundColor Yellow
try {
    & $nginxPath -s stop 2>$null
    Start-Sleep -Seconds 2
    Write-Host "OK - Nginx parado" -ForegroundColor Green
} catch {
    Write-Host "INFO - Nginx nao estava rodando" -ForegroundColor Gray
}

# Verificar se a configuração existe
Write-Host ""
Write-Host "Verificando configuração..." -ForegroundColor Yellow
if (-not (Test-Path "config\nginx.conf")) {
    Write-Host "ERRO - Configuracao nao encontrada" -ForegroundColor Red
    Write-Host "Copiando configuracao..." -ForegroundColor Yellow
    try {
        Copy-Item "config\nginx.conf" "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\conf\nginx.conf" -Force
        Write-Host "OK - Configuracao copiada" -ForegroundColor Green
    } catch {
        Write-Host "ERRO - Erro ao copiar configuracao" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
} else {
    Write-Host "OK - Configuracao encontrada" -ForegroundColor Green
}

# Testar configuracao
Write-Host ""
Write-Host "Testando configuracao..." -ForegroundColor Yellow
try {
    # Mudar para o diretorio do Nginx antes de testar
    $nginxDir = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0"
    Push-Location $nginxDir
    $testResult = & $nginxPath -t 2>&1
    Pop-Location
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK - Configuracao valida" -ForegroundColor Green
    } else {
        Write-Host "ERRO - Configuracao invalida" -ForegroundColor Red
        Write-Host "Erro: $testResult" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
} catch {
    Write-Host "ERRO - Erro ao testar configuracao" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se a porta 80 está livre
Write-Host ""
Write-Host "Verificando porta 80..." -ForegroundColor Yellow
$port80 = netstat -ano | findstr :80
if ($port80) {
    Write-Host "ATENCAO - Porta 80 esta em uso:" -ForegroundColor Yellow
    Write-Host "$port80" -ForegroundColor Gray
    Write-Host "Deseja continuar mesmo assim? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "S" -and $response -ne "s") {
        Write-Host "Operacao cancelada" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "OK - Porta 80 esta livre" -ForegroundColor Green
}

# Iniciar Nginx
Write-Host ""
Write-Host "Iniciando Nginx..." -ForegroundColor Yellow
try {
    # Mudar para o diretorio do Nginx antes de iniciar
    Push-Location $nginxDir
    
    # Tentar iniciar em modo foreground primeiro
    Write-Host "Tentando iniciar Nginx..." -ForegroundColor Yellow
    Start-Process -FilePath $nginxPath -WindowStyle Hidden
    
    Pop-Location
    Start-Sleep -Seconds 3
    
    # Verificar se iniciou
    $nginxProcess = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
    if ($nginxProcess) {
        Write-Host "OK - Nginx iniciado com sucesso!" -ForegroundColor Green
        Write-Host "PID: $($nginxProcess.Id)" -ForegroundColor White
        Write-Host "Processos: $($nginxProcess.Count)" -ForegroundColor White
    } else {
        Write-Host "ERRO - Nginx pode nao ter iniciado" -ForegroundColor Red
        Write-Host "Tentando iniciar manualmente..." -ForegroundColor Yellow
        
        # Tentar iniciar diretamente
        Push-Location $nginxDir
        & $nginxPath
        Pop-Location
        Start-Sleep -Seconds 2
        
        $nginxProcess = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
        if ($nginxProcess) {
            Write-Host "OK - Nginx iniciado manualmente!" -ForegroundColor Green
        } else {
            Write-Host "ERRO - Falha ao iniciar Nginx" -ForegroundColor Red
            Write-Host "Execute manualmente: $nginxPath" -ForegroundColor White
        }
    }
} catch {
    Write-Host "ERRO - Erro ao iniciar Nginx: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Execute manualmente: $nginxPath" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    RESULTADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificação final
$nginxProcess = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
$port80 = netstat -ano | findstr :80

Write-Host "Status Final:" -ForegroundColor Yellow
Write-Host "- Nginx Processo: $(if ($nginxProcess) { 'RODANDO' } else { 'PARADO' })" -ForegroundColor White
Write-Host "- Porta 80: $(if ($port80) { 'EM USO' } else { 'LIVRE' })" -ForegroundColor White

if ($nginxProcess -and $port80) {
    Write-Host ""
    Write-Host "SUCESSO - Nginx iniciado com sucesso!" -ForegroundColor Green
    Write-Host "URL: http://ouvadmin/venturosa" -ForegroundColor Blue
} else {
    Write-Host ""
    Write-Host "ATENCAO - Nginx pode nao estar funcionando corretamente" -ForegroundColor Yellow
    Write-Host "Execute: .\verificar_nginx.ps1" -ForegroundColor White
}

Write-Host ""
Write-Host "Comandos úteis:" -ForegroundColor Yellow
Write-Host "Parar: $nginxPath -s stop" -ForegroundColor White
Write-Host "Recarregar: $nginxPath -s reload" -ForegroundColor White
Write-Host "Verificar: .\verificar_nginx.ps1" -ForegroundColor White

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 