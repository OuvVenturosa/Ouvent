# 🌐 DEPLOY FRONTEND NO NETLIFY

## 🚀 Deploy Rápido em 5 Minutos

### 1. Preparar o Frontend
```bash
# Certifique-se de que o frontend está pronto
cd frontend
npm install
npm run build
```

### 2. Deploy no Netlify

#### Opção 1: Deploy via Interface Web (Recomendado)

1. **Acesse o Netlify**
   - Vá para [netlify.com](https://netlify.com)
   - Faça login com GitHub

2. **Criar Novo Site**
   - Clique em "New site from Git"
   - Escolha "GitHub"
   - Selecione seu repositório

3. **Configurar Build**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

4. **Variáveis de Ambiente**
   ```
   REACT_APP_API_URL=https://seu-backend-vercel.vercel.app/api
   ```

5. **Deploy**
   - Clique em "Deploy site"
   - Aguarde o build completar

#### Opção 2: Deploy via Drag & Drop

1. **Build Local**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Upload Manual**
   - Acesse [netlify.com](https://netlify.com)
   - Arraste a pasta `frontend/build` para a área de upload
   - Aguarde o deploy

#### Opção 3: Deploy via CLI

1. **Instalar Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login e Deploy**
   ```bash
   netlify login
   cd frontend
   npm run build
   netlify deploy --dir=build --prod
   ```

## 🔧 Configuração Avançada

### Arquivo `netlify.toml` (Opcional)
```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "build"

[build.environment]
  REACT_APP_API_URL = "https://seu-backend-vercel.vercel.app/api"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Configuração de Domínio Personalizado

1. **Adicionar Domínio**
   - Vá para "Site settings" > "Domain management"
   - Clique em "Add custom domain"
   - Digite seu domínio

2. **Configurar DNS**
   - Adicione os registros DNS fornecidos pelo Netlify
   - Aguarde a propagação (pode levar até 24h)

## 🔗 URLs de Acesso

### URLs Padrão
- **Site**: `https://seu-site.netlify.app`
- **Admin**: `https://seu-site.netlify.app/venturosa`

### URLs Personalizadas
- **Site**: `https://ouvidoria.seudominio.com`
- **Admin**: `https://ouvidoria.seudominio.com/venturosa`

## ✅ Verificação do Deploy

### 1. Testar Site Principal
```bash
curl https://seu-site.netlify.app
```

### 2. Testar Área Administrativa
- Acesse: `https://seu-site.netlify.app/venturosa`
- Login: `admin` / `admin123`

### 3. Testar API
```bash
curl https://seu-backend-vercel.vercel.app/api/health
```

## 🚨 Solução de Problemas

### Erro: "Build failed"
- ✅ Verifique se o `frontend/package.json` existe
- ✅ Confirme que todas as dependências estão instaladas
- ✅ Verifique os logs no Netlify Dashboard

### Erro: "API not found"
- ✅ Verifique se a variável `REACT_APP_API_URL` está correta
- ✅ Confirme se o backend está funcionando
- ✅ Teste a API diretamente

### Erro: "Page not found"
- ✅ Verifique se o arquivo `netlify.toml` tem as redirects corretas
- ✅ Confirme se o `build/index.html` existe

### Erro: "CORS error"
- ✅ Verifique se o backend tem CORS configurado
- ✅ Confirme se a URL da API está correta

## 🔐 Configuração de Segurança

### Variáveis de Ambiente
```bash
# Produção
REACT_APP_API_URL=https://seu-backend.vercel.app/api
REACT_APP_ENV=production

# Desenvolvimento
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENV=development
```

### Headers de Segurança
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

## 📊 Monitoramento

### Analytics do Netlify
- **Visitas**: Dashboard do Netlify
- **Performance**: Lighthouse reports
- **Erros**: Logs em tempo real

### Métricas Importantes
- Tempo de carregamento
- Taxa de erro
- Uptime
- Performance mobile

## 🔄 Atualizações

### Deploy Automático
- ✅ Conectado ao GitHub
- ✅ Deploy automático a cada push
- ✅ Preview de branches

### Deploy Manual
```bash
# Forçar novo deploy
netlify deploy --prod
```

## 📞 Suporte

### Recursos Úteis
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Status**: [netlify-status.com](https://netlify-status.com)
- **Community**: [community.netlify.com](https://community.netlify.com)

### Logs e Debug
- **Build logs**: Dashboard do Netlify
- **Function logs**: Functions tab
- **Deploy logs**: Deploys tab

## 🎯 Checklist de Deploy

### Antes do Deploy
- [ ] Frontend builda localmente
- [ ] API está funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio personalizado (se aplicável)

### Durante o Deploy
- [ ] Build sem erros
- [ ] Arquivos estáticos servidos
- [ ] Redirects funcionando
- [ ] API conectada

### Após o Deploy
- [ ] Site carrega corretamente
- [ ] Login funciona
- [ ] API responde
- [ ] Mobile responsivo

---

**✅ Pronto!** Seu frontend estará online no Netlify em poucos minutos. 