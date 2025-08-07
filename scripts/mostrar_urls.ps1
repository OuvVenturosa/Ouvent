Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    SISTEMA DA OUVIDORIA - URLs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Obter IP da máquina
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"}).IPAddress | Select-Object -First 1

if (-not $ip) {
    $ip = "192.168.1.141"  # IP padrão se não conseguir detectar
}

Write-Host "URLs de Acesso:" -ForegroundColor Green
Write-Host ""

Write-Host "Acesso Local (mesma máquina):" -ForegroundColor Yellow
Write-Host "   http://localhost/venturosa" -ForegroundColor White
Write-Host "   http://127.0.0.1/venturosa" -ForegroundColor White
Write-Host ""

Write-Host "Acesso Externo (outras máquinas/dispositivos):" -ForegroundColor Yellow
Write-Host "   http://ouvadmin/venturosa" -ForegroundColor White
Write-Host "   http://ouvadmin" -ForegroundColor White
Write-Host "   http://$ip/venturosa" -ForegroundColor White
Write-Host ""

Write-Host "URLs de Desenvolvimento:" -ForegroundColor Yellow
Write-Host "   Servidor Principal: http://$ip`:3000/venturosa" -ForegroundColor White
Write-Host "   API Backend: http://$ip`:3001/api/health" -ForegroundColor White
Write-Host ""

Write-Host "Status dos Serviços:" -ForegroundColor Green

# Verificar se os serviços estão rodando
$port3000 = netstat -an | findstr ":3000" | findstr "LISTENING"
$port3001 = netstat -an | findstr ":3001" | findstr "LISTENING"
$port80 = netstat -an | findstr ":80" | findstr "LISTENING"

if ($port3000) {
    Write-Host "   Servidor Principal (porta 3000): RODANDO" -ForegroundColor Green
} else {
    Write-Host "   Servidor Principal (porta 3000): PARADO" -ForegroundColor Red
}

if ($port3001) {
    Write-Host "   API Backend (porta 3001): RODANDO" -ForegroundColor Green
} else {
    Write-Host "   API Backend (porta 3001): PARADO" -ForegroundColor Red
}

if ($port80) {
    Write-Host "   Nginx (porta 80): RODANDO" -ForegroundColor Green
} else {
    Write-Host "   Nginx (porta 80): PARADO" -ForegroundColor Red
}

Write-Host ""
Write-Host "Para acessar de dispositivos móveis:" -ForegroundColor Green
Write-Host "   1. Certifique-se de que o dispositivo está na mesma rede Wi-Fi" -ForegroundColor White
Write-Host "   2. Abra o navegador no celular/tablet" -ForegroundColor White
Write-Host "   3. Digite: http://ouvadmin/venturosa" -ForegroundColor Cyan
Write-Host ""

Write-Host "Para acesso público (internet):" -ForegroundColor Green
Write-Host "   Configure Port Forwarding no roteador:" -ForegroundColor White
Write-Host "   - Porta 80 → $ip" -ForegroundColor White
Write-Host "   - Porta 443 → $ip (para HTTPS)" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan 