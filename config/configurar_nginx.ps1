Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    CONFIGURANDO NGINX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$nginxPath = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe"
$nginxConfigPath = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\conf\nginx.conf"

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
    Start-Process -FilePath $nginxPath -ArgumentList "-s", "stop" -NoNewWindow -Wait
    Write-Host "Nginx parado com sucesso" -ForegroundColor Green
} catch {
    Write-Host "Nginx não estava em execução" -ForegroundColor Gray
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
$destMimePath = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\conf\mime.types"

if (-not (Test-Path $sourceMimePath)) {
    Write-Host "ERRO: Arquivo mime.types não encontrado em $sourceMimePath" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

try {
    Copy-Item -Path $sourceMimePath -Destination $destMimePath -Force
    Write-Host "Arquivo mime.types copiado com sucesso" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Falha ao copiar arquivo mime.types" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "Configuração do Nginx concluída com sucesso!" -ForegroundColor Green
Write-Host ""