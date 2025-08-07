# 🔧 CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE - VERCEL

## 📋 Variáveis Essenciais para o Sistema de Ouvidoria

### 🔍 Onde Configurar no Vercel:
1. Acesse seu projeto no Vercel
2. Vá em **"Settings"**
3. Clique em **"Environment Variables"**
4. Adicione cada variável individualmente

---

## 🔑 VARIÁVEIS OBRIGATÓRIAS

### 1️⃣ NODE_ENV
```
Nome: NODE_ENV
Valor: production
```

### 2️⃣ DB_PATH
```
Nome: DB_PATH
Valor: ./ouvidoria.db
```

### 3️⃣ PORT
```
Nome: PORT
Valor: 3001
```

### 4️⃣ CORS_ORIGIN
```
Nome: CORS_ORIGIN
Valor: *
```

---

## 🔑 VARIÁVEIS OPCIONAIS

### 5️⃣ LOG_LEVEL
```
Nome: LOG_LEVEL
Valor: info
```

### 6️⃣ REQUEST_TIMEOUT
```
Nome: REQUEST_TIMEOUT
Valor: 30000
```

### 7️⃣ RATE_LIMIT_WINDOW
```
Nome: RATE_LIMIT_WINDOW
Valor: 15
```

### 8️⃣ RATE_LIMIT_MAX
```
Nome: RATE_LIMIT_MAX
Valor: 100
```

---

## 📋 CONFIGURAÇÃO RÁPIDA

### Opção 1: Copiar e Colar
Copie o conteúdo do arquivo `backend/vercel.env` e cole no formulário do Vercel:

```
NODE_ENV=production
DB_PATH=./ouvidoria.db
PORT=3001
CORS_ORIGIN=*
LOG_LEVEL=info
REQUEST_TIMEOUT=30000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Opção 2: Adicionar Individualmente
Adicione cada variável separadamente no painel do Vercel:

| Nome | Valor |
|------|-------|
| `NODE_ENV` | `production` |
| `DB_PATH` | `./ouvidoria.db` |
| `PORT` | `3001` |
| `CORS_ORIGIN` | `*` |
| `LOG_LEVEL` | `info` |
| `REQUEST_TIMEOUT` | `30000` |
| `RATE_LIMIT_WINDOW` | `15` |
| `RATE_LIMIT_MAX` | `100` |

---

## ⚙️ CONFIGURAÇÕES DE EMAIL (OPCIONAL)

Se você quiser configurar envio de emails, adicione:

| Nome | Valor |
|------|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `ouvidoria@venturosa.pe.gov.br` |
| `SMTP_PASS` | `sua_senha_email` |

**⚠️ IMPORTANTE:** Para Gmail, use uma senha de aplicativo, não sua senha normal.

---

## 🔍 VERIFICAÇÃO

### 1️⃣ Testar Configuração
Após adicionar as variáveis, acesse:
```
https://seu-backend.vercel.app/api/health
```

Deve retornar:
```json
{
  "status": "OK",
  "message": "API da Ouvidoria funcionando"
}
```

### 2️⃣ Verificar Logs
No Vercel: **Functions** → **View Function Logs**

---

## 🚨 TROUBLESHOOTING

### ❌ Problemas Comuns

#### **Erro: "Cannot find module"**
- Verifique se `NODE_ENV=production` está configurado

#### **Erro: "Database not found"**
- Verifique se `DB_PATH=./ouvidoria.db` está configurado

#### **Erro: "CORS blocked"**
- Verifique se `CORS_ORIGIN=*` está configurado

#### **Erro: "Port already in use"**
- Verifique se `PORT=3001` está configurado

---

## 📞 SUPORTE

### 🆘 Se as variáveis não funcionarem:
1. Verifique se foram adicionadas corretamente
2. Faça um novo deploy após adicionar as variáveis
3. Verifique os logs no Vercel
4. Teste a API de health check

### 📚 Documentação Adicional:
- **Guia Completo:** `GUIA_IMPLANTACAO_VERCEL_NETLIFY.md`
- **Instruções Rápidas:** `INSTRUCOES_IMPLANTACAO_RAPIDA.md`

---

**🏛️ Sistema de Ouvidoria Municipal - Venturosa** 🏛️ 