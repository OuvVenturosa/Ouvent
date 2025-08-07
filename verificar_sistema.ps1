Write-Host "🔍 VERIFICAÇÃO DO SISTEMA" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Verificar Node.js
Write-Host "Node.js:" -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✅ $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Não encontrado" -ForegroundColor Red
}

# Verificar Nginx
Write-Host "Nginx:" -ForegroundColor Yellow
$nginxPath = "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe"
if (Test-Path $nginxPath) {
    Write-Host "  ✅ Encontrado" -ForegroundColor Green
} else {
    Write-Host "  ❌ Não encontrado" -ForegroundColor Red
}

# Verificar processos
Write-Host "Processos:" -ForegroundColor Yellow
$nginxProcess = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nginxProcess) {
    Write-Host "  ✅ Nginx: $($nginxProcess.Count) processos" -ForegroundColor Green
} else {
    Write-Host "  ❌ Nginx: Não rodando" -ForegroundColor Red
}

if ($nodeProcesses) {
    Write-Host "  ✅ Node.js: $($nodeProcesses.Count) processos" -ForegroundColor Green
} else {
    Write-Host "  ❌ Node.js: Não rodando" -ForegroundColor Red
}

# Verificar portas
Write-Host "Portas:" -ForegroundColor Yellow
$port80 = netstat -ano | findstr :80
$port3000 = netstat -ano | findstr :3000
$port3001 = netstat -ano | findstr :3001

if ($port80) {
    Write-Host "  ✅ Porta 80: Em uso" -ForegroundColor Green
} else {
    Write-Host "  ❌ Porta 80: Livre" -ForegroundColor Red
}

if ($port3000) {
    Write-Host "  ✅ Porta 3000: Em uso" -ForegroundColor Green
} else {
    Write-Host "  ❌ Porta 3000: Livre" -ForegroundColor Red
}

if ($port3001) {
    Write-Host "  ✅ Porta 3001: Em uso" -ForegroundColor Green
} else {
    Write-Host "  ❌ Porta 3001: Livre" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Comandos:" -ForegroundColor Yellow
Write-Host "• Iniciar: .\iniciar_sistema_simples.ps1" -ForegroundColor White
Write-Host "• Parar: .\scripts\fechar_sistema_completo_com_nginx.ps1" -ForegroundColor White

Read-Host "Pressione Enter para sair" 