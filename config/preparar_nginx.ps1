Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    PREPARANDO AMBIENTE NGINX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$nginxPath = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe"
$nginxDir = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0"
$nginxConfigPath = "$nginxDir\conf\nginx.conf"

Write-Host "Preparando ambiente do Nginx..." -ForegroundColor Yellow
Write-Host ""

# 1. Verificar se o Nginx existe
Write-Host "[1/4] Verificando instalacao do Nginx..." -ForegroundColor Yellow
if (Test-Path $nginxPath) {
    Write-Host "OK - Nginx encontrado: $nginxPath" -ForegroundColor Green
} else {
    Write-Host "ERRO - Nginx nao encontrado em: $nginxPath" -ForegroundColor Red
    Write-Host "Verifique se o Nginx esta instalado no caminho correto" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# 2. Criar diretorios necessarios
Write-Host ""
Write-Host "[2/4] Criando diretorios necessarios..." -ForegroundColor Yellow

# Criar diretorio de logs
$logsDir = "$nginxDir\logs"
if (-not (Test-Path $logsDir)) {
    try {
        New-Item -ItemType Directory -Path $logsDir -Force
        Write-Host "OK - Diretorio de logs criado: $logsDir" -ForegroundColor Green
    } catch {
        Write-Host "ERRO - Nao foi possivel criar diretorio de logs" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
} else {
    Write-Host "OK - Diretorio de logs ja existe: $logsDir" -ForegroundColor Green
}

# Criar diretorio html se nao existir
$htmlDir = "$nginxDir\html"
if (-not (Test-Path $htmlDir)) {
    try {
        New-Item -ItemType Directory -Path $htmlDir -Force
        Write-Host "OK - Diretorio html criado: $htmlDir" -ForegroundColor Green
    } catch {
        Write-Host "ERRO - Nao foi possivel criar diretorio html" -ForegroundColor Red
    }
} else {
    Write-Host "OK - Diretorio html ja existe: $htmlDir" -ForegroundColor Green
}

# 3. Copiar arquivo de configuracao
Write-Host ""
Write-Host "[3/4] Copiando arquivo de configuracao..." -ForegroundColor Yellow
try {
    Copy-Item "config\nginx.conf" $nginxConfigPath -Force
    Write-Host "OK - Configuracao copiada: $nginxConfigPath" -ForegroundColor Green
} catch {
    Write-Host "ERRO - Nao foi possivel copiar configuracao" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# 4. Testar configuracao
Write-Host ""
Write-Host "[4/4] Testando configuracao..." -ForegroundColor Yellow
try {
    # Mudar para o diretorio do Nginx antes de testar
    Push-Location $nginxDir
    $testResult = & $nginxPath -t 2>&1
    Pop-Location
    
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

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    AMBIENTE PREPARADO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Diretorios criados:" -ForegroundColor Yellow
Write-Host "- Logs: $logsDir" -ForegroundColor White
Write-Host "- HTML: $htmlDir" -ForegroundColor White
Write-Host "- Config: $nginxConfigPath" -ForegroundColor White
Write-Host ""
Write-Host "Agora voce pode:" -ForegroundColor Yellow
Write-Host "- Iniciar Nginx: $nginxPath" -ForegroundColor White
Write-Host "- Ou usar: .\iniciar_nginx_manual.ps1" -ForegroundColor White
Write-Host "- Ou usar: .\executar_sistema_completo.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 