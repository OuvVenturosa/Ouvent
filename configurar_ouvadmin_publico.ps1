# =============================================
# CONFIGURADOR OUNADMIN PÚBLICO
# =============================================

Write-Host "CONFIGURANDO OUNADMIN PARA ACESSO PÚBLICO" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

# Obter IP da máquina
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias Ethernet* | Where-Object {$_.IPAddress -notlike "169.254.*"} | Select-Object -First 1).IPAddress
if (-not $ipAddress) {
    $ipAddress = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias Wi-Fi* | Where-Object {$_.IPAddress -notlike "169.254.*"} | Select-Object -First 1).IPAddress
}

Write-Host "IP da máquina: $ipAddress" -ForegroundColor Cyan

# Configurar arquivo hosts
Write-Host ""
Write-Host "Configurando arquivo hosts..." -ForegroundColor Yellow

$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$hostsContent = Get-Content $hostsPath -Raw

# Verificar se já existe a entrada
if ($hostsContent -match "ouvadmin") {
    Write-Host "Entrada ouvadmin já existe no arquivo hosts" -ForegroundColor Green
} else {
    try {
        # Adicionar entrada ao arquivo hosts
        Add-Content -Path $hostsPath -Value "`n$ipAddress ouvadmin" -Force
        Write-Host "Entrada ouvadmin adicionada ao arquivo hosts" -ForegroundColor Green
    } catch {
        Write-Host "ERRO: Não foi possível editar o arquivo hosts" -ForegroundColor Red
        Write-Host "Execute este script como Administrador" -ForegroundColor Yellow
        Read-Host "Pressione Enter para sair"
        exit 1
    }
}

# Configurar Nginx
Write-Host ""
Write-Host "Configurando Nginx..." -ForegroundColor Yellow

$nginxPath = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe"
$nginxConfigPath = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\conf\nginx.conf"

if (Test-Path $nginxPath) {
    # Parar Nginx se estiver rodando
    try {
        & $nginxPath -s stop 2>$null
        Write-Host "Nginx parado" -ForegroundColor Green
    } catch {
        Write-Host "Nginx não estava rodando" -ForegroundColor Gray
    }
    
    # Copiar configuração
    try {
        Copy-Item "config\nginx.conf" $nginxConfigPath -Force
        Write-Host "Configuração do Nginx copiada" -ForegroundColor Green
    } catch {
        Write-Host "ERRO: Não foi possível copiar a configuração do Nginx" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
    
    # Testar configuração
    try {
        & $nginxPath -t
        Write-Host "Configuração do Nginx válida" -ForegroundColor Green
    } catch {
        Write-Host "ERRO: Configuração do Nginx inválida" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
    
    # Iniciar Nginx
    try {
        Start-Process $nginxPath -WindowStyle Hidden
        Start-Sleep -Seconds 3
        Write-Host "Nginx iniciado" -ForegroundColor Green
    } catch {
        Write-Host "ERRO: Não foi possível iniciar o Nginx" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
} else {
    Write-Host "Nginx não encontrado em: $nginxPath" -ForegroundColor Red
    Write-Host "Instale o Nginx ou ajuste o caminho" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "    CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

Write-Host "URLs de Acesso:" -ForegroundColor Cyan
Write-Host "• Local: http://ouvadmin/venturosa" -ForegroundColor White
Write-Host "• Rede: http://$ipAddress/venturosa" -ForegroundColor White
Write-Host "• IP Direto: http://$ipAddress/venturosa" -ForegroundColor White

Write-Host ""
Write-Host "Para acesso público (internet):" -ForegroundColor Yellow
Write-Host "1. Configure Port Forwarding no roteador:" -ForegroundColor White
Write-Host "   - Porta 80 → $ipAddress" -ForegroundColor White
Write-Host "2. Use o IP público do roteador" -ForegroundColor White
Write-Host "3. Ou registre um domínio (ouvadmin.com)" -ForegroundColor White

Write-Host ""
Write-Host "Teste de funcionamento:" -ForegroundColor Yellow
Write-Host "• Local: Invoke-WebRequest -Uri 'http://ouvadmin/venturosa' -Method Head" -ForegroundColor White
Write-Host "• Rede: Invoke-WebRequest -Uri 'http://$ipAddress/venturosa' -Method Head" -ForegroundColor White

Write-Host ""
Write-Host "Para outras máquinas acessarem:" -ForegroundColor Yellow
Write-Host "Adicione no arquivo hosts: $ipAddress ouvadmin" -ForegroundColor White

Write-Host ""
Write-Host "Sistema pronto para uso público!" -ForegroundColor Green
Read-Host "Pressione Enter para sair" 