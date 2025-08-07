Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    SISTEMA DE OUVIDORIA MUNICIPAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Iniciando o sistema..." -ForegroundColor Yellow
Write-Host ""

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Node.js não encontrado!" -ForegroundColor Red
    Write-Host "Instale Node.js em: https://nodejs.org/" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "[1/3] Iniciando Backend (Node.js)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node backend.js" -WindowStyle Normal

Write-Host "[2/3] Aguardando 5 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "[3/3] Iniciando Frontend (React)..." -ForegroundColor Green
Set-Location frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    SISTEMA INICIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend: http://localhost:3001" -ForegroundColor Blue
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "LOGINS DE TESTE:" -ForegroundColor Yellow
Write-Host "Master: CPF 12345678900 / Senha admin123" -ForegroundColor White
Write-Host "Secretaria: CPF 98765432100 / Senha secretaria123" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 