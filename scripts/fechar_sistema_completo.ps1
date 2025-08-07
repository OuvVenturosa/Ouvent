# =============================================
# FECHADOR DO SISTEMA COMPLETO
# =============================================

Write-Host "FECHANDO SISTEMA COMPLETO" -ForegroundColor Red
Write-Host "=====================================" -ForegroundColor Red

# Encerra processos do Node.js
Write-Host "Encerrando processos Node.js..." -ForegroundColor Yellow
try {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        foreach ($process in $nodeProcesses) {
            Write-Host "Encerrando processo Node.js (PID: $($process.Id))" -ForegroundColor Yellow
            $process.Kill()
        }
        Write-Host "Processos Node.js encerrados" -ForegroundColor Green
    } else {
        Write-Host "Nenhum processo Node.js encontrado" -ForegroundColor Gray
    }
} catch {
    Write-Host "Erro ao encerrar processos Node.js" -ForegroundColor Red
}

# Encerra processos nas portas específicas
Write-Host "Encerrando processos nas portas..." -ForegroundColor Yellow
try {
    $processes3000 = netstat -ano | findstr :3000 | ForEach-Object { ($_ -split '\s+')[4] }
    $processes3001 = netstat -ano | findstr :3001 | ForEach-Object { ($_ -split '\s+')[4] }
    
    foreach ($pid in $processes3000) {
        Write-Host "Encerrando processo na porta 3000 (PID: $pid)" -ForegroundColor Yellow
        taskkill /PID $pid /F 2>$null
    }
    
    foreach ($pid in $processes3001) {
        Write-Host "Encerrando processo na porta 3001 (PID: $pid)" -ForegroundColor Yellow
        taskkill /PID $pid /F 2>$null
    }
    
    Write-Host "Processos nas portas encerrados" -ForegroundColor Green
} catch {
    Write-Host "Nenhum processo encontrado nas portas" -ForegroundColor Gray
}

# Encerra processos do PowerShell relacionados ao sistema
Write-Host "Encerrando janelas do sistema..." -ForegroundColor Yellow
try {
    $powershellProcesses = Get-Process -Name "powershell" -ErrorAction SilentlyContinue
    foreach ($process in $powershellProcesses) {
        $processTitle = $process.MainWindowTitle
        if ($processTitle -like "*Backend*" -or $processTitle -like "*Frontend*" -or $processTitle -like "*Ouvidoria*") {
            Write-Host "Encerrando janela: $processTitle (PID: $($process.Id))" -ForegroundColor Yellow
            $process.Kill()
        }
    }
} catch {
    Write-Host "Nenhuma janela do sistema encontrada" -ForegroundColor Gray
}

# Aguarda um momento para garantir que os processos foram encerrados
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    SISTEMA ENCERRADO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Todos os processos foram encerrados" -ForegroundColor Green
Write-Host "Para reiniciar o sistema:" -ForegroundColor Yellow
Write-Host "Execute: .\executar_sistema_completo.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
Read-Host 