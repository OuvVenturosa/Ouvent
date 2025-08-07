# =============================================
# INICIADOR DO SISTEMA CORRIGIDO
# =============================================

Write-Host "🚀 Iniciador do Sistema de Ouvidoria" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Verifica se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verifica se as dependências estão instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
}

# Menu de opções
Write-Host "`nEscolha uma opção:" -ForegroundColor Cyan
Write-Host "1. Iniciar Chatbot WhatsApp (Produção)" -ForegroundColor White
Write-Host "2. Testar QR Code" -ForegroundColor White
Write-Host "3. Iniciar Backend (Interface Web)" -ForegroundColor White
Write-Host "4. Iniciar Sistema Completo" -ForegroundColor White
Write-Host "5. Sair" -ForegroundColor White

$opcao = Read-Host "`nDigite sua opção (1-5)"

switch ($opcao) {
    "1" {
        Write-Host "`n🚀 Iniciando Chatbot WhatsApp..." -ForegroundColor Green
        Write-Host "📱 Aguardando QR Code..." -ForegroundColor Yellow
        node chat.js
    }
    "2" {
        Write-Host "`n🧪 Testando QR Code..." -ForegroundColor Green
        Write-Host "📱 Gerando QR Code para teste..." -ForegroundColor Yellow
        node test_qr.js
    }
    "3" {
        Write-Host "`n🌐 Iniciando Backend..." -ForegroundColor Green
        Write-Host "📊 Interface web disponível em: http://localhost:3001" -ForegroundColor Yellow
        node backend.js
    }
    "4" {
        Write-Host "`n🚀 Iniciando Sistema Completo..." -ForegroundColor Green
        Write-Host "📱 Chatbot WhatsApp + Interface Web" -ForegroundColor Yellow
        
        # Inicia o backend em background
        Start-Process -NoNewWindow -FilePath "node" -ArgumentList "backend.js"
        Start-Sleep -Seconds 3
        
        # Inicia o chatbot
        Write-Host "📱 Iniciando Chatbot..." -ForegroundColor Yellow
        node chat.js
    }
    "5" {
        Write-Host "`n👋 Saindo..." -ForegroundColor Green
        exit 0
    }
    default {
        Write-Host "`n❌ Opção inválida!" -ForegroundColor Red
        exit 1
    }
} 