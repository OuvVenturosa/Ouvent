# 🚀 DEPLOY RÁPIDO - SISTEMA DE OUVIDORIA

## 🎯 OPÇÕES GRATUITAS (RANKING)

### 🥇 **1º LUGAR: ngrok (Mais Simples)**
- **Tempo:** 5 minutos
- **Custo:** Gratuito
- **Duração:** 2 horas por sessão
- **Ideal para:** Testes e demonstrações

### 🥈 **2º LUGAR: Vercel + Railway (Recomendado)**
- **Tempo:** 30 minutos
- **Custo:** Gratuito
- **Duração:** Permanente
- **Ideal para:** Deploy profissional

### 🥉 **3º LUGAR: Netlify + Render**
- **Tempo:** 30 minutos
- **Custo:** Gratuito
- **Duração:** Permanente
- **Ideal para:** Alternativa ao Vercel

---

## 🚀 OPÇÃO 1: ngrok (SUPER RÁPIDO)

### Passo 1: Baixar ngrok
1. Acesse: https://ngrok.com/download
2. Baixe o arquivo `ngrok.exe`
3. Extraia para a pasta do projeto

### Passo 2: Executar Sistema
```powershell
# Executar sistema completo
.\executar_sistema_completo_com_nginx.ps1
```

### Passo 3: Criar Túnel Público
```bash
# Em um novo terminal
ngrok http 80
```

### Passo 4: Acessar
- **URL:** `https://abc123.ngrok.io/venturosa`
- **Login Master:** CPF `12345678900` / Senha `admin123`
- **Login Secretaria:** CPF `98765432100` / Senha `secretaria123`

### ⚠️ Limitações:
- URL muda a cada reinicialização
- Sessão expira em 2 horas
- Limite de conexões

---

## 🚀 OPÇÃO 2: Vercel + Railway (PERMANENTE)

### Passo 1: Preparar Arquivos
```powershell
# Executar script de preparação
.\deploy_vercel.ps1
```

### Passo 2: Deploy Backend (Railway)
1. Acesse: https://railway.app
2. Login com GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Conecte seu repositório
5. Configure variáveis:
   ```
   NODE_ENV=production
   PORT=3001
   DB_PATH=./database/ouvidoria.db
   ```
6. Anote a URL do backend

### Passo 3: Deploy Frontend (Vercel)
1. Acesse: https://vercel.com
2. Login com GitHub
3. "New Project" → Importe repositório
4. Configure:
   - Framework: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Adicione variável:
   ```
   REACT_APP_API_URL=https://sua-url-railway.app
   ```

### Passo 4: URLs Finais
- **Frontend:** `https://seu-dominio.vercel.app/venturosa`
- **Backend:** `https://seu-backend.railway.app`
- **API:** `https://seu-backend.railway.app/api`

---

## 🚀 OPÇÃO 3: Netlify + Render

### Passo 1: Deploy Backend (Render)
1. Acesse: https://render.com
2. Login com GitHub
3. "New Web Service"
4. Conecte repositório
5. Configure:
   - Name: `ouvidoria-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node backend/backend.js`

### Passo 2: Deploy Frontend (Netlify)
1. Acesse: https://netlify.com
2. Login com GitHub
3. "New site from Git"
4. Configure:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `build`

---

## 📊 COMPARAÇÃO RÁPIDA

| Opção | Tempo | Custo | Duração | Facilidade | URL Fixa |
|-------|-------|-------|---------|------------|----------|
| ngrok | 5 min | Gratuito | 2h | ⭐⭐⭐⭐⭐ | ❌ |
| Vercel+Railway | 30 min | Gratuito | Permanente | ⭐⭐⭐⭐ | ✅ |
| Netlify+Render | 30 min | Gratuito | Permanente | ⭐⭐⭐⭐ | ✅ |

---

## 🎯 RECOMENDAÇÃO

### Para Testes Rápidos:
**Use ngrok** - Mais simples e rápido

### Para Deploy Permanente:
**Use Vercel + Railway** - Melhor combinação

---

## 🆘 COMANDOS ÚTEIS

### Verificar Sistema Local:
```powershell
# Verificar se está rodando
netstat -an | findstr ":80"
netstat -an | findstr ":3000"
netstat -an | findstr ":3001"
```

### Iniciar Sistema:
```powershell
# Sistema completo
.\executar_sistema_completo_com_nginx.ps1

# Sistema simples
.\iniciar_sistema_simples.ps1
```

### Parar Sistema:
```powershell
# Parar tudo
.\fechar_sistema_completo_com_nginx.ps1
```

---

## 📞 LOGINS DE TESTE

### Master (Administrador):
- **CPF:** `12345678900`
- **Senha:** `admin123`

### Secretaria:
- **CPF:** `98765432100`
- **Senha:** `secretaria123`

---

## 🚀 PRÓXIMOS PASSOS

1. **Escolha uma opção** baseada na sua necessidade
2. **Siga os passos** específicos
3. **Teste o acesso** público
4. **Configure SSL** se necessário

**Boa sorte! 🎉** 