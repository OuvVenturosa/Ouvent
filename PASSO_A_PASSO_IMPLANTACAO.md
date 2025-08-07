# 🚀 PASSO A PASSO - IMPLANTAÇÃO COMPLETA
## Sistema de Ouvidoria Municipal - Vercel + Netlify

---

## 📋 PRÉ-REQUISITOS

### ✅ Contas Necessárias
- [GitHub](https://github.com) - Para repositório
- [Vercel](https://vercel.com) - Para backend
- [Netlify](https://netlify.com) - Para frontend

### ✅ Ferramentas Locais
- Node.js (versão 14 ou superior)
- npm ou yarn
- Git

---

## 🔧 PREPARAÇÃO INICIAL

### Passo 1: Verificar Estrutura do Projeto
```
CHATBOT OUV/
├── backend/
│   ├── api/
│   │   ├── index.js
│   │   └── demandas.js
│   ├── vercel.json
│   ├── package.json
│   └── ouvidoria.db
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── netlify.toml
└── docs/
```

### Passo 2: Executar Script de Preparação
```powershell
# Execute o script de preparação
.\deploy_vercel_netlify.ps1
```

### Passo 3: Verificar Arquivos Criados
- ✅ `backend/vercel.json` - Configuração Vercel
- ✅ `frontend/netlify.toml` - Configuração Netlify
- ✅ `frontend/.env` - Variáveis de ambiente
- ✅ `frontend/public/_redirects` - Redirecionamentos

---

## 🚀 DEPLOY DO BACKEND (Vercel)

### Passo 1: Acessar Vercel
1. Abra o navegador
2. Acesse: https://vercel.com
3. Faça login com sua conta GitHub

### Passo 2: Criar Novo Projeto
1. Clique em **"New Project"**
2. Escolha **"Import Git Repository"**
3. Selecione seu repositório do GitHub
4. Clique em **"Import"**

### Passo 3: Configurar Projeto Backend
Configure as seguintes opções:

| Campo | Valor |
|-------|-------|
| **Framework Preset** | `Node.js` |
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Output Directory** | `.` |
| **Install Command** | `npm install` |

### Passo 4: Deploy Inicial
1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. **Anote a URL gerada** (ex: `https://abc123.vercel.app`)

### Passo 5: Configurar Variáveis de Ambiente
No painel do Vercel:
1. Vá em **"Settings"**
2. Clique em **"Environment Variables"**
3. Adicione as seguintes variáveis:

| Nome | Valor |
|------|-------|
| `NODE_ENV` | `production` |
| `DB_PATH` | `/tmp/ouvidoria.db` |
| `CORS_ORIGIN` | `*` |

### Passo 6: Testar Backend
1. Acesse: `https://sua-url-vercel.app/api/health`
2. Deve retornar: `{"status":"OK","message":"API da Ouvidoria funcionando"}`

---

## 🌐 DEPLOY DO FRONTEND (Netlify)

### Passo 1: Acessar Netlify
1. Abra o navegador
2. Acesse: https://netlify.com
3. Faça login com sua conta GitHub

### Passo 2: Criar Novo Site
1. Clique em **"New site from Git"**
2. Escolha **"GitHub"**
3. Selecione seu repositório
4. Clique em **"Connect"**

### Passo 3: Configurar Build
Configure as seguintes opções:

| Campo | Valor |
|-------|-------|
| **Base directory** | `frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `build` |

### Passo 4: Configurar Variáveis de Ambiente
1. Clique em **"Show advanced"**
2. Adicione a variável:

| Nome | Valor |
|------|-------|
| `REACT_APP_API_URL` | `https://sua-url-vercel.app` |

**⚠️ IMPORTANTE:** Substitua `sua-url-vercel.app` pela URL real do seu backend no Vercel.

### Passo 5: Deploy Frontend
1. Clique em **"Deploy site"**
2. Aguarde o build (3-5 minutos)
3. **Anote a URL gerada** (ex: `https://abc123.netlify.app`)

---

## 🔗 CONFIGURAÇÃO FINAL

### Passo 1: Atualizar URLs
Após ambos os deploys, atualize os arquivos:

#### **frontend/.env**
```env
REACT_APP_API_URL=https://sua-url-vercel.app
```

#### **frontend/netlify.toml**
```toml
[context.production.environment]
  REACT_APP_API_URL = "https://sua-url-vercel.app"
```

### Passo 2: Re-deploy Frontend
1. No Netlify, vá em **"Deploys"**
2. Clique em **"Trigger deploy"** > **"Deploy site"**
3. Aguarde o novo build

---

## 🧪 TESTE COMPLETO

### Passo 1: Testar URLs
- **Frontend:** `https://seu-site.netlify.app/venturosa`
- **Backend:** `https://seu-backend.vercel.app/api/health`

### Passo 2: Testar Login
Use as credenciais de teste:
- **Master:** CPF `12345678900` / Senha `admin123`
- **Secretaria:** CPF `98765432100` / Senha `secretaria123`

### Passo 3: Testar Funcionalidades
- ✅ Login de administradores
- ✅ Listagem de demandas
- ✅ Detalhes de protocolos
- ✅ Editor de respostas
- ✅ Estatísticas

---

## 🔧 TROUBLESHOOTING

### ❌ Problemas Comuns

#### **Erro: "Cannot find module"**
**Solução:**
1. Verifique se `NODE_ENV=production` está configurado
2. Faça um novo deploy após adicionar variáveis

#### **Erro: "CORS blocked"**
**Solução:**
1. Verifique se `CORS_ORIGIN=*` está configurado
2. Confirme se a URL do backend está correta no frontend

#### **Erro: "404 Not Found"**
**Solução:**
1. Verifique se o arquivo `_redirects` está correto
2. Confirme se as rotas estão configuradas

#### **Erro: "Build failed"**
**Solução:**
1. Verifique os logs de build
2. Confirme se todas as dependências estão instaladas
3. Teste localmente primeiro

---

## 📊 MONITORAMENTO

### Passo 1: Configurar Logs
**Vercel:**
1. Acesse seu projeto no Vercel
2. Vá em **"Functions"** > **"View Function Logs"**

**Netlify:**
1. Acesse seu site no Netlify
2. Vá em **"Deploys"** > **"View deploy log"**

### Passo 2: Configurar Alertas
1. Configure notificações de erro
2. Monitore performance
3. Verifique uptime

---

## 🚀 OTIMIZAÇÕES

### Passo 1: Performance
- ✅ CDN global automático
- ✅ Cache configurado
- ✅ Compressão ativada

### Passo 2: Segurança
- ✅ HTTPS automático
- ✅ Headers de segurança
- ✅ CORS configurado

### Passo 3: SEO
- ✅ Meta tags configuradas
- ✅ Sitemap gerado
- ✅ Robots.txt configurado

---

## 📞 SUPORTE

### 🆘 Problemas Técnicos
1. Verifique os logs em cada plataforma
2. Consulte a documentação oficial:
   - [Vercel Docs](https://vercel.com/docs)
   - [Netlify Docs](https://docs.netlify.com)
3. Execute o script de diagnóstico: `.\scripts\verificar_nginx.ps1`

### 📚 Documentação Adicional
- **Guia Completo:** `docs/DEPLOY_GRATUITO_GUIDE.md`
- **Deploy Vercel:** `DEPLOY_VERCEL_RAPIDO.md`
- **Deploy Netlify:** `DEPLOY_NETLIFY_FRONTEND.md`

---

## 🎉 CONCLUSÃO

### ✅ Checklist Final
- [ ] Backend rodando no Vercel
- [ ] Frontend rodando no Netlify
- [ ] URLs configuradas corretamente
- [ ] Variáveis de ambiente definidas
- [ ] Testes realizados com sucesso
- [ ] Monitoramento configurado

### 🏆 Resultado Final
Após seguir todos os passos, você terá:
- ✅ Sistema totalmente funcional
- ✅ URLs públicas acessíveis
- ✅ Performance otimizada
- ✅ Segurança configurada
- ✅ Monitoramento ativo

**🏛️ Sistema de Ouvidoria Municipal - Deploy Concluído!**

---

**Desenvolvido para a Prefeitura Municipal de Venturosa** 🏛️ 