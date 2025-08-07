# ⚡ Deploy Rápido - Vercel + Netlify

## 🚀 Deploy em 10 Minutos

### 1️⃣ Preparação (2 min)
```powershell
# Executar script de preparação
.\deploy_vercel_netlify.ps1
```

### 2️⃣ Backend no Vercel (3 min)
1. Acesse: https://vercel.com
2. Login com GitHub
3. **New Project** → Seu repositório
4. Configure:
   - **Root Directory:** `backend`
   - **Framework:** Node.js
5. **Deploy**
6. **Settings** → **Environment Variables** → Adicione:
   - NODE_ENV = production
   - DB_PATH = ./database/ouvidoria.db
   - PORT = 3001

### 3️⃣ Frontend no Netlify (3 min)
1. Acesse: https://netlify.com
2. Login com GitHub
3. **New site from Git** → Seu repositório
4. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
5. **Deploy site**

### 4️⃣ Configurar URLs (2 min)
1. Copie a URL do Vercel (ex: `https://abc123.vercel.app`)
2. No Netlify, vá em **Site settings** → **Environment variables**
3. Adicione: `REACT_APP_API_URL` = `https://abc123.vercel.app`
4. **Trigger deploy** para aplicar

## 🧪 Teste Rápido

### URLs Finais
- **Frontend:** `https://seu-site.netlify.app/venturosa`
- **Backend:** `https://seu-backend.vercel.app`

### Credenciais
- **Master:** CPF `12345678900` / Senha `admin123`
- **Secretaria:** CPF `98765432100` / Senha `secretaria123`

## ✅ Checklist

- [ ] Script executado com sucesso
- [ ] Backend deployado no Vercel
- [ ] Frontend deployado no Netlify
- [ ] URL do backend configurada no frontend
- [ ] Login funcionando
- [ ] Sistema operacional

## 🆘 Problemas Comuns

### Erro de Build
```bash
# Verificar dependências
cd backend && npm install
cd frontend && npm install
```

### Erro de CORS
- Verifique se a URL do backend está correta no frontend
- Confirme se a variável `REACT_APP_API_URL` está configurada

### Erro 404
- Verifique se o arquivo `_redirects` foi criado
- Confirme se o build foi bem-sucedido

## 📞 Suporte

- **Guia Completo:** `README_DEPLOY_VERCEL_NETLIFY.md`
- **Documentação:** `docs/DEPLOY_GRATUITO_GUIDE.md`
- **Scripts:** `deploy_vercel_netlify.ps1`

---

**🏛️ Sistema de Ouvidoria Municipal - Deploy Rápido Concluído!** 