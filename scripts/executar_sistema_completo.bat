@echo off
chcp 65001 >nul
title Sistema Completo - Ouvidoria

echo.
echo ============================================
echo    EXECUTOR DO SISTEMA COMPLETO
echo ============================================
echo.

REM Verifica se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Instale o Node.js primeiro.
    echo Baixe em: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
echo.

REM Verifica se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências principais...
    npm install
)

REM Verifica se as dependências do frontend estão instaladas
if not exist "frontend\node_modules" (
    echo 📦 Instalando dependências do frontend...
    cd frontend
    npm install
    cd ..
)

REM Encerra processos existentes nas portas
echo 🔄 Encerrando processos existentes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /PID %%a /F >nul 2>&1

echo.
echo 🚀 Iniciando Sistema Completo...
echo.

REM Inicia o Backend
echo [1/4] Iniciando Backend (Node.js)...
start "Backend - Ouvidoria" cmd /k "echo 🌐 Backend iniciado em http://localhost:3001 && node backend/backend.js"

REM Aguarda 3 segundos
echo [2/4] Aguardando 3 segundos...
timeout /t 3 /nobreak >nul

REM Inicia o Frontend
echo [3/4] Iniciando Frontend (React)...
cd frontend
start "Frontend - Ouvidoria" cmd /k "echo 🌐 Frontend iniciado em http://localhost:3000 && npm start"
cd ..

REM Aguarda 5 segundos
echo [4/4] Aguardando 5 segundos para estabilização...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo    SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo.
echo 🌐 URLs de Acesso:
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo URL Principal: http://ouvadmin/venturosa
echo.
echo 👤 LOGINS DE TESTE:
echo Master: CPF 12345678900 / Senha admin123
echo Secretaria: CPF 98765432100 / Senha secretaria123
echo.
echo 📱 PARA INICIAR O WHATSAPP (OPCIONAL):
echo Execute em um novo terminal: node chat.js
echo.
echo 🔄 PARA FINALIZAR O SISTEMA:
echo Execute: fechar_sistema_completo.bat
echo.
echo Pressione qualquer tecla para sair...
pause >nul 