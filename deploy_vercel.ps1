# Script para Deploy no Vercel + Railway
# Sistema de Ouvidoria Municipal - Venturosa

Write-Host "PREPARANDO DEPLOY NO VERCEL + RAILWAY" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Verificar se Node.js esta instalado
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js nao encontrado!" -ForegroundColor Red
    Write-Host "Instale o Node.js de: https://nodejs.org/" -ForegroundColor Yellow
    exit
}

# Verificar se npm esta instalado
Write-Host "Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm nao encontrado!" -ForegroundColor Red
    exit
}

# Verificar se Vercel CLI esta instalado
Write-Host "Verificando Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version
    Write-Host "Vercel CLI encontrado: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "Vercel CLI nao encontrado!" -ForegroundColor Yellow
    Write-Host "Instalando Vercel CLI..." -ForegroundColor Green
    npm install -g vercel
}

Write-Host ""
Write-Host "PREPARANDO ARQUIVOS PARA DEPLOY" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Criar arquivo vercel.json no frontend
Write-Host "Criando vercel.json..." -ForegroundColor Yellow
$vercelConfig = @'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/venturosa/(.*)",
      "dest": "/index.html"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
'@

$vercelConfig | Out-File -FilePath "frontend\vercel.json" -Encoding UTF8
Write-Host "vercel.json criado!" -ForegroundColor Green

# Criar arquivo railway.json na raiz
Write-Host "Criando railway.json..." -ForegroundColor Yellow
$railwayConfig = @'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node backend/backend.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
'@

$railwayConfig | Out-File -FilePath "railway.json" -Encoding UTF8
Write-Host "railway.json criado!" -ForegroundColor Green

# Criar Procfile
Write-Host "Criando Procfile..." -ForegroundColor Yellow
"web: node backend/backend.js" | Out-File -FilePath "Procfile" -Encoding UTF8
Write-Host "Procfile criado!" -ForegroundColor Green

# Criar arquivo .env no frontend
Write-Host "Criando .env no frontend..." -ForegroundColor Yellow
$envContent = @'
REACT_APP_API_URL=https://seu-backend.railway.app
'@

$envContent | Out-File -FilePath "frontend\.env" -Encoding UTF8
Write-Host ".env criado!" -ForegroundColor Green

Write-Host ""
Write-Host "CONFIGURANDO DEPENDENCIAS" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Instalar dependencias do frontend
Write-Host "Instalando dependencias do frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

# Instalar dependencias da raiz
Write-Host "Instalando dependencias da raiz..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "PROXIMOS PASSOS MANUAIS" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. DEPLOY NO RAILWAY (Backend):" -ForegroundColor Cyan
Write-Host "   • Acesse: https://railway.app" -ForegroundColor White
Write-Host "   • Faca login com GitHub" -ForegroundColor White
Write-Host "   • Clique em 'New Project'" -ForegroundColor White
Write-Host "   • Selecione 'Deploy from GitHub repo'" -ForegroundColor White
Write-Host "   • Conecte seu repositorio" -ForegroundColor White
Write-Host "   • Configure as variaveis de ambiente:" -ForegroundColor White
Write-Host "     NODE_ENV=production" -ForegroundColor Gray
Write-Host "     PORT=3001" -ForegroundColor Gray
Write-Host "     DB_PATH=./database/ouvidoria.db" -ForegroundColor Gray
Write-Host "   • Anote a URL do backend (ex: https://abc123.railway.app)" -ForegroundColor White
Write-Host ""
Write-Host "2. ATUALIZAR URL DO BACKEND:" -ForegroundColor Cyan
Write-Host "   • Abra o arquivo: frontend\.env" -ForegroundColor White
Write-Host "   • Substitua 'seu-backend.railway.app' pela URL real do Railway" -ForegroundColor White
Write-Host ""
Write-Host "3. DEPLOY NO VERCEL (Frontend):" -ForegroundColor Cyan
Write-Host "   • Acesse: https://vercel.com" -ForegroundColor White
Write-Host "   • Faca login com GitHub" -ForegroundColor White
Write-Host "   • Clique em 'New Project'" -ForegroundColor White
Write-Host "   • Importe seu repositorio" -ForegroundColor White
Write-Host "   • Configure:" -ForegroundColor White
Write-Host "     Framework Preset: Create React App" -ForegroundColor Gray
Write-Host "     Root Directory: frontend" -ForegroundColor Gray
Write-Host "     Build Command: npm run build" -ForegroundColor Gray
Write-Host "     Output Directory: build" -ForegroundColor Gray
Write-Host "   • Adicione a variavel de ambiente:" -ForegroundColor White
Write-Host "     REACT_APP_API_URL=https://sua-url-railway.app" -ForegroundColor Gray
Write-Host ""
Write-Host "4. TESTAR O DEPLOY:" -ForegroundColor Cyan
Write-Host "   • Acesse a URL do Vercel + /venturosa" -ForegroundColor White
Write-Host "   • Teste os logins:" -ForegroundColor White
Write-Host "     Master: CPF 12345678900 / Senha admin123" -ForegroundColor Gray
Write-Host "     Secretaria: CPF 98765432100 / Senha secretaria123" -ForegroundColor Gray
Write-Host ""

Write-Host "DOCUMENTACAO COMPLETA:" -ForegroundColor Green
Write-Host "   • docs/DEPLOY_GRATUITO_GUIDE.md" -ForegroundColor White
Write-Host ""

Write-Host "PREPARACAO CONCLUIDA!" -ForegroundColor Green
Write-Host "Siga os passos acima para completar o deploy." -ForegroundColor Yellow 