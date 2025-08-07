# 🚨 SOLUÇÕES PARA PROBLEMAS DE DEPLOY NO VERCEL

## 📋 PROBLEMAS COMUNS E SOLUÇÕES

### 1️⃣ PROBLEMA: Backend não implanta
**Soluções:**

#### Solução 1: Usar API Simplificada
1. Renomeie `vercel-api.js` para `api/index.js`
2. Atualize `vercel.json`:
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

#### Solução 2: Usar Serverless Functions
1. Crie pasta `api/`
2. Mova rotas para arquivos separados em `api/`
3. Remova `vercel.json`

#### Solução 3: Usar Edge Functions
1. Renomeie para `index.js`
2. Use configuração mínima:
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

## 🔧 ESTRUTURAS ALTERNATIVAS

### 1️⃣ Estrutura com API Routes
```
backend/
├── api/
│   ├── index.js
│   ├── demandas.js
│   └── health.js
├── package.json
└── vercel.json
```

### 2️⃣ Estrutura Serverless
```
backend/
├── api/
│   ├── demandas/
│   │   └── index.js
│   └── health.js
└── package.json
```

### 3️⃣ Estrutura Monorepo
```
├── api/
│   └── index.js
├── src/
│   └── routes/
└── vercel.json
```

---

## 📝 CONFIGURAÇÕES TESTADAS

### 1️⃣ Configuração Básica
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

### 2️⃣ Configuração com Rotas
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
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
```

### 3️⃣ Configuração com Funções
```json
{
  "version": 2,
  "functions": {
    "api/index.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

---

## ⚙️ AJUSTES NO CÓDIGO

### 1️⃣ Conexão com Banco
```javascript
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/ouvidoria.db'
  : path.join(__dirname, 'ouvidoria.db');
```

### 2️⃣ Configuração CORS
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

### 3️⃣ Tratamento de Erros
```javascript
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : null
  });
});
```

---

## 🔍 VERIFICAÇÕES

### 1️⃣ Antes do Deploy
- [ ] Node.js >= 14.0.0
- [ ] package.json configurado
- [ ] Dependências instaladas
- [ ] Variáveis de ambiente definidas
- [ ] Banco de dados acessível

### 2️⃣ Durante o Deploy
- [ ] Logs do build
- [ ] Erros de compilação
- [ ] Configuração do Vercel
- [ ] Rotas definidas

### 3️⃣ Após o Deploy
- [ ] Teste de endpoints
- [ ] Logs de produção
- [ ] Monitoramento
- [ ] Performance

---

## 🚀 SOLUÇÕES ALTERNATIVAS

### 1️⃣ Usar Railway
- Suporte nativo a SQLite
- Deploy mais simples
- Persistência de dados

### 2️⃣ Usar Heroku
- Ambiente completo
- Add-ons para banco
- Logs melhores

### 3️⃣ Usar DigitalOcean
- Servidor dedicado
- Mais controle
- Melhor para SQLite

---

## 📊 COMPARAÇÃO DE SOLUÇÕES

| Plataforma | Pros | Contras |
|------------|------|---------|
| Vercel | Gratuito, Fácil | Limitações com SQLite |
| Railway | Banco incluído | Limite gratuito menor |
| Heroku | Completo | Pago |
| DigitalOcean | Controle total | Mais complexo |

---

## 🆘 SUPORTE

### Canais de Ajuda
1. [Vercel Support](https://vercel.com/support)
2. [Documentação Vercel](https://vercel.com/docs)
3. [GitHub Issues](https://github.com/vercel/vercel/issues)
4. [Stack Overflow](https://stackoverflow.com/questions/tagged/vercel)

### Comunidade
- Discord Vercel
- GitHub Discussions
- Forum Vercel

---

## ✅ CHECKLIST FINAL

1. **Estrutura do Projeto**
   - [ ] Arquivos no lugar certo
   - [ ] Dependências corretas
   - [ ] Configurações válidas

2. **Configuração Vercel**
   - [ ] Framework preset
   - [ ] Build commands
   - [ ] Environment variables

3. **Banco de Dados**
   - [ ] Caminho correto
   - [ ] Permissões
   - [ ] Backup

4. **Monitoramento**
   - [ ] Logs ativos
   - [ ] Alertas configurados
   - [ ] Métricas básicas

---

**🏛️ Sistema de Ouvidoria Municipal - Soluções de Deploy** 🚀 