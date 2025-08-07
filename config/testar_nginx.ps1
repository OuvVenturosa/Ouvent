Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    TESTANDO NGINX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$nginxPath = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe"
$nginxDir = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0"
$nginxConfigPath = "$nginxDir\conf\nginx.conf"

Write-Host "Testando Nginx com caminho correto..." -ForegroundColor Yellow
Write-Host ""

# Verificar se Nginx existe
if (-not (Test-Path $nginxPath)) {
    Write-Host "ERRO - Nginx nao encontrado em: $nginxPath" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "OK - Nginx encontrado: $nginxPath" -ForegroundColor Green

# Verificar se configuracao existe
if (-not (Test-Path $nginxConfigPath)) {
    Write-Host "ERRO - Configuracao nao encontrada: $nginxConfigPath" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "OK - Configuracao encontrada: $nginxConfigPath" -ForegroundColor Green

# Verificar se diretorio de logs existe
$logsDir = "$nginxDir\logs"
if (-not (Test-Path $logsDir)) {
    Write-Host "Criando diretorio de logs..." -ForegroundColor Yellow
    try {
        New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
        Write-Host "OK - Diretorio de logs criado" -ForegroundColor Green
    } catch {
        Write-Host "ERRO - Nao foi possivel criar diretorio de logs" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
} else {
    Write-Host "OK - Diretorio de logs existe: $logsDir" -ForegroundColor Green
}

# Testar configuracao
Write-Host ""
Write-Host "Testando configuracao do Nginx..." -ForegroundColor Yellow
Write-Host "Diretorio atual: $(Get-Location)" -ForegroundColor Gray
Write-Host "Mudando para: $nginxDir" -ForegroundColor Gray

try {
    # Mudar para o diretorio do Nginx
    Push-Location $nginxDir
    Write-Host "Diretorio apos mudanca: $(Get-Location)" -ForegroundColor Gray
    
    # Testar configuracao
    $testResult = & $nginxPath -t 2>&1
    $exitCode = $LASTEXITCODE
    
    # Voltar ao diretorio original
    Pop-Location
    
    if ($exitCode -eq 0) {
        Write-Host "OK - Configuracao valida!" -ForegroundColor Green
        Write-Host "Resultado: $testResult" -ForegroundColor Gray
    } else {
        Write-Host "ERRO - Configuracao invalida!" -ForegroundColor Red
        Write-Host "Erro: $testResult" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
} catch {
    Write-Host "ERRO - Erro ao testar configuracao: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    TESTE CONCLUIDO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Agora voce pode:" -ForegroundColor Yellow
Write-Host "- Iniciar Nginx: $nginxPath" -ForegroundColor White
Write-Host "- Ou usar: .\iniciar_nginx_manual.ps1" -ForegroundColor White
Write-Host "- Ou usar: .\executar_sistema_completo.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 