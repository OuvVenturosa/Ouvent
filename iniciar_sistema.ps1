# =============================================
# INICIADOR PRINCIPAL DO SISTEMA
# =============================================

Write-Host "🤖 SISTEMA DE OUVIDORIA MUNICIPAL - VENTUROSA" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

Write-Host "📁 Estrutura Organizada:" -ForegroundColor Cyan
Write-Host "├── scripts/     - Scripts de execução" -ForegroundColor Gray
Write-Host "├── config/      - Configurações" -ForegroundColor Gray
Write-Host "├── database/    - Banco de dados" -ForegroundColor Gray
Write-Host "├── docs/        - Documentação" -ForegroundColor Gray
Write-Host "├── backend/     - Servidor backend" -ForegroundColor Gray
Write-Host "└── frontend/    - Aplicação React" -ForegroundColor Gray
Write-Host ""

Write-Host "🚀 Opções de Inicialização:" -ForegroundColor Yellow
Write-Host "1. Sistema Completo (Recomendado)" -ForegroundColor White
Write-Host "2. Sistema Simples" -ForegroundColor White
Write-Host "3. Apenas Backend" -ForegroundColor White
Write-Host "4. Apenas Frontend" -ForegroundColor White
Write-Host "5. Apenas WhatsApp" -ForegroundColor White
Write-Host "6. Verificar Status" -ForegroundColor White
Write-Host "7. Sair" -ForegroundColor White
Write-Host ""

$opcao = Read-Host "Escolha uma opção (1-7)"

switch ($opcao) {
    "1" {
        Write-Host "Iniciando Sistema Completo..." -ForegroundColor Green
        & ".\scripts\executar_sistema_completo_com_nginx.ps1"
    }
    "2" {
        Write-Host "Iniciando Sistema Simples..." -ForegroundColor Green
        & ".\scripts\executar_sistema_completo.ps1"
    }
    "3" {
        Write-Host "Iniciando Apenas Backend..." -ForegroundColor Green
        & ".\scripts\iniciar_backend.js"
    }
    "4" {
        Write-Host "Iniciando Apenas Frontend..." -ForegroundColor Green
        Set-Location frontend
        npm start
        Set-Location ..
    }
    "5" {
        Write-Host "Iniciando Apenas WhatsApp..." -ForegroundColor Green
        & ".\scripts\iniciar_whatsapp.js"
    }
    "6" {
        Write-Host "Verificando Status..." -ForegroundColor Green
        & ".\config\verificar_nginx.ps1"
    }
    "7" {
        Write-Host "Saindo..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Opção inválida!" -ForegroundColor Red
        Read-Host "Pressione Enter para continuar"
    }
}

Write-Host ""
Write-Host "✅ Sistema iniciado com sucesso!" -ForegroundColor Green
Write-Host "📱 Acesse: http://ouvadmin/venturosa" -ForegroundColor Cyan
Write-Host "📚 Documentação: docs/" -ForegroundColor Cyan 