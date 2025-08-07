# 🔧 TROUBLESHOOTING - "Arquivo backend/vercel.json inválido fornecido"

## 🚨 Problema Identificado

O erro **"Arquivo backend/vercel.json inválido fornecido"** indica que o Vercel não consegue interpretar o arquivo de configuração.

---

## ✅ SOLUÇÃO RÁPIDA

### 1️⃣ Verificar Arquivo Atual
O arquivo `backend/vercel.json` deve estar assim:

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

### 2️⃣ Executar Script de Correção
```powershell
.\deploy_vercel_netlify.ps1
```

### 3️⃣ Verificar Sintaxe JSON
Use um validador JSON online para verificar se não há erros de sintaxe.

---

## 🔍 VERIFICAÇÕES

### ✅ Estrutura Correta
- [ ] Arquivo está na pasta `backend/`
- [ ] Nome do arquivo é exatamente `vercel.json`
- [ ] Sintaxe JSON está correta
- [ ] Não há caracteres especiais ou BOM

### ✅ Configuração Válida
- [ ] `version: 2` está presente
- [ ] `builds` array está configurado
- [ ] `src: "api.js"` está correto
- [ ] `use: "@vercel/node"` está correto

---

## 🛠️ SOLUÇÕES ALTERNATIVAS

### Opção 1: Configuração Mínima
Se o erro persistir, use esta versão mínima:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api.js",
      "use": "@vercel/node"
    }
  ]
}
```

### Opção 2: Configuração com Functions
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api.js",
      "use": "@vercel/node"
    }
  ],
  "functions": {
    "api.js": {
      "maxDuration": 30
    }
  }
}
```

### Opção 3: Configuração Completa
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
  ],
  "functions": {
    "api.js": {
      "maxDuration": 30
    }
  }
}
```

---

## 🔧 PASSOS DE CORREÇÃO

### 1️⃣ Limpar Cache
```powershell
# Remover node_modules
Remove-Item -Recurse -Force backend\node_modules
Remove-Item -Recurse -Force frontend\node_modules

# Reinstalar dependências
cd backend
npm install
cd ..\frontend
npm install
```

### 2️⃣ Recriar Arquivo
```powershell
# Executar script de preparação
.\deploy_vercel_netlify.ps1
```

### 3️⃣ Verificar Encoding
Certifique-se de que o arquivo está salvo em **UTF-8 sem BOM**.

---

## 🚨 PROBLEMAS COMUNS

### ❌ Erro: "Unexpected token"
- **Causa:** Caractere inválido no JSON
- **Solução:** Use um validador JSON online

### ❌ Erro: "Cannot find module"
- **Causa:** Arquivo `api.js` não encontrado
- **Solução:** Verifique se o arquivo existe em `backend/api.js`

### ❌ Erro: "Invalid configuration"
- **Causa:** Versão do Vercel incompatível
- **Solução:** Use `"version": 2`

---

## 🔍 TESTE LOCAL

### 1️⃣ Verificar Sintaxe
```powershell
# Testar se o JSON é válido
node -e "console.log(JSON.parse(require('fs').readFileSync('backend/vercel.json', 'utf8')))"
```

### 2️⃣ Testar API Local
```powershell
cd backend
npm start
```

### 3️⃣ Verificar Endpoints
- Acesse: `http://localhost:3001/api/health`
- Deve retornar: `{"status":"OK","message":"API da Ouvidoria funcionando"}`

---

## 📞 SUPORTE

### 🆘 Se o problema persistir:
1. Verifique os logs no Vercel
2. Teste com configuração mínima
3. Verifique se o repositório está sincronizado
4. Faça um novo deploy após correções

### 📚 Documentação Adicional:
- **Guia Completo:** `GUIA_IMPLANTACAO_VERCEL_NETLIFY.md`
- **Variáveis de Ambiente:** `VARIAVEIS_AMBIENTE_VERCEL.md`

---

## ✅ VERIFICAÇÃO FINAL

Após corrigir o arquivo:

1. **Faça commit das alterações**
2. **Push para o GitHub**
3. **Deploy no Vercel**
4. **Teste a API:** `https://seu-backend.vercel.app/api/health`

**🏛️ Sistema de Ouvidoria Municipal - Problema Resolvido!** 🏛️ 