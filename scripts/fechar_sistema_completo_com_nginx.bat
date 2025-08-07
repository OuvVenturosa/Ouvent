@echo off
chcp 65001 >nul
echo ============================================
echo FECHANDO SISTEMA COMPLETO COM NGINX
echo ============================================
echo.

echo Encerrando processos Node.js...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo Processos Node.js encerrados.
) else (
    echo Nenhum processo Node.js encontrado.
)

echo.
echo Encerrando processos nas portas...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Encerrando processo na porta 3000 (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Encerrando processo na porta 3001 (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :80') do (
    echo Encerrando processo na porta 80 (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

echo Processos nas portas encerrados.

echo.
echo Encerrando Nginx...
if exist "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe" (
    "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe" -s stop >nul 2>&1
    timeout /t 2 >nul
    echo Nginx encerrado.
) else (
    echo Nginx nao encontrado.
)

echo.
echo Encerrando janelas do sistema...
for /f "tokens=2" %%a in ('tasklist /fi "WINDOWTITLE eq *Backend*" /fo csv ^| findstr /v "WINDOWTITLE"') do (
    echo Encerrando janela Backend (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /fi "WINDOWTITLE eq *Frontend*" /fo csv ^| findstr /v "WINDOWTITLE"') do (
    echo Encerrando janela Frontend (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /fi "WINDOWTITLE eq *Ouvidoria*" /fo csv ^| findstr /v "WINDOWTITLE"') do (
    echo Encerrando janela Ouvidoria (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

timeout /t 2 >nul

echo.
echo ========================================
echo    SISTEMA COMPLETO ENCERRADO!
echo ========================================
echo.
echo Todos os processos foram encerrados:
echo - Backend (Node.js)
echo - Frontend (React)
echo - Nginx
echo - Processos nas portas 3000, 3001 e 80
echo.
echo Para reiniciar o sistema completo:
echo Execute: executar_sistema_completo_com_nginx.bat
echo.
pause 