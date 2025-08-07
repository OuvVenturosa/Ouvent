@echo off
chcp 65001 >nul
title Fechando Sistema - Ouvidoria

echo.
echo ============================================
echo    FECHANDO SISTEMA COMPLETO
echo ============================================
echo.

echo 🔄 Encerrando processos Node.js...
taskkill /IM node.exe /F >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Processos Node.js encerrados
) else (
    echo ℹ️ Nenhum processo Node.js encontrado
)

echo.
echo 🔄 Encerrando processos nas portas...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Encerrando processo na porta 3000 (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Encerrando processo na porta 3001 (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo 🔄 Encerrando janelas do sistema...
for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq Backend*" /FO CSV ^| findstr /V "INFO"') do (
    echo Encerrando janela Backend (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq Frontend*" /FO CSV ^| findstr /V "INFO"') do (
    echo Encerrando janela Frontend (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq Ouvidoria*" /FO CSV ^| findstr /V "INFO"') do (
    echo Encerrando janela Ouvidoria (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo Aguardando 2 segundos...
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo    SISTEMA ENCERRADO COM SUCESSO!
echo ========================================
echo.
echo ✅ Todos os processos foram encerrados
echo 🔄 Para reiniciar o sistema:
echo Execute: executar_sistema_completo.bat
echo.
echo Pressione qualquer tecla para sair...
pause >nul 