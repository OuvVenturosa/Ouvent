# 🚀 INSTRUÇÕES RÁPIDAS - IMPLANTAÇÃO SISTEMA OUVIDORIA

## 📋 RESUMO EXECUTIVO

**Objetivo:** Implantar o Sistema de Ouvidoria Municipal usando:
- **Backend:** Vercel (Node.js + Express)
- **Frontend:** Netlify (React)

---

## 🔧 PREPARAÇÃO (2 minutos)

### 1️⃣ Executar Script de Preparação
```powershell
.\implantar_sistema_vercel_netlify.ps1
```

### 2️⃣ Verificar Arquivos Criados
- ✅ `backend/vercel.json` - Configuração Vercel
- ✅ `frontend/netlify.toml` - Configuração Netlify
- ✅ `frontend/.env` - Variáveis de ambiente
- ✅ `frontend/public/_redirects` - Redirecionamentos

---

## 🚀 DEPLOY BACKEND (Vercel) - 5 minutos

### 1️⃣ Acessar Vercel
- URL: https://vercel.com
- Login com GitHub

### 2️⃣ Criar Projeto
- Clique em **"New Project"**
- Importe seu repositório GitHub

### 3️⃣ Configurar
| Campo | Valor |
|-------|-------|
| **Framework Preset** | `Node.js` |
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Output Directory** | `.` |

### 4️⃣ Deploy
- Clique em **"Deploy"**
- Aguarde 2-3 minutos
- **Anote a URL** (ex: `https://abc123.vercel.app`)

### 5️⃣ Variáveis de Ambiente
No painel do Vercel: **Settings** → **Environment Variables**
```
NODE_ENV = production
DB_PATH = ./ouvidoria.db
PORT = 3001
```

---

## 🌐 DEPLOY FRONTEND (Netlify) - 5 minutos

### 1️⃣ Acessar Netlify
- URL: https://netlify.com
- Login com GitHub

### 2️⃣ Criar Site
- Clique em **"New site from Git"**
- Conecte seu repositório GitHub

### 3️⃣ Configurar
| Campo | Valor |
|-------|-------|
| **Base directory** | `frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `build` |

### 4️⃣ Deploy
- Clique em **"Deploy site"**
- Aguarde 3-5 minutos
- **Anote a URL** (ex: `https://abc123.netlify.app`)

### 5️⃣ Variáveis de Ambiente
No painel do Netlify: **Site settings** → **Environment variables**
```
REACT_APP_API_URL = https://sua-url-vercel.app
```
**⚠️ IMPORTANTE:** Substitua pela URL real do seu backend!

---

## 🔗 CONFIGURAÇÃO FINAL (2 minutos)

### 1️⃣ Atualizar URLs
Edite os arquivos com a URL real do backend:

#### **frontend/.env**
```env
REACT_APP_API_URL=https://sua-url-vercel.app
```

#### **frontend/netlify.toml**
```toml
[context.production.environment]
  REACT_APP_API_URL = "https://sua-url-vercel.app"
```

### 2️⃣ Re-deploy Frontend
- No Netlify: **Deploys** → **Trigger deploy**
- Aguarde o novo build

---

## 🧪 TESTE RÁPIDO

### URLs de Acesso
- **Frontend:** `https://seu-site.netlify.app/venturosa`
- **Backend:** `https://seu-backend.vercel.app/api/health`

### Credenciais de Teste
- **Master:** CPF `12345678900` / Senha `admin123`
- **Secretaria:** CPF `98765432100` / Senha `secretaria123`

### Funcionalidades para Testar
- ✅ Login de administradores
- ✅ Listagem de demandas
- ✅ Detalhes de protocolos
- ✅ Editor de respostas
- ✅ Estatísticas

---

## 🔧 TROUBLESHOOTING RÁPIDO

### ❌ Problemas Comuns

| Erro | Solução |
|------|---------|
| `Invalid backend/vercel.json` | Execute `.\deploy_vercel_netlify.ps1` |
| `Cannot find module 'express'` | Verifique `backend/package.json` |
| `REACT_APP_API_URL is not defined` | Configure variável no Netlify |
| `404 Not Found` | Verifique arquivo `_redirects` |
| `CORS error` | Verifique URL do backend no frontend |

### 🔍 Verificações Rápidas
1. **Backend:** `https://seu-backend.vercel.app/api/health`
2. **Frontend:** `https://seu-site.netlify.app/venturosa`

---

## 📊 MONITORAMENTO

### Logs
- **Vercel:** Functions → View Function Logs
- **Netlify:** Deploys → View deploy log

### Performance
- **CDN:** Automático em ambas plataformas
- **HTTPS:** Automático
- **Cache:** Configurado automaticamente

---

## 🎉 CONCLUSÃO

**Tempo Total Estimado:** 15 minutos

Após seguir estas instruções, você terá:
- ✅ Backend rodando no Vercel
- ✅ Frontend rodando no Netlify
- ✅ Sistema totalmente funcional
- ✅ URLs públicas acessíveis
- ✅ Performance otimizada

**🏛️ Sistema de Ouvidoria Municipal - Deploy Concluído!**

---

**Documentação Completa:** `GUIA_IMPLANTACAO_VERCEL_NETLIFY.md`
**Script de Automação:** `implantar_sistema_vercel_netlify.ps1`

**Desenvolvido para a Prefeitura Municipal de Venturosa** 🏛️ 