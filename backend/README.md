# 🚀 Backend - Sistema de Ouvidoria Municipal

## 📁 Estrutura

```
backend/
├── api.js              # Servidor API principal
├── server.js           # Servidor para desenvolvimento local
├── backend.js          # Lógica do chatbot WhatsApp
├── package.json        # Dependências e scripts
├── ouvidoria.db        # Banco de dados SQLite
└── .gitignore          # Arquivos a ignorar
```

## 🚀 Deploy no Vercel

### 1. Configuração Automática
O projeto já está configurado para deploy no Vercel com:
- ✅ `package.json` com todas as dependências
- ✅ `api.js` otimizado para serverless
- ✅ `vercel.json` com configurações corretas
- ✅ `.vercelignore` para otimizar deploy
- ✅ Dependências limpas (sem módulos nativos problemáticos)

### 2. Deploy Manual
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique "New Project"
4. Importe o repositório
5. Configure:
   - **Framework**: Node.js
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Output Directory**: `backend`
   - **Install Command**: `npm install`

### 3. Variáveis de Ambiente (Opcional)
```
JWT_SECRET=sua_chave_secreta_muito_segura
EMAIL_USER=ouvidoria.venturosa@gmail.com
EMAIL_PASS=kbng efuw gfwr uywd
```

## 🔧 Desenvolvimento Local

### Instalar Dependências
```bash
cd backend
npm install
```

### Executar em Desenvolvimento
```bash
# Usando nodemon (recomendado)
npm run dev

# Usando node
npm start
```

### Executar em Produção
```bash
npm start
```

## 📡 Endpoints da API

### Health Check
```
GET /api/health
```

### Demandas
```
GET /api/demandas                    # Listar todas as demandas
GET /api/demandas/:protocolo         # Buscar demanda específica
POST /api/demandas                   # Criar nova demanda
PUT /api/demandas/:protocolo/status  # Atualizar status
```

### Exemplo de Uso
```javascript
// Listar demandas
fetch('https://seu-backend.vercel.app/api/demandas')
  .then(response => response.json())
  .then(data => console.log(data));

// Criar demanda
fetch('https://seu-backend.vercel.app/api/demandas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'João Silva',
    telefone: '81999999999',
    servico: 'Iluminação Pública',
    descricao: 'Poste quebrado na rua principal'
  })
});
```

## 🗄️ Banco de Dados

### Estrutura
- **Arquivo**: `ouvidoria.db`
- **Tipo**: SQLite
- **Tabelas**: `demandas`, `atualizacoes`, `usuarios`

### Backup
```bash
# Fazer backup
cp ouvidoria.db ouvidoria_backup_$(date +%Y%m%d).db
```

## 🔍 Logs e Debug

### Logs do Servidor
```bash
# Ver logs em tempo real
tail -f logs/server.log
```

### Debug
```bash
# Executar com debug
DEBUG=* npm start
```

## 🛡️ Segurança

- ✅ CORS configurado
- ✅ Validação de dados
- ✅ Sanitização de inputs
- ✅ Rate limiting (configurável)

## 📊 Monitoramento

### Health Check
```bash
curl https://seu-backend.vercel.app/api/health
```

### Métricas
- Tempo de resposta
- Taxa de erro
- Uso de memória

## 🔄 Manutenção

### Atualizar Dependências
```bash
npm update
npm audit fix
```

### Limpar Cache
```bash
npm cache clean --force
```

## 📞 Suporte

- **Documentação**: `../docs/`
- **Issues**: GitHub Issues
- **Logs**: Vercel Dashboard

---

**✅ Pronto para Deploy!** O backend está configurado e otimizado para o Vercel. 