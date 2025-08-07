@echo off
chcp 65001 >nul
title Sistema de Ouvidoria

echo.
echo ============================================
echo    INICIADOR DO SISTEMA DE OUVIDORIA
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
    echo 📦 Instalando dependências...
    npm install
    echo.
)

:menu
echo Escolha uma opção:
echo 1. Iniciar Chatbot WhatsApp (Produção)
echo 2. Testar QR Code
echo 3. Iniciar Backend (Interface Web)
echo 4. Iniciar Sistema Completo
echo 5. Sair
echo.
set /p opcao="Digite sua opção (1-5): "

if "%opcao%"=="1" goto chatbot
if "%opcao%"=="2" goto testqr
if "%opcao%"=="3" goto backend
if "%opcao%"=="4" goto completo
if "%opcao%"=="5" goto sair
echo ❌ Opção inválida!
pause
goto menu

:chatbot
echo.
echo 🚀 Iniciando Chatbot WhatsApp...
echo 📱 Aguardando QR Code...
node chat.js
goto fim

:testqr
echo.
echo 🧪 Testando QR Code...
echo 📱 Gerando QR Code para teste...
node test_qr.js
goto fim

:backend
echo.
echo 🌐 Iniciando Backend...
echo 📊 Interface web disponível em: http://localhost:3001
node backend.js
goto fim

:completo
echo.
echo 🚀 Iniciando Sistema Completo...
echo 📱 Chatbot WhatsApp + Interface Web
start /b node backend.js
timeout /t 3 /nobreak >nul
echo 📱 Iniciando Chatbot...
node chat.js
goto fim

:sair
echo.
echo 👋 Saindo...
exit /b 0

:fim
pause 
