# 🚀 GUIA COMPLETO - IMPLANTAÇÃO SISTEMA OUVIDORIA
## Vercel (Backend) + Netlify (Frontend)

---

## 📋 PRÉ-REQUISITOS

### ✅ Contas Necessárias
- [GitHub](https://github.com) - Para repositório
- [Vercel](https://vercel.com) - Para backend
- [Netlify](https://netlify.com) - Para frontend

### ✅ Ferramentas Locais
- Node.js (versão 14 ou superior)
- npm ou yarn
- Git

---

## 🔧 PREPARAÇÃO INICIAL

### 1️⃣ Executar Script de Preparação
```powershell
# Execute o script de preparação
.\deploy_vercel_netlify.ps1
```

Este script irá:
- ✅ Verificar dependências
- ✅ Criar arquivos de configuração
- ✅ Instalar dependências
- ✅ Preparar ambiente

### 2️⃣ Verificar Estrutura dos Arquivos
```
backend/
├── api.js              # API principal
├── vercel.json         # Configuração Vercel
├── package.json        # Dependências
└── ouvidoria.db       # Banco de dados

frontend/
├── netlify.toml        # Configuração Netlify
├── .env                # Variáveis de ambiente
├── public/_redirects   # Redirecionamentos SPA
└── package.json        # Dependências React
```

---

## 🚀 DEPLOY DO BACKEND (Vercel)

### 1️⃣ Acessar Vercel
1. Acesse: https://vercel.com
2. Faça login com sua conta GitHub
3. Clique em **"New Project"**

### 2️⃣ Importar Repositório
1. Selecione **"Import Git Repository"**
2. Escolha seu repositório do GitHub
3. Clique em **"Import"**

### 3️⃣ Configurar Projeto Backend
Configure as seguintes opções:

| Campo | Valor |
|-------|-------|
| **Framework Preset** | `Node.js` |
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Output Directory** | `.` |
| **Install Command** | `npm install` |

### 4️⃣ Variáveis de Ambiente (Vercel)
**⚠️ IMPORTANTE:** Configure estas variáveis no painel do Vercel após o deploy.

No Vercel, vá em **Settings** → **Environment Variables** e adicione:

| Nome | Valor |
|------|-------|
| `NODE_ENV` | `production` |
| `DB_PATH` | `./ouvidoria.db` |
| `PORT` | `3001` |

### 5️⃣ Deploy Backend
1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. **Anote a URL gerada** (ex: `https://abc123.vercel.app`)

### 6️⃣ Testar Backend
Acesse: `https://sua-url-vercel.app/api/health`
Deve retornar: `{"status":"OK","message":"API da Ouvidoria funcionando"}`

---

## 🌐 DEPLOY DO FRONTEND (Netlify)

### 1️⃣ Acessar Netlify
1. Acesse: https://netlify.com
2. Faça login com sua conta GitHub
3. Clique em **"New site from Git"**

### 2️⃣ Conectar Repositório
1. Escolha **"GitHub"**
2. Selecione seu repositório
3. Clique em **"Connect"**

### 3️⃣ Configurar Build Frontend
Configure as seguintes opções:

| Campo | Valor |
|-------|-------|
| **Base directory** | `frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `build` |

### 4️⃣ Variáveis de Ambiente (Netlify)
Adicione a variável:

| Nome | Valor |
|------|-------|
| `REACT_APP_API_URL` | `https://sua-url-vercel.app` |

**⚠️ IMPORTANTE:** Substitua `sua-url-vercel.app` pela URL real do seu backend no Vercel.

### 5️⃣ Deploy Frontend
1. Clique em **"Deploy site"**
2. Aguarde o build (3-5 minutos)
3. **Anote a URL gerada** (ex: `https://abc123.netlify.app`)

---

## 🔗 CONFIGURAÇÃO FINAL

### 1️⃣ Atualizar URLs
Após ambos os deploys, atualize os arquivos:

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
1. No Netlify, vá em **"Deploys"**
2. Clique em **"Trigger deploy"** > **"Deploy site"**
3. Aguarde o novo build

---

## 🧪 TESTANDO O DEPLOY

### 1️⃣ URLs de Acesso
- **Frontend:** `https://seu-site.netlify.app/venturosa`
- **Backend:** `https://seu-backend.vercel.app`

### 2️⃣ Credenciais de Teste
- **Master:** CPF `12345678900` / Senha `admin123`
- **Secretaria:** CPF `98765432100` / Senha `secretaria123`

### 3️⃣ Funcionalidades para Testar
- ✅ Login de administradores
- ✅ Listagem de demandas
- ✅ Detalhes de protocolos
- ✅ Editor de respostas
- ✅ Estatísticas
- ✅ Exportação de dados

---

## 🔧 TROUBLESHOOTING

### ❌ Problemas Comuns

#### **Erro de Build no Vercel:**
```
Error: Cannot find module 'express'
```
**Solução:** Verifique se o `package.json` do backend está correto.

#### **Erro de Configuração Vercel:**
```
Invalid backend/vercel.json file provided
```
**Solução:** Execute novamente o script de preparação.

#### **Erro de Build no Netlify:**
```
Error: REACT_APP_API_URL is not defined
```
**Solução:** Configure a variável de ambiente no Netlify.

#### **Erro de CORS:**
```
Access to fetch at 'https://backend.vercel.app' from origin 'https://frontend.netlify.app' has been blocked
```
**Solução:** Verifique se a URL do backend está correta no frontend.

#### **Erro de Redirecionamento:**
```
404 Not Found
```
**Solução:** Verifique se o arquivo `_redirects` está correto.

### 🔍 Verificações

#### **Backend (Vercel):**
1. Acesse: `https://seu-backend.vercel.app/api/health`
2. Deve retornar: `{"status":"ok"}`

#### **Frontend (Netlify):**
1. Acesse: `https://seu-site.netlify.app/venturosa`
2. Deve carregar a página de login

---

## 📊 MONITORAMENTO

### 🔍 Logs do Vercel
1. Acesse seu projeto no Vercel
2. Vá em **"Functions"** > **"View Function Logs"**

### 🔍 Logs do Netlify
1. Acesse seu site no Netlify
2. Vá em **"Deploys"** > **"View deploy log"**

---

## 🚀 OTIMIZAÇÕES

### ⚡ Performance
- **Vercel:** CDN global automático
- **Netlify:** CDN global automático
- **Cache:** Configurado automaticamente

### 🔒 Segurança
- **HTTPS:** Automático em ambas plataformas
- **Headers:** Configurados automaticamente
- **CORS:** Configurado no backend

---

## 📞 SUPORTE

### 🆘 Problemas Técnicos
1. Verifique os logs em cada plataforma
2. Consulte a documentação oficial:
   - [Vercel Docs](https://vercel.com/docs)
   - [Netlify Docs](https://docs.netlify.com)
3. Execute o script de diagnóstico: `.\scripts\verificar_nginx.ps1`

### 📚 Documentação Adicional
- **Guia Completo:** `docs/DEPLOY_GRATUITO_GUIDE.md`
- **Deploy Vercel:** `DEPLOY_VERCEL_RAPIDO.md`
- **Deploy Netlify:** `DEPLOY_NETLIFY_FRONTEND.md`

---

## 🎉 CONCLUSÃO

Após seguir todos os passos, você terá:
- ✅ Backend rodando no Vercel
- ✅ Frontend rodando no Netlify
- ✅ Sistema totalmente funcional
- ✅ URLs públicas acessíveis
- ✅ Performance otimizada

**🏛️ Sistema de Ouvidoria Municipal - Deploy Concluído!**

---

**Desenvolvido para a Prefeitura Municipal de Venturosa** 🏛️ 