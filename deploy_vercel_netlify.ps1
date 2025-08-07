# Script para Deploy Backend Vercel + Frontend Netlify
# Sistema de Ouvidoria Municipal - Venturosa

Write-Host "PREPARANDO DEPLOY: BACKEND VERCEL + FRONTEND NETLIFY" -ForegroundColor Green
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

# Criar arquivo vercel.json no backend
Write-Host "Criando vercel.json no backend..." -ForegroundColor Yellow
$backendVercelConfig = @'
{
  "version": 2,
  "builds": [
    {
      "src": "backend.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend.js"
    },
    {
      "src": "/(.*)",
      "dest": "/backend.js"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "DB_PATH": "./database/ouvidoria.db"
  }
}
'@

$backendVercelConfig | Out-File -FilePath "backend\vercel.json" -Encoding UTF8
Write-Host "vercel.json do backend criado!" -ForegroundColor Green

# Criar arquivo package.json no backend se nao existir
Write-Host "Verificando package.json do backend..." -ForegroundColor Yellow
if (-not (Test-Path "backend\package.json")) {
    $backendPackageJson = @'
{
  "name": "ouvidoria-backend",
  "version": "1.0.0",
  "description": "Backend Sistema de Ouvidoria",
  "main": "backend.js",
  "scripts": {
    "start": "node backend.js",
    "dev": "nodemon backend.js"
  },
  "dependencies": {
    "express": "^4.17.1",
    "cors": "^2.8.5",
    "sqlite3": "^5.0.2",
    "multer": "^1.4.3",
    "path": "^0.12.7"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
'@
    $backendPackageJson | Out-File -FilePath "backend\package.json" -Encoding UTF8
    Write-Host "package.json do backend criado!" -ForegroundColor Green
} else {
    Write-Host "package.json do backend ja existe!" -ForegroundColor Green
}

# Criar arquivo netlify.toml no frontend
Write-Host "Criando netlify.toml..." -ForegroundColor Yellow
$netlifyConfig = @'
[build]
  publish = "build"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "14"

[[redirects]]
  from = "/venturosa/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  REACT_APP_API_URL = "https://seu-backend.vercel.app"
'@

$netlifyConfig | Out-File -FilePath "frontend\netlify.toml" -Encoding UTF8
Write-Host "netlify.toml criado!" -ForegroundColor Green

# Criar arquivo .env no frontend
Write-Host "Criando .env no frontend..." -ForegroundColor Yellow
$envContent = @'
REACT_APP_API_URL=https://seu-backend.vercel.app
'@

$envContent | Out-File -FilePath "frontend\.env" -Encoding UTF8
Write-Host ".env criado!" -ForegroundColor Green

# Criar arquivo _redirects no frontend/public
Write-Host "Criando _redirects..." -ForegroundColor Yellow
$redirectsContent = @'
/venturosa/*    /index.html   200
/*             /index.html   200
'@

$redirectsContent | Out-File -FilePath "frontend\public\_redirects" -Encoding UTF8
Write-Host "_redirects criado!" -ForegroundColor Green

Write-Host ""
Write-Host "CONFIGURANDO DEPENDENCIAS" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Instalar dependencias do backend
Write-Host "Instalando dependencias do backend..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

# Instalar dependencias do frontend
Write-Host "Instalando dependencias do frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

Write-Host ""
Write-Host "PROXIMOS PASSOS MANUAIS" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. DEPLOY DO BACKEND NO VERCEL:" -ForegroundColor Cyan
Write-Host "   • Acesse: https://vercel.com" -ForegroundColor White
Write-Host "   • Faca login com GitHub" -ForegroundColor White
Write-Host "   • Clique em 'New Project'" -ForegroundColor White
Write-Host "   • Importe seu repositorio" -ForegroundColor White
Write-Host "   • Configure:" -ForegroundColor White
Write-Host "     Framework Preset: Node.js" -ForegroundColor Gray
Write-Host "     Root Directory: backend" -ForegroundColor Gray
Write-Host "     Build Command: npm install" -ForegroundColor Gray
Write-Host "     Output Directory: ." -ForegroundColor Gray
Write-Host "   • Adicione as variaveis de ambiente:" -ForegroundColor White
Write-Host "     NODE_ENV=production" -ForegroundColor Gray
Write-Host "     DB_PATH=./database/ouvidoria.db" -ForegroundColor Gray
Write-Host "   • Anote a URL do backend (ex: https://abc123.vercel.app)" -ForegroundColor White
Write-Host ""
Write-Host "2. ATUALIZAR URL DO BACKEND:" -ForegroundColor Cyan
Write-Host "   • Abra o arquivo: frontend\.env" -ForegroundColor White
Write-Host "   • Substitua 'seu-backend.vercel.app' pela URL real do Vercel" -ForegroundColor White
Write-Host "   • Abra o arquivo: frontend\netlify.toml" -ForegroundColor White
Write-Host "   • Substitua 'seu-backend.vercel.app' pela URL real do Vercel" -ForegroundColor White
Write-Host ""
Write-Host "3. DEPLOY DO FRONTEND NO NETLIFY:" -ForegroundColor Cyan
Write-Host "   • Acesse: https://netlify.com" -ForegroundColor White
Write-Host "   • Faca login com GitHub" -ForegroundColor White
Write-Host "   • Clique em 'New site from Git'" -ForegroundColor White
Write-Host "   • Conecte seu repositorio" -ForegroundColor White
Write-Host "   • Configure:" -ForegroundColor White
Write-Host "     Base directory: frontend" -ForegroundColor Gray
Write-Host "     Build command: npm run build" -ForegroundColor Gray
Write-Host "     Publish directory: build" -ForegroundColor Gray
Write-Host "   • Adicione a variavel de ambiente:" -ForegroundColor White
Write-Host "     REACT_APP_API_URL=https://sua-url-vercel.app" -ForegroundColor Gray
Write-Host ""
Write-Host "4. TESTAR O DEPLOY:" -ForegroundColor Cyan
Write-Host "   • Acesse a URL do Netlify + /venturosa" -ForegroundColor White
Write-Host "   • Teste os logins:" -ForegroundColor White
Write-Host "     Master: CPF 12345678900 / Senha admin123" -ForegroundColor Gray
Write-Host "     Secretaria: CPF 98765432100 / Senha secretaria123" -ForegroundColor Gray
Write-Host ""
Write-Host "5. CONFIGURAR DOMINIO CUSTOMIZADO (OPCIONAL):" -ForegroundColor Cyan
Write-Host "   • No Netlify: Settings > Domain management" -ForegroundColor White
Write-Host "   • No Vercel: Settings > Domains" -ForegroundColor White
Write-Host ""

Write-Host "DOCUMENTACAO COMPLETA:" -ForegroundColor Green
Write-Host "   • docs/DEPLOY_GRATUITO_GUIDE.md" -ForegroundColor White
Write-Host "   • docs/DEPLOY_NETLIFY_FRONTEND.md" -ForegroundColor White
Write-Host ""

Write-Host "PREPARACAO CONCLUIDA!" -ForegroundColor Green
Write-Host "Siga os passos acima para completar o deploy." -ForegroundColor Yellow 