Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    VERIFICADOR DE NGINX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$nginxPath = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe"
$nginxConfigPath = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\conf\nginx.conf"

Write-Host "Verificando Nginx..." -ForegroundColor Yellow
Write-Host ""

# 1. Verificar se o executavel existe
Write-Host "[1/5] Verificando executavel do Nginx..." -ForegroundColor Yellow
if (Test-Path $nginxPath) {
    Write-Host "OK - Nginx encontrado: $nginxPath" -ForegroundColor Green
} else {
    Write-Host "ERRO - Nginx nao encontrado em: $nginxPath" -ForegroundColor Red
    Write-Host "Verifique se o Nginx esta instalado no caminho correto" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# 2. Verificar se a configuracao existe
Write-Host ""
Write-Host "[2/5] Verificando arquivo de configuracao..." -ForegroundColor Yellow
if (Test-Path $nginxConfigPath) {
    Write-Host "OK - Configuracao encontrada: $nginxConfigPath" -ForegroundColor Green
} else {
    Write-Host "ERRO - Configuracao nao encontrada" -ForegroundColor Red
    Write-Host "Copiando configuracao..." -ForegroundColor Yellow
    try {
        Copy-Item "config\nginx.conf" $nginxConfigPath -Force
        Write-Host "OK - Configuracao copiada com sucesso" -ForegroundColor Green
    } catch {
        Write-Host "ERRO - Erro ao copiar configuracao" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
}

# 3. Testar configuracao
Write-Host ""
Write-Host "[3/5] Testando configuracao do Nginx..." -ForegroundColor Yellow
try {
    $testResult = & $nginxPath -t 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK - Configuracao valida" -ForegroundColor Green
        Write-Host "Resultado: $testResult" -ForegroundColor Gray
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

# 4. Verificar se Nginx esta rodando
Write-Host ""
Write-Host "[4/5] Verificando se Nginx esta rodando..." -ForegroundColor Yellow
$nginxProcess = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
if ($nginxProcess) {
    Write-Host "OK - Nginx esta rodando (PID: $($nginxProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "ERRO - Nginx nao esta rodando" -ForegroundColor Red
}

# 5. Verificar portas
Write-Host ""
Write-Host "[5/5] Verificando portas..." -ForegroundColor Yellow
$port80 = netstat -ano | findstr :80
if ($port80) {
    Write-Host "OK - Porta 80 esta em uso" -ForegroundColor Green
    Write-Host "Processos na porta 80: $port80" -ForegroundColor Gray
} else {
    Write-Host "ERRO - Porta 80 nao esta em uso" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    DIAGNOSTICO COMPLETO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Resumo
Write-Host "Resumo:" -ForegroundColor Yellow
Write-Host "- Executavel: $(if (Test-Path $nginxPath) { 'OK' } else { 'FALHA' })" -ForegroundColor White
Write-Host "- Configuracao: $(if (Test-Path $nginxConfigPath) { 'OK' } else { 'FALHA' })" -ForegroundColor White
Write-Host "- Teste: $(if ($LASTEXITCODE -eq 0) { 'OK' } else { 'FALHA' })" -ForegroundColor White
Write-Host "- Processo: $(if ($nginxProcess) { 'RODANDO' } else { 'PARADO' })" -ForegroundColor White
Write-Host "- Porta 80: $(if ($port80) { 'EM USO' } else { 'LIVRE' })" -ForegroundColor White

Write-Host ""
Write-Host "Comandos uteis:" -ForegroundColor Yellow
Write-Host "Iniciar Nginx: $nginxPath" -ForegroundColor White
Write-Host "Parar Nginx: $nginxPath -s stop" -ForegroundColor White
Write-Host "Recarregar: $nginxPath -s reload" -ForegroundColor White
Write-Host "Testar config: $nginxPath -t" -ForegroundColor White

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 