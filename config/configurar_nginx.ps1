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
Write-Host "Parando Nginx se estiver rodando..." -ForegroundColor Yellow
try {
    & $nginxPath -s stop 2>$null
    Write-Host "Nginx parado" -ForegroundColor Green
} catch {
    Write-Host "Nginx não estava rodando" -ForegroundColor Gray
}

# Copiar configuração
Write-Host ""
Write-Host "Copiando configuração do Nginx..." -ForegroundColor Yellow
try {
    Copy-Item "config\nginx.conf" $nginxConfigPath -Force
    Write-Host "Configuração copiada com sucesso" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Não foi possível copiar a configuração" -ForegroundColor Red
    Write-Host "Verifique se o arquivo config\nginx.conf existe" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Testar configuração
Write-Host ""
Write-Host "Testando configuração do Nginx..." -ForegroundColor Yellow
try {
    & $nginxPath -t
    Write-Host "Configuração do Nginx está válida" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Configuração do Nginx inválida" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Iniciar Nginx
Write-Host ""
Write-Host "Iniciando Nginx..." -ForegroundColor Yellow
try {
    & $nginxPath
    Write-Host "Nginx iniciado com sucesso" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Não foi possível iniciar o Nginx" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    NGINX CONFIGURADO E INICIADO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs de Acesso:" -ForegroundColor Blue
Write-Host "URL Principal: http://ouvadmin/venturosa" -ForegroundColor White
Write-Host "Backend API: http://ouvadmin/api" -ForegroundColor White
Write-Host ""
Write-Host "Para parar o Nginx:" -ForegroundColor Yellow
Write-Host "& '$nginxPath' -s stop" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 