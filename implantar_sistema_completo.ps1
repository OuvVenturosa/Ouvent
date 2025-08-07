# Script de Implantação Completa - Sistema de Ouvidoria
# Vercel (Backend) + Netlify (Frontend)
# Prefeitura Municipal de Venturosa

Write-Host "🚀 IMPLANTAÇÃO COMPLETA - SISTEMA OUVIDORIA" -ForegroundColor Green
Write-Host "Vercel (Backend) + Netlify (Frontend)" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Verificar se Node.js está instalado
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "Instale o Node.js de: https://nodejs.org/" -ForegroundColor Yellow
    exit
}

# Verificar se npm está instalado
Write-Host "Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não encontrado!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🔧 PREPARANDO AMBIENTE" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Executar script de preparação
Write-Host "Executando script de preparação..." -ForegroundColor Yellow
if (Test-Path "deploy_vercel_netlify.ps1") {
    & .\deploy_vercel_netlify.ps1
} else {
    Write-Host "❌ Script de preparação não encontrado!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "📋 PASSO A PASSO PARA IMPLANTAÇÃO" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 DEPLOY DO BACKEND (Vercel)" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "1. Acesse: https://vercel.com" -ForegroundColor White
Write-Host "2. Faça login com GitHub" -ForegroundColor White
Write-Host "3. Clique em 'New Project'" -ForegroundColor White
Write-Host "4. Importe seu repositório" -ForegroundColor White
Write-Host "5. Configure:" -ForegroundColor White
Write-Host "   - Framework Preset: Node.js" -ForegroundColor White
Write-Host "   - Root Directory: backend" -ForegroundColor White
Write-Host "   - Build Command: npm install" -ForegroundColor White
Write-Host "   - Output Directory: ." -ForegroundColor White
Write-Host "6. Clique em 'Deploy'" -ForegroundColor White
Write-Host "7. Aguarde o build (2-3 minutos)" -ForegroundColor White
Write-Host "8. Anote a URL do backend" -ForegroundColor White

Write-Host ""
Write-Host "⚠️  VARIÁVEIS DE AMBIENTE (Vercel)" -ForegroundColor Yellow
Write-Host "Após o deploy, configure no painel do Vercel:" -ForegroundColor White
Write-Host "Settings → Environment Variables" -ForegroundColor White
Write-Host "NODE_ENV = production" -ForegroundColor White
Write-Host "DB_PATH = /tmp/ouvidoria.db" -ForegroundColor White
Write-Host "CORS_ORIGIN = *" -ForegroundColor White

Write-Host ""
Write-Host "🌐 DEPLOY DO FRONTEND (Netlify)" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "1. Acesse: https://netlify.com" -ForegroundColor White
Write-Host "2. Faça login com GitHub" -ForegroundColor White
Write-Host "3. Clique em 'New site from Git'" -ForegroundColor White
Write-Host "4. Conecte seu repositório" -ForegroundColor White
Write-Host "5. Configure:" -ForegroundColor White
Write-Host "   - Base directory: frontend" -ForegroundColor White
Write-Host "   - Build command: npm run build" -ForegroundColor White
Write-Host "   - Publish directory: build" -ForegroundColor White
Write-Host "6. Clique em 'Deploy site'" -ForegroundColor White
Write-Host "7. Aguarde o build (3-5 minutos)" -ForegroundColor White
Write-Host "8. Anote a URL do frontend" -ForegroundColor White

Write-Host ""
Write-Host "⚠️  VARIÁVEIS DE AMBIENTE (Netlify)" -ForegroundColor Yellow
Write-Host "Adicione a variável:" -ForegroundColor White
Write-Host "REACT_APP_API_URL = https://sua-url-vercel.app" -ForegroundColor White
Write-Host "Substitua pela URL real do seu backend!" -ForegroundColor Red

Write-Host ""
Write-Host "🔗 CONFIGURAÇÃO FINAL" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "1. Atualize frontend/.env com a URL do backend" -ForegroundColor White
Write-Host "2. Atualize frontend/netlify.toml com a URL do backend" -ForegroundColor White
Write-Host "3. Re-deploy o frontend no Netlify" -ForegroundColor White

Write-Host ""
Write-Host "🧪 TESTE COMPLETO" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "URLs de acesso:" -ForegroundColor White
Write-Host "- Frontend: https://seu-site.netlify.app/venturosa" -ForegroundColor White
Write-Host "- Backend: https://seu-backend.vercel.app/api/health" -ForegroundColor White

Write-Host ""
Write-Host "🔑 Credenciais de teste:" -ForegroundColor White
Write-Host "- Master: CPF 12345678900 / Senha admin123" -ForegroundColor White
Write-Host "- Secretaria: CPF 98765432100 / Senha secretaria123" -ForegroundColor White

Write-Host ""
Write-Host "📊 MONITORAMENTO" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "Vercel: Functions → View Function Logs" -ForegroundColor White
Write-Host "Netlify: Deploys → View deploy log" -ForegroundColor White

Write-Host ""
Write-Host "📚 DOCUMENTAÇÃO" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "- Guia Completo: PASSO_A_PASSO_IMPLANTACAO.md" -ForegroundColor White
Write-Host "- Deploy Vercel: DEPLOY_VERCEL_RAPIDO.md" -ForegroundColor White
Write-Host "- Deploy Netlify: DEPLOY_NETLIFY_FRONTEND.md" -ForegroundColor White

Write-Host ""
Write-Host "🎉 IMPLANTAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "Siga os passos acima para completar o deploy." -ForegroundColor White
Write-Host ""
Write-Host "🏛️ Sistema de Ouvidoria Municipal - Venturosa" -ForegroundColor Green 