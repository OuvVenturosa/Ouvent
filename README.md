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

#### 🥈 Opção 2: Deploy na Vercel (Backend) e Netlify (Frontend) - RECOMENDADO

##### Preparação Inicial

1. Certifique-se de ter uma conta no [GitHub](https://github.com), [Vercel](https://vercel.com) e [Netlify](https://netlify.com)
2. Faça upload do seu código para um repositório GitHub
3. Verifique se os arquivos de configuração estão presentes:
   - `backend/vercel.json`
   - `frontend/netlify.toml`

##### Backend (Vercel)

**Método 1: Deploy via Dashboard (Recomendado)**

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Importe seu repositório GitHub
4. Configure o projeto:
   - **Framework Preset:** Node.js
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Output Directory:** `.`
5. Configure as variáveis de ambiente:
   - `NODE_ENV=production`
   - `DB_PATH=/tmp/ouvidoria.db` (para persistência temporária)
   - `CORS_ORIGIN=*` (ou o domínio específico do seu frontend)
6. Clique em "Deploy"

**Método 2: Deploy via CLI**

```bash
# Navegar até a pasta do backend
cd backend

# Instalar Vercel CLI (se ainda não tiver)
npm install -g vercel

# Fazer login na Vercel
vercel login

# Deploy do backend
vercel --prod
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

**Método 1: Deploy via Dashboard (Recomendado)**

1. Acesse [netlify.com](https://netlify.com) e faça login
2. Clique em "New site from Git"
3. Selecione seu repositório GitHub
4. Configure o projeto:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
5. Configure as variáveis de ambiente:
   - `REACT_APP_API_URL=https://seu-backend.vercel.app` (URL do seu backend na Vercel)
   - `NODE_VERSION=16` (ou versão mais recente)
6. Clique em "Deploy site"

**Método 2: Deploy via CLI**

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
  NODE_VERSION = "16"

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
1. Após o deploy, verifique se a variável de ambiente `REACT_APP_API_URL` no dashboard do Netlify está apontando para a URL correta do seu backend na Vercel. Exemplo: `https://seu-backend.vercel.app`
2. Teste a conexão entre frontend e backend acessando a URL do frontend e verificando se ele consegue se comunicar com o backend.
3. O arquivo `setupProxy.js` no frontend é usado apenas para desenvolvimento local e não afeta o ambiente de produção:
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

##### Verificação e Monitoramento

1. **Verificar Backend:**
   - Acesse `https://seu-backend.vercel.app/api/health`
   - Deve retornar `{"status":"ok"}`

2. **Verificar Frontend:**
   - Acesse `https://seu-site.netlify.app/venturosa`
   - Deve carregar a página de login

3. **Monitoramento:**
   - **Vercel:** Dashboard > seu-projeto > Functions > Logs
   - **Netlify:** Dashboard > seu-site > Deploys > Deploy log

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
- **Vantagens:** Melhor performance, separação de responsabilidades, CI/CD automático
- **Limitações gratuitas:** 
  - Vercel: 100GB de banda/mês, 100 horas de execução serverless/mês
  - Netlify: 100GB de banda/mês, 300 minutos de build/mês

#### 2️⃣ **Vercel Completo**
- **Backend:** Vercel (Node.js)
- **Frontend:** Vercel (React)
- **Vantagens:** Tudo em uma plataforma, configuração simplificada
- **Limitações gratuitas:** 100GB de banda/mês, 100 horas de execução serverless/mês

#### 3️⃣ **ngrok (Temporário)**
- **Uso:** Testes rápidos, demonstrações, desenvolvimento
- **Duração:** Sessão atual (plano gratuito)
- **Comando:** `ngrok http 80`
- **Limitações gratuitas:** URL muda a cada reinicialização, 2 horas de sessão

### 📋 **Passos Detalhados para Deploy**

#### **Backend no Vercel:**

1. **Preparação do Código:**
   - Verifique se `backend/vercel.json` está configurado corretamente
   - Certifique-se que `package.json` tem todas as dependências necessárias
   - Remova qualquer referência a caminhos locais no código

2. **Deploy via Dashboard:**
   - Acesse https://vercel.com e faça login
   - Clique em "New Project" e importe seu repositório GitHub
   - Configure:
     - **Framework Preset:** Node.js
     - **Root Directory:** `backend`
     - **Build Command:** `npm install`
     - **Output Directory:** `.`
   - Em "Environment Variables", adicione:
     - `NODE_ENV=production`
     - `DB_PATH=/tmp/ouvidoria.db` (para persistência temporária)
     - `CORS_ORIGIN=*` (ou domínio específico do frontend)
   - Clique em "Deploy"

3. **Verificação Pós-Deploy:**
   - Teste a API: `https://seu-backend.vercel.app/api/health`
   - Verifique os logs no Dashboard do Vercel
   - Anote a URL para configurar o frontend

#### **Frontend no Netlify:**

1. **Preparação do Código:**
   - Verifique se `frontend/netlify.toml` está configurado corretamente
   - Atualize `package.json` se necessário
   - Remova qualquer referência a URLs locais no código

2. **Deploy via Dashboard:**
   - Acesse https://netlify.com e faça login
   - Clique em "New site from Git" e selecione seu repositório
   - Configure:
     - **Base directory:** `frontend`
     - **Build command:** `npm run build`
     - **Publish directory:** `build`
   - Em "Environment variables", adicione:
     - `REACT_APP_API_URL=https://seu-backend.vercel.app` (URL do backend na Vercel)
     - `NODE_VERSION=16` (ou versão mais recente)
   - Clique em "Deploy site"

3. **Configuração Pós-Deploy:**
   - Em "Domain settings", configure seu domínio personalizado (opcional)
   - Em "Deploy settings", verifique se o build está correto
   - Teste o frontend: `https://seu-site.netlify.app/venturosa`

### 🔄 **CI/CD Automático**

Ambas as plataformas oferecem CI/CD automático quando conectadas ao GitHub:

- **Vercel:** Cada push para a branch principal gera um novo deploy automático
- **Netlify:** Cada push para a branch principal gera um novo deploy automático

Para configurar branches de preview (desenvolvimento/staging):

1. **Vercel:** Em "Git Integration" configure "Preview Branches"
2. **Netlify:** Em "Build & deploy" configure "Deploy contexts"

### 🔗 **URLs Finais**

- **Frontend:** `https://seu-site.netlify.app/venturosa`
- **Backend:** `https://seu-backend.vercel.app`
- **API:** `https://seu-backend.vercel.app/api`

### 🧪 **Credenciais de Teste**

- **Master:** CPF 12345678900 / Senha admin123
- **Secretaria:** CPF 98765432100 / Senha secretaria123

### 🔍 **Monitoramento e Logs**

- **Vercel:** Dashboard > seu-projeto > Functions > Logs
- **Netlify:** Dashboard > seu-site > Deploys > Deploy log

### 💾 **Persistência de Dados**

Para persistência de dados no ambiente serverless:

1. **Opção Básica:** Use `/tmp/ouvidoria.db` (temporário, reinicia periodicamente)
2. **Opção Recomendada:** Conecte a um banco de dados externo como:
   - MongoDB Atlas (gratuito até 512MB)
   - Supabase (PostgreSQL, gratuito até 500MB)
   - Firebase (NoSQL, gratuito com limites)

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

## 📞 Suporte e Solução de Problemas

### 🔧 **Problemas Comuns e Soluções**

#### **Deploy no Vercel (Backend):**

| Problema | Solução |
|----------|--------|
| **Erro de build** | 1. Verifique se o `package.json` está correto e tem todas as dependências<br>2. Remova dependências que usam módulos nativos<br>3. Verifique os logs de build no Dashboard do Vercel |
| **Erro 500 na API** | 1. Verifique os logs de função no Dashboard do Vercel<br>2. Confirme se as variáveis de ambiente estão configuradas<br>3. Verifique se o caminho do banco de dados está correto (`/tmp/ouvidoria.db`) |
| **Erro CORS** | 1. Configure `CORS_ORIGIN=*` ou especifique o domínio do frontend<br>2. Verifique se os headers CORS estão sendo enviados corretamente |
| **Banco de dados não persiste** | 1. O diretório `/tmp` é temporário no Vercel, considere usar um banco externo<br>2. Use MongoDB Atlas, Supabase ou Firebase para persistência |
| **Limite de execução excedido** | 1. Otimize suas funções para execução mais rápida<br>2. Considere o plano Pro do Vercel para mais recursos |

#### **Deploy no Netlify (Frontend):**

| Problema | Solução |
|----------|--------|
| **Erro de build** | 1. Verifique se o `netlify.toml` está correto<br>2. Confirme se o comando de build funciona localmente<br>3. Verifique os logs de build no Dashboard do Netlify |
| **Erro de redirecionamento** | 1. Verifique o arquivo `_redirects` ou configurações no `netlify.toml`<br>2. Confirme que as regras de redirecionamento estão corretas para SPA |
| **Erro de conexão com API** | 1. Verifique se a variável `REACT_APP_API_URL` está configurada corretamente<br>2. Teste a URL da API diretamente no navegador<br>3. Verifique se o backend está online e respondendo |
| **Erro 404 em rotas** | 1. Confirme que os redirecionamentos para SPA estão configurados<br>2. Verifique se a rota `/venturosa/*` está redirecionando para `index.html` |
| **Problemas de cache** | 1. Force um novo deploy no Netlify<br>2. Adicione headers de cache-control no `netlify.toml` |

#### **Conexão Frontend-Backend:**

| Problema | Solução |
|----------|--------|
| **API não responde** | 1. Verifique se a URL da API está correta no frontend<br>2. Teste a API diretamente: `curl https://seu-backend.vercel.app/api/health`<br>3. Verifique os logs do backend no Vercel |
| **Erro CORS no console** | 1. Configure CORS no backend para permitir o domínio do frontend<br>2. Verifique se o protocolo (http/https) está correto |
| **Dados não persistem** | 1. Verifique a conexão com o banco de dados<br>2. Considere usar um banco de dados externo para persistência |

#### **Problemas Gerais:**

1. **Verificação de Conectividade:**
   - Teste o backend: `curl https://seu-backend.vercel.app/api/health`
   - Teste o frontend: Acesse `https://seu-site.netlify.app/venturosa`
   - Verifique os logs em ambas as plataformas

2. **Problemas de Desempenho:**
   - Otimize o tamanho do bundle do frontend
   - Minimize o tempo de execução das funções serverless
   - Considere usar CDN para assets estáticos

3. **Recursos Adicionais:**
   - Consulte a documentação em `docs/`
   - Para problemas com Git, consulte o guia em `docs/GIT.md`
   - Verifique a documentação oficial do [Vercel](https://vercel.com/docs) e [Netlify](https://docs.netlify.com)

4. **Atualizações e Manutenção:**
   - Mantenha as dependências atualizadas
   - Verifique regularmente os logs e métricas
   - Configure alertas para falhas de build ou deploy

## 🔄 Manutenção e Atualização Automática

### 🤖 Configuração de CI/CD para Atualizações Automáticas

#### GitHub Actions para Deploy Automático

Para configurar atualizações automáticas após commits, crie os seguintes arquivos no seu repositório:

1. **Para o Backend (Vercel)** - Crie `.github/workflows/vercel-deploy.yml`:

```yaml
name: Deploy Backend para Vercel

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Instalar Vercel CLI
        run: npm install -g vercel
        
      - name: Deploy para Vercel
        run: |
          cd backend
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

2. **Para o Frontend (Netlify)** - Crie `.github/workflows/netlify-deploy.yml`:

```yaml
name: Deploy Frontend para Netlify

on:
  push:
    branches: [ main ]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configurar Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          
      - name: Instalar dependências
        run: |
          cd frontend
          npm ci
        
      - name: Build
        run: |
          cd frontend
          npm run build
        
      - name: Deploy para Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './frontend/build'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy do GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

3. **Configuração dos Secrets no GitHub**:
   - Acesse seu repositório no GitHub
   - Vá para Settings > Secrets and variables > Actions
   - Adicione os seguintes secrets:
     - `VERCEL_TOKEN`: Obtenha em vercel.com > Settings > Tokens
     - `NETLIFY_AUTH_TOKEN`: Obtenha em netlify.com > User settings > Applications > Personal access tokens
     - `NETLIFY_SITE_ID`: Encontre na URL do seu site no Netlify ou nas configurações do site

### 🧹 Manutenção de Rotina

#### Limpeza de Logs (Ambiente Local)
```powershell
# Limpar logs antigos
Remove-Item "logs\*.log" -Force
```

#### Backup do Banco (Ambiente Local)
```powershell
# Fazer backup do banco
Copy-Item "database\ouvidoria.db" "database\ouvidoria_backup_$(Get-Date -Format 'yyyyMMdd').db"
```

#### Atualização de Dependências
```powershell
# Atualizar dependências do backend
cd backend
npm update

# Atualizar dependências do frontend
cd frontend
npm update
```

#### Verificação de Segurança
```powershell
# Verificar vulnerabilidades no backend
cd backend
npm audit

# Verificar vulnerabilidades no frontend
cd frontend
npm audit
```

### 📊 Monitoramento Contínuo

- **Vercel:** Configure alertas de erro no Dashboard > seu-projeto > Settings > Alerts
- **Netlify:** Configure notificações em User settings > Notification settings
- **GitHub Actions:** Verifique o status das execuções em Actions > Workflows

---

**Desenvolvido para a Prefeitura Municipal de Venturosa** 🏛️