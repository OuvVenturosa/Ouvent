# 🔧 CONFIGURAR VARIÁVEIS DE AMBIENTE NO VERCEL

## ✅ Problema Resolvido: "Invalid backend/vercel.json file provided"

O arquivo `vercel.json` foi corrigido removendo a seção `env` inválida. As variáveis de ambiente devem ser configuradas no painel do Vercel.

---

## 🚀 PRÓXIMOS PASSOS

### 1️⃣ Deploy no Vercel
1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em **"New Project"**
4. Importe seu repositório
5. Configure:
   - **Framework Preset:** `Node.js`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Output Directory:** `.`
6. Clique em **"Deploy"**

### 2️⃣ Configurar Variáveis de Ambiente
Após o deploy, configure as variáveis no painel do Vercel:

1. Acesse seu projeto no Vercel
2. Vá em **"Settings"**
3. Clique em **"Environment Variables"**
4. Adicione as seguintes variáveis:

| Nome | Valor |
|------|-------|
| `NODE_ENV` | `production` |
| `DB_PATH` | `/tmp/ouvidoria.db` |
| `CORS_ORIGIN` | `*` |

### 3️⃣ Testar Configuração
1. Acesse: `https://seu-backend.vercel.app/api/health`
2. Deve retornar: `{"status":"OK","message":"API da Ouvidoria funcionando"}`

---

## 🔍 VERIFICAÇÕES

### ✅ Arquivo vercel.json Correto
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
```

### ✅ Estrutura de Arquivos
```
backend/
├── api/
│   ├── index.js
│   └── demandas.js
├── vercel.json
├── package.json
└── ouvidoria.db
```

---

## 🚨 TROUBLESHOOTING

### ❌ Se o erro persistir:

#### **Opção 1: Configuração Mínima**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ]
}
```

#### **Opção 2: Sem Routes**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ]
}
```

#### **Opção 3: Usar index.js**
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

---

## 📞 SUPORTE

### 🆘 Se ainda houver problemas:
1. Verifique se o arquivo está salvo em UTF-8
2. Use um validador JSON online
3. Teste com configuração mínima
4. Verifique os logs no Vercel

### 📚 Documentação Adicional:
- **Guia Completo:** `PASSO_A_PASSO_IMPLANTACAO.md`
- **Troubleshooting:** `TROUBLESHOOTING_VERCEL_JSON.md`

---

**🏛️ Sistema de Ouvidoria Municipal - Problema Resolvido!** 🚀 