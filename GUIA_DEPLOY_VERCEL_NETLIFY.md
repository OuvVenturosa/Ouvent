# 🚀 GUIA COMPLETO - DEPLOY NO VERCEL E NETLIFY

## 📋 PRÉ-REQUISITOS

1. **Conta no GitHub** (gratuita)
2. **Conta no Vercel** (gratuita) - [vercel.com](https://vercel.com)
3. **Conta no Netlify** (gratuita) - [netlify.com](https://netlify.com)

## 🎯 ESTRATÉGIA DE DEPLOY

### Opção 1: Vercel (Recomendado)
- **Frontend**: Deploy no Vercel
- **Backend**: Deploy no Vercel (Serverless Functions)
- **Banco**: SQLite (arquivo local) ou PostgreSQL (Vercel Postgres)

### Opção 2: Netlify + Vercel
- **Frontend**: Deploy no Netlify
- **Backend**: Deploy no Vercel
- **Banco**: SQLite ou PostgreSQL

## 🔧 PASSO A PASSO - VERCEL

### 1. Preparar o Repositório

```bash
# 1. Criar repositório no GitHub
# 2. Fazer upload dos arquivos
git init
git add .
git commit -m "Primeiro commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/ouvidoria-venturosa.git
git push -u origin main
```

### 2. Deploy do Backend no Vercel

1. **Acesse** [vercel.com](https://vercel.com)
2. **Faça login** com sua conta GitHub
3. **Clique** em "New Project"
4. **Importe** seu repositório
5. **Configure** o projeto:
   - **Framework Preset**: Node.js
   - **Root Directory**: `backend-vercel`
   - **Build Command**: `npm install`
   - **Output Directory**: `.`
   - **Install Command**: `npm install`

6. **Configure as variáveis de ambiente**:
   ```
   JWT_SECRET=sua_chave_secreta_muito_segura
   EMAIL_USER=ouvidoria.venturosa@gmail.com
   EMAIL_PASS=kbng efuw gfwr uywd
   ```

7. **Clique** em "Deploy"

### 3. Deploy do Frontend no Vercel

1. **Crie um novo projeto** no Vercel
2. **Importe** o mesmo repositório
3. **Configure**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. **Configure as variáveis de ambiente**:
   ```
   REACT_APP_API_URL=https://seu-backend-vercel.vercel.app/api
   ```

5. **Clique** em "Deploy"

## 🔧 PASSO A PASSO - NETLIFY

### 1. Deploy do Frontend no Netlify

1. **Acesse** [netlify.com](https://netlify.com)
2. **Faça login** com sua conta GitHub
3. **Clique** em "New site from Git"
4. **Escolha** GitHub e selecione seu repositório
5. **Configure**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

6. **Configure as variáveis de ambiente**:
   ```
   REACT_APP_API_URL=https://seu-backend-vercel.vercel.app/api
   ```

7. **Clique** em "Deploy site"

## 🔗 CONFIGURAÇÃO DE DOMÍNIOS

### Vercel (Domínio Personalizado)
1. **No dashboard do Vercel**, vá para seu projeto
2. **Clique** em "Settings" → "Domains"
3. **Adicione** seu domínio personalizado
4. **Configure** os registros DNS conforme instruções

### Netlify (Domínio Personalizado)
1. **No dashboard do Netlify**, vá para seu site
2. **Clique** em "Domain settings"
3. **Adicione** seu domínio personalizado
4. **Configure** os registros DNS conforme instruções

## 🔧 CONFIGURAÇÕES ESPECÍFICAS

### Para Vercel (Backend)
O arquivo `backend-vercel/vercel.json` já está configurado para:
- Usar Node.js runtime
- Configurar rotas para API
- Definir variáveis de ambiente

### Para Netlify (Frontend)
O arquivo `netlify.toml` já está configurado para:
- Definir diretório de build
- Configurar redirecionamentos
- Definir variáveis de ambiente

## 🚨 IMPORTANTE - BANCO DE DADOS

### Opção 1: SQLite (Limitações)
- **Vercel**: SQLite funciona, mas dados são perdidos após deploy
- **Solução**: Use Vercel Postgres ou outro banco persistente

### Opção 2: Vercel Postgres (Recomendado)
1. **No dashboard do Vercel**, vá para "Storage"
2. **Crie** um novo banco Postgres
3. **Configure** as variáveis de ambiente:
   ```
   POSTGRES_URL=sua_url_postgres
   POSTGRES_HOST=seu_host
   POSTGRES_DATABASE=seu_database
   POSTGRES_USERNAME=seu_username
   POSTGRES_PASSWORD=sua_senha
   ```

## 🔐 SEGURANÇA

### Variáveis de Ambiente
- **NUNCA** commite senhas no código
- **Use** variáveis de ambiente para dados sensíveis
- **Troque** as senhas padrão

### HTTPS
- **Vercel** e **Netlify** fornecem HTTPS automaticamente
- **Configure** headers de segurança se necessário

## 📊 MONITORAMENTO

### Vercel Analytics
1. **Ative** Vercel Analytics no dashboard
2. **Monitore** performance e erros

### Netlify Analytics
1. **Ative** Netlify Analytics no dashboard
2. **Monitore** tráfego e performance

## 🔄 DEPLOY AUTOMÁTICO

### Configuração
- **Vercel** e **Netlify** fazem deploy automático
- **Qualquer** push para `main` dispara novo deploy
- **Configure** branches de preview se necessário

## 🆘 SOLUÇÃO DE PROBLEMAS

### Erro de Build
1. **Verifique** logs de build
2. **Teste** localmente primeiro
3. **Verifique** dependências

### Erro de API
1. **Verifique** URL da API
2. **Teste** endpoints individualmente
3. **Verifique** CORS

### Erro de Banco
1. **Verifique** conexão com banco
2. **Teste** queries localmente
3. **Verifique** variáveis de ambiente

## 📞 SUPORTE

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Netlify**: [netlify.com/support](https://netlify.com/support)
- **Documentação**: [vercel.com/docs](https://vercel.com/docs)

## 🎉 PRÓXIMOS PASSOS

1. **Teste** todas as funcionalidades
2. **Configure** domínio personalizado
3. **Monitore** performance
4. **Configure** backups do banco
5. **Implemente** CI/CD avançado se necessário

---

**🎯 RESULTADO FINAL:**
- Frontend: `https://seu-app.vercel.app` ou `https://seu-app.netlify.app`
- Backend: `https://seu-backend.vercel.app`
- API: `https://seu-backend.vercel.app/api` 