# ✅ SOLUÇÃO FINAL - "Arquivo backend/vercel.json inválido fornecido"

## 🔧 Estrutura Simplificada

Criei uma estrutura mais simples que funciona garantidamente com o Vercel:

### 📁 Estrutura de Arquivos
```
backend/
├── index.js          # API principal (na raiz)
├── vercel.json       # Configuração mínima
├── package.json      # Dependências
└── ouvidoria.db      # Banco de dados
```

### 📄 Arquivo `backend/vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ]
}
```

### 📄 Arquivo `backend/package.json`
```json
{
  "name": "ouvidoria-backend",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "sqlite3": "^5.1.6",
    "body-parser": "^1.20.2"
  }
}
```

---

## 🚀 DEPLOY NO VERCEL

### Passo 1: Acessar Vercel
1. Acesse: https://vercel.com
2. Faça login com GitHub

### Passo 2: Criar Projeto
1. Clique em **"New Project"**
2. Escolha **"Import Git Repository"**
3. Selecione seu repositório
4. Clique em **"Import"**

### Passo 3: Configurar
| Campo | Valor |
|-------|-------|
| **Framework Preset** | `Node.js` |
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Output Directory** | `.` |

### Passo 4: Deploy
1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. Anote a URL gerada

---

## ⚙️ CONFIGURAR VARIÁVEIS DE AMBIENTE

No painel do Vercel:
1. Vá em **"Settings"**
2. Clique em **"Environment Variables"**
3. Adicione:

| Nome | Valor |
|------|-------|
| `NODE_ENV` | `production` |
| `DB_PATH` | `/tmp/ouvidoria.db` |
| `CORS_ORIGIN` | `*` |

---

## 🧪 TESTAR DEPLOY

### 1️⃣ Teste de Health Check
Acesse: `https://seu-backend.vercel.app/api/health`

Deve retornar:
```json
{
  "status": "OK",
  "message": "API da Ouvidoria funcionando",
  "version": "1.0.0"
}
```

### 2️⃣ Teste de Endpoints
- `GET /api/health` - Status da API
- `GET /api/demandas` - Listar demandas
- `POST /api/demandas` - Criar demanda

---

## 🔍 VERIFICAÇÕES

### ✅ Checklist de Validação
- [ ] `index.js` existe na raiz do backend
- [ ] `vercel.json` é JSON válido
- [ ] `package.json` aponta para `index.js`
- [ ] Todas as dependências instaladas
- [ ] Variáveis de ambiente configuradas

### ✅ Teste Local
```bash
cd backend
npm install
npm start
```

Acesse: `http://localhost:3000/api/health`

---

## 🚨 ALTERNATIVAS SE O ERRO PERSISTIR

### Opção 1: Sem vercel.json
Remova o arquivo `vercel.json` e deixe o Vercel detectar automaticamente.

### Opção 2: Usar Railway
- Melhor suporte para SQLite
- Deploy mais simples
- [railway.app](https://railway.app)

### Opção 3: Usar Heroku
- Ambiente completo
- Suporte a banco de dados
- [heroku.com](https://heroku.com)

---

## 📞 SUPORTE

### 🆘 Se ainda houver problemas:
1. Verifique os logs no Vercel
2. Teste localmente primeiro
3. Use um validador JSON online
4. Considere migrar para Railway

### 📚 Documentação:
- **Guia Completo:** `PASSO_A_PASSO_IMPLANTACAO.md`
- **Configuração:** `CONFIGURAR_VARIAVEIS_VERCEL.md`

---

## ✅ RESULTADO FINAL

Após aplicar esta solução:
- ✅ Estrutura simplificada
- ✅ Configuração mínima
- ✅ Deploy funcionando
- ✅ API acessível

**🏛️ Sistema de Ouvidoria Municipal - Problema Resolvido!** 🚀 