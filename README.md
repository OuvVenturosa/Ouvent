# 🤖 Sistema de Ouvidoria Municipal - Venturosa

## 📁 Estrutura do Projeto

```
CHATBOT OUV/
├── 📁 scripts/           # Scripts de inicialização e execução
├── 📁 config/            # Arquivos de configuração
├── 📁 database/          # Banco de dados
├── 📁 logs/              # Logs do sistema
├── 📁 temp/              # Arquivos temporários
├── 📁 docs/              # Documentação
├── 📁 backend/           # Servidor backend
├── 📁 frontend/          # Aplicação React
├── 📁 assets/            # Recursos estáticos
├── 📁 anexos/            # Anexos de mensagens
├── 📄 chat.js            # Código principal do chatbot
└── 📄 .gitignore         # Configuração do Git
```

## 🚀 Como Executar

### 🌐 **DEPLOY PÚBLICO GRATUITO (Recomendado)**

#### 🥇 Opção 1: ngrok (Mais Rápido - 5 minutos)
```powershell
# Baixar ngrok de: https://ngrok.com/download
# Executar sistema
.\scripts\executar_sistema_completo_com_nginx.ps1
# Em novo terminal: ngrok http 80
# URL pública: https://abc123.ngrok.io/venturosa
```

#### 🥈 Opção 2: Deploy na Vercel (Backend) e Netlify (Frontend)

##### Backend (Vercel)
```bash
# Navegar até a pasta do backend
cd backend

# Instalar Vercel CLI (se ainda não tiver)
npm install -g vercel

# Fazer login na Vercel
vercel login

# Deploy do backend
vercel
```

O projeto já possui um arquivo `vercel.json` configurado com as seguintes definições:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api.js"
    },
    {
      "src": "/(.*)",
      "dest": "/api.js"
    }
  ]
}
```

##### Frontend (Netlify)
```bash
# Navegar até a pasta do frontend
cd frontend

# Instalar Netlify CLI (se ainda não tiver)
npm install -g netlify-cli

# Fazer login no Netlify
netlify login

# Build do frontend
npm run build

# Deploy do frontend
netlify deploy --prod
```

O projeto já possui um arquivo `netlify.toml` configurado com as seguintes definições:
```toml
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
```

**Importante:** 
1. Após o deploy, atualize a variável de ambiente `REACT_APP_API_URL` no dashboard do Netlify para apontar para a URL do seu backend na Vercel. Exemplo: `https://seu-backend.vercel.app`
2. O arquivo `setupProxy.js` no frontend é usado apenas para desenvolvimento local e não afeta o ambiente de produção:
```javascript
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
    })
  );
};
```

### 🏠 **EXECUÇÃO LOCAL**

#### 🟢 Iniciar o Sistema

##### Opção 1: Execução Completa com Nginx (Recomendado)
```powershell
# Executar sistema completo com nginx (inclui backend, frontend e servidor web)
.\scripts\executar_sistema_completo_com_nginx.ps1
```

##### Opção 2: Execução Completa sem Nginx
```powershell
# Executar sistema completo sem nginx (apenas backend e frontend)
.\scripts\executar_sistema_completo.ps1
```

##### Opção 3: Execução Simples
```powershell
# Executar sistema simples
.\iniciar_sistema_simples.ps1
```

##### Opção 4: Menu Interativo
```powershell
# Menu com opções
.\iniciar_sistema.ps1
```

##### Opção 5: Execução Manual (Componentes Separados)
```powershell
# Iniciar backend
.\scripts\iniciar_backend.js

# Iniciar frontend (em outro terminal)
cd frontend
npm start

# Iniciar nginx (opcional, em outro terminal)
.\scripts\iniciar_nginx_manual.ps1

# Iniciar chatbot (opcional, em outro terminal)
cd chatbot
node iniciar_chatbot.js
```

#### 🔴 Fechar o Sistema

##### Opção 1: Fechar Sistema Completo com Nginx
```powershell
# Fechar sistema completo com nginx (encerra todos os processos)
.\scripts\fechar_sistema_completo_com_nginx.ps1
```

##### Opção 2: Fechar Sistema Completo sem Nginx
```powershell
# Fechar sistema completo sem nginx
.\scripts\fechar_sistema_completo.ps1
```

##### Opção 3: Fechar Sistema Simples
```powershell
# Fechar sistema simples
.\scripts\fechar_sistema.ps1
```

##### Opção 4: Fechar Manualmente
```powershell
# Encerrar processos nas portas específicas
$processes3000 = netstat -ano | findstr :3000 | ForEach-Object { ($_ -split '\s+')[4] }
$processes3001 = netstat -ano | findstr :3001 | ForEach-Object { ($_ -split '\s+')[4] }
$processes80 = netstat -ano | findstr :80 | ForEach-Object { ($_ -split '\s+')[4] }

# Encerrar cada processo
foreach ($pid in $processes3000) { taskkill /PID $pid /F }
foreach ($pid in $processes3001) { taskkill /PID $pid /F }
foreach ($pid in $processes80) { taskkill /PID $pid /F }
```

## 📋 Scripts Disponíveis

### 🟢 Scripts de Inicialização
- `scripts\executar_sistema_completo_com_nginx.ps1` - Inicia todo o sistema com servidor web nginx
- `scripts\executar_sistema_completo.ps1` - Inicia o sistema sem nginx
- `iniciar_sistema_simples.ps1` - Inicia o sistema em modo simples
- `iniciar_sistema.ps1` - Menu interativo de inicialização
- `scripts\iniciar_backend.js` - Inicia apenas o backend
- `scripts\iniciar_whatsapp.js` - Inicia apenas o WhatsApp
- `scripts\iniciar_nginx_manual.ps1` - Inicia o nginx manualmente
- `chatbot\iniciar_chatbot.js` - Inicia apenas o chatbot

### 🔴 Scripts de Finalização
- `scripts\fechar_sistema_completo_com_nginx.ps1` - Encerra todo o sistema com nginx
- `scripts\fechar_sistema_completo.ps1` - Encerra o sistema sem nginx
- `scripts\fechar_sistema.ps1` - Encerra o sistema simples

### ⚙️ Scripts de Configuração
- `configurar_nginx.ps1` - Configura o nginx
- `preparar_nginx.ps1` - Prepara ambiente nginx
- `testar_nginx.ps1` - Testa configuração nginx
- `verificar_nginx.ps1` - Verifica status nginx

### 🛠️ Scripts Utilitários
- `cadastrar_master.js` - Cadastra usuário master
- `mostrar_urls.ps1` - Mostra URLs de acesso
- `deploy_vercel_netlify.ps1` - Deploy híbrido (Backend Vercel + Frontend Netlify)
- `deploy_vercel.ps1` - Deploy completo no Vercel

### 📚 Documentação
- `docs/GIT.md` - Guia de comandos Git para o projeto

## 🌐 URLs de Acesso

### 🌍 **ACESSO PÚBLICO (Internet)**
- **ngrok:** `https://abc123.ngrok.io/venturosa` (temporário)
- **Vercel + Netlify:** `https://seu-site.netlify.app/venturosa` (recomendado)
- **Vercel Completo:** `https://seu-dominio.vercel.app/venturosa` (permanente)
- **Netlify:** `https://seu-dominio.netlify.app/venturosa` (permanente)

### 🏠 **ACESSO LOCAL**
- **Principal:** http://localhost/venturosa
- **Alternativa:** http://127.0.0.1/venturosa

### 🌐 **REDE LOCAL**
- **Principal:** http://ouvadmin/venturosa
- **IP:** http://192.168.1.141/venturosa

### 🔧 **DESENVOLVIMENTO**
- **Frontend:** http://192.168.1.141:3000/venturosa
- **API:** http://192.168.1.141:3001/api/health

## 🚀 Deploy Público

### 🎯 **Opções de Deploy Disponíveis**

#### 1️⃣ **Vercel + Netlify (Recomendado)**
- **Backend:** Vercel (Node.js)
- **Frontend:** Netlify (React)
- **Vantagens:** Melhor performance, separação de responsabilidades
- **Script:** `.\deploy_vercel_netlify.ps1`

#### 2️⃣ **Vercel Completo**
- **Backend:** Vercel (Node.js)
- **Frontend:** Vercel (React)
- **Vantagens:** Tudo em uma plataforma
- **Script:** `.\deploy_vercel.ps1`

#### 3️⃣ **ngrok (Temporário)**
- **Uso:** Testes rápidos
- **Duração:** Sessão atual
- **Comando:** `ngrok http 80`

### 📋 **Passos para Deploy**

#### **Backend no Vercel:**
1. Acesse https://vercel.com
2. Faça login com GitHub
3. Clique em "New Project"
4. Importe seu repositório
5. Configure:
   - **Framework Preset:** Node.js
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Output Directory:** `.`
6. Adicione variáveis de ambiente:
   - `NODE_ENV=production`
   - `DB_PATH=N:\ouvidoria.db`

#### **Frontend no Netlify:**
1. Acesse https://netlify.com
2. Faça login com GitHub
3. Clique em "New site from Git"
4. Conecte seu repositório
5. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
6. Adicione variável de ambiente:
   - `REACT_APP_API_URL=https://sua-url-vercel.app`

### 🔗 **URLs Finais**
- **Frontend:** `https://seu-site.netlify.app/venturosa`
- **Backend:** `https://seu-backend.vercel.app`

### 🧪 **Credenciais de Teste**
- **Master:** CPF 12345678900 / Senha admin123
- **Secretaria:** CPF 98765432100 / Senha secretaria123

## 📚 Documentação

Toda a documentação está organizada na pasta `docs/`:

- **Guia Rápido:** `docs/GUIA_RAPIDO_EXECUCAO.md`
- **Manual Completo:** `docs/MANUAL_EXECUCAO_SISTEMA.md`
- **Configuração de Domínio:** `docs/DOMINIO_PUBLICO.md`
- **URLs de Acesso:** `docs/URLS_ACESSO.md`
- **Deploy Gratuito:** `docs/DEPLOY_GRATUITO_GUIDE.md`

## 🔧 Configuração

### Banco de Dados
- **Localização:** `N:\ouvidoria.db`
- **Tipo:** SQLite
- **Backup:** Automático

### Nginx
- **Configuração:** `config/nginx.conf`
- **Mime Types:** `config/mime.types`
- **Logs:** `logs/`

### Node.js
- **Package.json:** `config/package.json`
- **Dependências:** `node_modules/`

## 📱 Funcionalidades

### 🤖 Chatbot WhatsApp
- Atendimento automatizado
- Encaminhamento para secretarias
- Geração de protocolos
- Suporte a anexos

### 🏛️ Secretarias Atendidas
1. **Desenvolvimento Rural e Meio Ambiente**
2. **Assistência Social**
3. **Educação e Esporte**
4. **Infraestrutura e Segurança Pública**
5. **Saúde e Direitos da Mulher**
6. **Hospital e Maternidade**
7. **Programa Mulher Segura**
8. **Finanças (Tributos)**
9. **Administração (Servidores)**

### 📊 Relatórios
- Relatórios mensais automáticos
- Relatórios por protocolo
- Estatísticas de atendimento

## 🛡️ Segurança

- ✅ Autenticação de administradores
- ✅ Validação de dados
- ✅ Logs de auditoria
- ✅ Backup automático

## 📞 Suporte

### 🔧 **Problemas Comuns**

#### **Deploy no Vercel:**
- **Erro de build:** Verifique se o `package.json` está correto
- **Erro de dependências:** Execute `npm install` localmente
- **Erro de variáveis:** Configure as variáveis de ambiente

#### **Deploy no Netlify:**
- **Erro de build:** Verifique se o `netlify.toml` está correto
- **Erro de redirecionamento:** Verifique o arquivo `_redirects`
- **Erro de API:** Verifique se a URL do backend está correta

#### **Problemas Gerais:**
1. Verifique os logs em `logs/`
2. Consulte a documentação em `docs/`
3. Execute `.\scripts\verificar_nginx.ps1` para diagnóstico
4. Verifique se o banco de dados está acessível
5. Para problemas com Git, consulte o guia em `docs/GIT.md`

## 🔄 Manutenção

### Limpeza de Logs
```powershell
# Limpar logs antigos
Remove-Item "logs\*.log" -Force
```

### Backup do Banco
```powershell
# Fazer backup do banco
Copy-Item "database\ouvidoria.db" "database\ouvidoria_backup_$(Get-Date -Format 'yyyyMMdd').db"
```

### Atualização
```powershell
# Atualizar dependências
cd config
npm update
```

---

**Desenvolvido para a Prefeitura Municipal de Venturosa** 🏛️