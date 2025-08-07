@echo off
chcp 65001 >nul
echo.
echo ============================================
echo    INICIADOR DO SISTEMA COMPLETO
echo ============================================
echo.

REM Verifica se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Instale o Node.js primeiro.
    pause
    exit /b 1
)

REM Verifica se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
)

REM Encerra processos existentes
echo 🛑 Encerrando processos existentes...
taskkill /f /im node.exe >nul 2>&1

echo.
echo 🚀 Iniciando Sistema Completo...
echo.

REM Inicia o sistema completo
node iniciar_sistema_completo.js

pause 