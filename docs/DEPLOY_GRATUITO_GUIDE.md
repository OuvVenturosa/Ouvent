# 🚀 GUIA COMPLETO - DEPLOY GRATUITO DO SISTEMA DE OUVIDORIA

## 📋 Opções Gratuitas Disponíveis

### 🎯 **OPÇÃO 1: ngrok (Mais Simples - Temporário)**
**Custo:** Gratuito  
**Duração:** 2 horas por sessão  
**Ideal para:** Testes e demonstrações rápidas

### 🎯 **OPÇÃO 2: Vercel + Railway (Recomendado - Permanente)**
**Custo:** Gratuito  
**Duração:** Permanente  
**Ideal para:** Deploy profissional

### 🎯 **OPÇÃO 3: Netlify + Render**
**Custo:** Gratuito  
**Duração:** Permanente  
**Ideal para:** Alternativa ao Vercel

### 🎯 **OPÇÃO 4: Cloudflare Tunnel**
**Custo:** Gratuito  
**Duração:** Permanente  
**Ideal para:** Túnel seguro

---

## 🚀 OPÇÃO 1: ngrok (Mais Rápida)

### Passo 1: Instalar ngrok
```bash
# Baixar ngrok de: https://ngrok.com/download
# Extrair o arquivo ngrok.exe para a pasta do projeto
```

### Passo 2: Executar o Sistema
```powershell
# Executar sistema completo
.\executar_sistema_completo_com_nginx.ps1
```

### Passo 3: Criar Túnel Público
```bash
# Em um novo terminal, execute:
ngrok http 80

# Resultado será algo como:
# Forwarding    https://abc123.ngrok.io -> http://localhost:80
```

### Passo 4: Acessar Publicamente
- **URL Pública:** `https://abc123.ngrok.io/venturosa`
- **Login Master:** CPF `12345678900` / Senha `admin123`
- **Login Secretaria:** CPF `98765432100` / Senha `secretaria123`

### ⚠️ Limitações do ngrok:
- URL muda a cada reinicialização
- Sessão expira em 2 horas
- Limite de conexões simultâneas

---

## 🚀 OPÇÃO 2: Vercel + Railway (Recomendado)

### Passo 1: Preparar Frontend para Vercel

#### 1.1 Criar arquivo `vercel.json` no frontend:
```json
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
  ],
  "env": {
    "REACT_APP_API_URL": "https://seu-backend.railway.app"
  }
}
```

#### 1.2 Atualizar `frontend/package.json`:
```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "homepage": "https://seu-dominio.vercel.app/venturosa",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    // ... dependências existentes
  }
}
```

#### 1.3 Criar arquivo `.env` no frontend:
```env
REACT_APP_API_URL=https://seu-backend.railway.app
```

### Passo 2: Preparar Backend para Railway

#### 2.1 Criar `railway.json` na raiz:
```json
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
```

#### 2.2 Criar `Procfile` na raiz:
```
web: node backend/backend.js
```

#### 2.3 Atualizar `backend/backend.js` para suportar Railway:
```javascript
// Adicionar no início do arquivo
const PORT = process.env.PORT || 3001;

// Atualizar a linha de listen
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
```

### Passo 3: Deploy no Railway

#### 3.1 Criar conta no Railway:
1. Acesse: https://railway.app
2. Faça login com GitHub
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"

#### 3.2 Configurar variáveis de ambiente:
```env
NODE_ENV=production
PORT=3001
DB_PATH=./database/ouvidoria.db
```

#### 3.3 Deploy:
1. Conecte seu repositório GitHub
2. Selecione a pasta `backend/`
3. Clique em "Deploy"

### Passo 4: Deploy no Vercel

#### 4.1 Criar conta no Vercel:
1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em "New Project"
4. Importe seu repositório

#### 4.2 Configurar build:
- **Framework Preset:** Create React App
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `build`

#### 4.3 Configurar variáveis de ambiente:
```env
REACT_APP_API_URL=https://seu-backend.railway.app
```

### Passo 5: URLs Finais
- **Frontend:** `https://seu-dominio.vercel.app/venturosa`
- **Backend:** `https://seu-backend.railway.app`
- **API:** `https://seu-backend.railway.app/api`

---

## 🚀 OPÇÃO 3: Netlify + Render

### Passo 1: Preparar para Netlify

#### 1.1 Criar `netlify.toml` no frontend:
```toml
[build]
  publish = "build"
  command = "npm run build"

[[redirects]]
  from = "/venturosa/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 1.2 Deploy no Netlify:
1. Acesse: https://netlify.com
2. Faça login com GitHub
3. Clique em "New site from Git"
4. Selecione seu repositório
5. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `build`

### Passo 2: Deploy Backend no Render

#### 2.1 Criar `render.yaml` na raiz:
```yaml
services:
  - type: web
    name: ouvidoria-backend
    env: node
    buildCommand: npm install
    startCommand: node backend/backend.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
```

#### 2.2 Deploy no Render:
1. Acesse: https://render.com
2. Faça login com GitHub
3. Clique em "New Web Service"
4. Conecte seu repositório
5. Configure:
   - **Name:** ouvidoria-backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node backend/backend.js`

---

## 🚀 OPÇÃO 4: Cloudflare Tunnel

### Passo 1: Instalar Cloudflare Tunnel
```bash
# Baixar cloudflared de: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

### Passo 2: Configurar Tunnel
```bash
# Autenticar
cloudflared tunnel login

# Criar tunnel
cloudflared tunnel create ouvidoria-tunnel

# Configurar DNS
cloudflared tunnel route dns ouvidoria-tunnel seu-dominio.com
```

### Passo 3: Criar arquivo de configuração
```yaml
# config.yml
tunnel: [TUNNEL_ID]
credentials-file: /path/to/credentials.json

ingress:
  - hostname: seu-dominio.com
    service: http://localhost:80
  - service: http_status:404
```

### Passo 4: Executar Tunnel
```bash
# Executar o sistema primeiro
.\executar_sistema_completo_com_nginx.ps1

# Em outro terminal, executar o tunnel
cloudflared tunnel run ouvidoria-tunnel
```

---

## 🔧 Configurações Importantes

### CORS (Cross-Origin Resource Sharing)
Adicionar no `backend/backend.js`:
```javascript
app.use(cors({
    origin: [
        'https://seu-dominio.vercel.app',
        'https://seu-dominio.netlify.app',
        'http://localhost:3000'
    ],
    credentials: true
}));
```

### Variáveis de Ambiente
Criar arquivo `.env` na raiz:
```env
NODE_ENV=production
PORT=3001
DB_PATH=./database/ouvidoria.db
CORS_ORIGIN=https://seu-dominio.vercel.app
```

### Banco de Dados
Para deploy em nuvem, considere:
- **SQLite:** Funciona bem para Railway/Render
- **PostgreSQL:** Melhor para produção (Railway oferece)
- **MongoDB:** Alternativa gratuita

---

## 📊 Comparação das Opções

| Opção | Custo | Duração | Facilidade | URL Fixa |
|-------|-------|---------|------------|----------|
| ngrok | Gratuito | 2h | ⭐⭐⭐⭐⭐ | ❌ |
| Vercel+Railway | Gratuito | Permanente | ⭐⭐⭐⭐ | ✅ |
| Netlify+Render | Gratuito | Permanente | ⭐⭐⭐⭐ | ✅ |
| Cloudflare | Gratuito | Permanente | ⭐⭐⭐ | ✅ |

---

## 🎯 Recomendação Final

### Para Testes Rápidos:
**Use ngrok** - Mais simples e rápido

### Para Deploy Permanente:
**Use Vercel + Railway** - Melhor combinação de facilidade e recursos

### Para Alternativa:
**Use Netlify + Render** - Boa alternativa ao Vercel

---

## 🆘 Solução de Problemas

### Erro de CORS:
```javascript
// Adicionar no backend
app.use(cors({
    origin: true,
    credentials: true
}));
```

### Erro de Build:
```bash
# Limpar cache
npm cache clean --force
rm -rf node_modules
npm install
```

### Erro de Porta:
```javascript
// Usar variável de ambiente
const PORT = process.env.PORT || 3001;
```

### Erro de Banco de Dados:
```javascript
// Usar caminho relativo
const dbPath = process.env.DB_PATH || './database/ouvidoria.db';
```

---

## 📞 Próximos Passos

1. **Escolha uma opção** baseada na sua necessidade
2. **Siga os passos** específicos da opção escolhida
3. **Configure as variáveis** de ambiente
4. **Teste o acesso** público
5. **Configure SSL** se necessário

**Boa sorte com o deploy! 🚀** 