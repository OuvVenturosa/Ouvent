Write-Host "========================================" -ForegroundColor Red
Write-Host "    FECHANDO SISTEMA OUVIDORIA" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

Write-Host "Encerrando processos..." -ForegroundColor Yellow
Write-Host ""

# Encerrar processos na porta 3001 (Backend)
Write-Host "[1/3] Encerrando Backend (porta 3001)..." -ForegroundColor Yellow
try {
    $processes3001 = netstat -ano | findstr :3001 | ForEach-Object { ($_ -split '\s+')[4] }
    foreach ($pid in $processes3001) {
        taskkill /PID $pid /F 2>$null
        Write-Host "Backend encerrado: PID $pid" -ForegroundColor Green
    }
} catch {
    Write-Host "Nenhum processo encontrado na porta 3001" -ForegroundColor Gray
}

# Encerrar processos na porta 3000 (Frontend)
Write-Host "[2/3] Encerrando Frontend (porta 3000)..." -ForegroundColor Yellow
try {
    $processes3000 = netstat -ano | findstr :3000 | ForEach-Object { ($_ -split '\s+')[4] }
    foreach ($pid in $processes3000) {
        taskkill /PID $pid /F 2>$null
        Write-Host "Frontend encerrado: PID $pid" -ForegroundColor Green
    }
} catch {
    Write-Host "Nenhum processo encontrado na porta 3000" -ForegroundColor Gray
}

# Encerrar processos Node.js restantes
Write-Host "[3/3] Encerrando processos Node.js restantes..." -ForegroundColor Yellow
try {
    taskkill /IM node.exe /F 2>$null
    Write-Host "Processos Node.js encerrados" -ForegroundColor Green
} catch {
    Write-Host "Nenhum processo Node.js encontrado" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "    SISTEMA ENCERRADO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "Para reiniciar o sistema:" -ForegroundColor Yellow
Write-Host "Execute: .\iniciar_sistema_corrigido.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 