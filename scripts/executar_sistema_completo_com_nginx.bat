@echo off
chcp 65001 >nul
echo ============================================
echo EXECUTOR DO SISTEMA COMPLETO COM NGINX
echo ============================================
echo.

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado. Instale o Node.js primeiro.
    pause
    exit /b 1
)
echo Node.js encontrado.

echo.
echo Encerrando processos existentes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :80') do taskkill /PID %%a /F >nul 2>&1
echo Processos encerrados.

echo.
echo Parando Nginx se estiver rodando...
if exist "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe" (
    "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe" -s stop >nul 2>&1
    timeout /t 2 >nul
    echo Nginx parado.
)

echo.
echo Iniciando Sistema Completo com Nginx...
echo.

echo [1/4] Iniciando Backend...
start "Backend - Ouvidoria" cmd /k "echo Backend iniciado em http://localhost:3001 && node backend/backend.js"

echo [2/4] Aguardando 3 segundos...
timeout /t 3 >nul

echo [3/4] Iniciando Frontend...
cd frontend
start "Frontend - Ouvidoria" cmd /k "echo Frontend iniciado em http://localhost:3000 && npm start"
cd ..

echo [4/4] Aguardando 5 segundos...
timeout /t 5 >nul

echo [5/5] Iniciando Nginx...
if exist "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe" (
    if not exist "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\conf\nginx.conf" (
    copy "config\nginx.conf" "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\conf\nginx.conf" >nul
        echo Configuracao do Nginx copiada.
    )
    start "" "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe"
    timeout /t 3 >nul
    echo Nginx iniciado.
) else (
    echo ATENCAO: Nginx nao encontrado.
    echo Instale o Nginx ou ajuste o caminho no script.
)

echo.
echo ========================================
echo    SISTEMA COMPLETO INICIADO!
echo ========================================
echo.
echo URLs de Acesso:
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo URL Principal: http://ouvadmin/venturosa
echo URL Nginx: http://localhost
echo.
echo LOGINS DE TESTE:
echo Master: CPF 12345678900 / Senha admin123
echo Secretaria: CPF 98765432100 / Senha secretaria123
echo.
echo PARA INICIAR O WHATSAPP (OPCIONAL):
echo Execute em um novo terminal: node chat.js
echo.
echo PARA FINALIZAR O SISTEMA COMPLETO:
echo Execute: fechar_sistema_completo_com_nginx.bat
echo.
pause 