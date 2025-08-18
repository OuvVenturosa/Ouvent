Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    CONFIGURANDO NGINX (CORRIGIDO)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$nginxPath = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe"
$nginxDir = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0"
$nginxConfigPath = "$nginxDir\conf\nginx.conf"
$nginxMimePath = "$nginxDir\conf\mime.types"

# Verificar se Nginx existe
if (-not (Test-Path $nginxPath)) {
    Write-Host "ERRO: Nginx não encontrado em $nginxPath" -ForegroundColor Red
    Write-Host "Verifique se o Nginx está instalado no caminho correto" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "Nginx encontrado: $nginxPath" -ForegroundColor Green

# Parar Nginx se estiver rodando
Write-Host ""
Write-Host "Parando Nginx se estiver em execução..." -ForegroundColor Yellow
try {
    & $nginxPath -s stop 2>$null
    Start-Sleep -Seconds 2
    Write-Host "Nginx parado com sucesso" -ForegroundColor Green
} catch {
    Write-Host "Nginx não estava em execução" -ForegroundColor Gray
}

# Criar diretórios necessários
Write-Host ""
Write-Host "Criando diretórios necessários..." -ForegroundColor Yellow

# Criar diretório de logs
$logsDir = "$nginxDir\logs"
if (-not (Test-Path $logsDir)) {
    try {
        New-Item -ItemType Directory -Path $logsDir -Force
        Write-Host "Diretório de logs criado: $logsDir" -ForegroundColor Green
    } catch {
        Write-Host "ERRO: Não foi possível criar diretório de logs" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
} else {
    Write-Host "Diretório de logs já existe: $logsDir" -ForegroundColor Green
}

# Criar diretório html
$htmlDir = "$nginxDir\html"
if (-not (Test-Path $htmlDir)) {
    try {
        New-Item -ItemType Directory -Path $htmlDir -Force
        Write-Host "Diretório html criado: $htmlDir" -ForegroundColor Green
    } catch {
        Write-Host "ERRO: Não foi possível criar diretório html" -ForegroundColor Red
    }
} else {
    Write-Host "Diretório html já existe: $htmlDir" -ForegroundColor Green
}

# Copiar arquivo de configuração
Write-Host ""
Write-Host "Copiando arquivo de configuração..." -ForegroundColor Yellow
$sourceConfigPath = "$PSScriptRoot\nginx.conf"

if (-not (Test-Path $sourceConfigPath)) {
    Write-Host "ERRO: Arquivo de configuração não encontrado em $sourceConfigPath" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

try {
    Copy-Item -Path $sourceConfigPath -Destination $nginxConfigPath -Force
    Write-Host "Arquivo de configuração copiado com sucesso" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Falha ao copiar arquivo de configuração" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Copiar arquivo mime.types
Write-Host ""
Write-Host "Copiando arquivo mime.types..." -ForegroundColor Yellow
$sourceMimePath = "$PSScriptRoot\mime.types"

if (-not (Test-Path $sourceMimePath)) {
    Write-Host "ERRO: Arquivo mime.types não encontrado em $sourceMimePath" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

try {
    Copy-Item -Path $sourceMimePath -Destination $nginxMimePath -Force
    Write-Host "Arquivo mime.types copiado com sucesso" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Falha ao copiar arquivo mime.types" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Testar configuração
Write-Host ""
Write-Host "Testando configuração do Nginx..." -ForegroundColor Yellow
try {
    # Mudar para o diretório do Nginx antes de testar
    Push-Location $nginxDir
    $testResult = & $nginxPath -t 2>&1
    Pop-Location
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Configuração válida!" -ForegroundColor Green
        Write-Host "Resultado: $testResult" -ForegroundColor Gray
    } else {
        Write-Host "ERRO: Configuração inválida" -ForegroundColor Red
        Write-Host "Erro: $testResult" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
} catch {
    Write-Host "ERRO: Erro ao testar configuração" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "Configuração do Nginx concluída com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar o Nginx, execute:" -ForegroundColor Yellow
Write-Host "& '$nginxPath'" -ForegroundColor White
Write-Host ""
Write-Host "Ou use o script: .\executar_sistema_completo_com_nginx.ps1" -ForegroundColor White
Write-Host ""
