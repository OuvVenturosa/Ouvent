# 🚀 DEPLOY RÁPIDO - SISTEMA DE OUVIDORIA

## ⚡ DEPLOY EM 5 MINUTOS

### 1. Preparar o Projeto
```bash
# Execute o script automatizado
./deploy_vercel_netlify.ps1
```

### 2. Deploy no Vercel (Recomendado)

#### Backend
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique "New Project"
4. Importe o repositório
5. Configure:
   - **Framework**: Node.js
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Output Directory**: `backend`
6. Variáveis de ambiente:
   ```
   JWT_SECRET=sua_chave_secreta_muito_segura
   EMAIL_USER=ouvidoria.venturosa@gmail.com
   EMAIL_PASS=kbng efuw gfwr uywd
   ```
7. Clique "Deploy"

#### Frontend
1. Crie novo projeto no Vercel
2. Importe o mesmo repositório
3. Configure:
   - **Framework**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Variável de ambiente:
   ```
   REACT_APP_API_URL=https://seu-backend-vercel.vercel.app/api
   ```
5. Clique "Deploy"

### 3. Deploy no Netlify (Alternativa)

1. Acesse [netlify.com](https://netlify.com)
2. Faça login com GitHub
3. Clique "New site from Git"
4. Escolha GitHub e selecione o repositório
5. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
6. Variável de ambiente:
   ```
   REACT_APP_API_URL=https://seu-backend-vercel.vercel.app/api
   ```
7. Clique "Deploy site"

## 🔗 URLs FINAIS

- **Frontend Vercel**: `https://seu-app.vercel.app`
- **Frontend Netlify**: `https://seu-app.netlify.app`
- **Backend Vercel**: `https://seu-backend.vercel.app`
- **API**: `https://seu-backend.vercel.app/api`

## 🔐 CREDENCIAIS PADRÃO

- **CPF**: `admin`
- **Senha**: `admin123`

## 🚨 IMPORTANTE

1. **Troque as senhas** em produção
2. **Configure domínio** personalizado
3. **Monitore** logs e performance
4. **Configure backups** do banco

## 📞 SUPORTE

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Netlify**: [netlify.com/support](https://netlify.com/support)
- **Documentação completa**: `GUIA_DEPLOY_VERCEL_NETLIFY.md`

---

**✅ PRONTO!** Seu sistema estará online em poucos minutos. 