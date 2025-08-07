# =============================================
# EXECUTOR DO SISTEMA COMPLETO
# =============================================

Write-Host "EXECUTOR DO SISTEMA COMPLETO" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Verifica se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js nao encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verifica se as dependências estão instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias principais..." -ForegroundColor Yellow
    npm install
}

# Verifica se as dependências do frontend estão instaladas
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "Instalando dependencias do frontend..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

# Encerra processos existentes nas portas
Write-Host "Encerrando processos existentes..." -ForegroundColor Yellow
try {
    $processes3000 = netstat -ano | findstr :3000 | ForEach-Object { ($_ -split '\s+')[4] }
    $processes3001 = netstat -ano | findstr :3001 | ForEach-Object { ($_ -split '\s+')[4] }
    
    foreach ($pid in $processes3000) {
        taskkill /PID $pid /F 2>$null
        Write-Host "Processo na porta 3000 encerrado: $pid" -ForegroundColor Green
    }
    
    foreach ($pid in $processes3001) {
        taskkill /PID $pid /F 2>$null
        Write-Host "Processo na porta 3001 encerrado: $pid" -ForegroundColor Green
    }
} catch {
    Write-Host "Nenhum processo encontrado nas portas" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Iniciando Sistema Completo..." -ForegroundColor Green
Write-Host ""

# Inicia o Backend
Write-Host "[1/4] Iniciando Backend (Node.js)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Backend iniciado em http://localhost:3001' -ForegroundColor Green; node backend/backend.js"

# Aguarda 3 segundos
Write-Host "[2/4] Aguardando 3 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Inicia o Frontend
Write-Host "[3/4] Iniciando Frontend (React)..." -ForegroundColor Green
Set-Location frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Frontend iniciado em http://localhost:3000' -ForegroundColor Green; npm start" -WindowStyle Normal
Set-Location ..

# Aguarda 5 segundos
Write-Host "[4/4] Aguardando 5 segundos para estabilizacao..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    SISTEMA INICIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs de Acesso:" -ForegroundColor Blue
Write-Host "Backend: http://localhost:3001" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "URL Principal: http://ouvadmin/venturosa" -ForegroundColor White
Write-Host ""
Write-Host "LOGINS DE TESTE:" -ForegroundColor Yellow
Write-Host "Master: CPF 12345678900 / Senha admin123" -ForegroundColor White
Write-Host "Secretaria: CPF 98765432100 / Senha secretaria123" -ForegroundColor White
Write-Host ""
Write-Host "PARA INICIAR O WHATSAPP (OPCIONAL):" -ForegroundColor Yellow
Write-Host "Execute em um novo terminal: node chat.js" -ForegroundColor White
Write-Host ""
Write-Host "PARA FINALIZAR O SISTEMA:" -ForegroundColor Yellow
Write-Host "Execute: .\fechar_sistema_completo.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
Read-Host 