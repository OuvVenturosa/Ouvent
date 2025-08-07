# 🌐 Frontend - Sistema de Ouvidoria Municipal

## 📁 Estrutura

```
frontend/
├── public/              # Arquivos públicos
├── src/                 # Código fonte React
├── package.json         # Dependências e scripts
├── netlify.toml         # Configuração Netlify
└── README.md           # Este arquivo
```

## 🚀 Deploy no Netlify

### 1. Configuração Automática
O projeto já está configurado para deploy no Netlify com:
- ✅ `package.json` com todas as dependências
- ✅ `netlify.toml` com configurações otimizadas
- ✅ Headers de segurança configurados
- ✅ Redirects para SPA

### 2. Deploy Manual
1. Acesse [netlify.com](https://netlify.com)
2. Faça login com GitHub
3. Clique "New site from Git"
4. Escolha GitHub e selecione o repositório
5. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

### 3. Variáveis de Ambiente
```
REACT_APP_API_URL=https://seu-backend-vercel.vercel.app/api
NODE_VERSION=16
```

## 🔧 Desenvolvimento Local

### Instalar Dependências
```bash
cd frontend
npm install
```

### Executar em Desenvolvimento
```bash
npm start
```

### Build para Produção
```bash
npm run build
```

### Testar Build Local
```bash
npm run build
npx serve -s build
```

## 📡 Funcionalidades

### Páginas Principais
- **Login**: `/venturosa` - Área administrativa
- **Lista de Demandas**: `/venturosa/demandas`
- **Detalhes da Demanda**: `/venturosa/demanda/:id`
- **Editor de Respostas**: `/venturosa/editor/:id`

### Componentes Principais
- `App.js` - Componente principal
- `ListaDemandas.js` - Lista de demandas
- `DetalhesDemanda.js` - Detalhes da demanda
- `EditorResposta.js` - Editor de respostas

## 🎨 Estilos

### CSS Principal
- `App.css` - Estilos globais
- `ListaDemandas.css` - Estilos da lista
- `DetalhesDemanda.css` - Estilos dos detalhes
- `EditorResposta.css` - Estilos do editor

### Assets
- `logo_ouvidoria.png` - Logo da Ouvidoria
- `logo_prefeitura.png` - Logo da Prefeitura

## 🔐 Autenticação

### Login Padrão
- **CPF**: `admin`
- **Senha**: `admin123`

### Configuração de Segurança
- Headers de segurança configurados
- CORS configurado
- Validação de dados

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Testes
```bash
# Testar responsividade
npm run build
npx serve -s build
# Abrir em diferentes dispositivos
```

## 🔄 Integração com API

### Endpoints Utilizados
```javascript
// Listar demandas
GET /api/demandas

// Buscar demanda específica
GET /api/demandas/:protocolo

// Criar nova demanda
POST /api/demandas

// Atualizar status
PUT /api/demandas/:protocolo/status
```

### Configuração da API
```javascript
// Em .env ou variável de ambiente
REACT_APP_API_URL=https://seu-backend.vercel.app/api
```

## 🚨 Solução de Problemas

### Erro: "Build failed"
- ✅ Verifique se todas as dependências estão instaladas
- ✅ Confirme se o Node.js está na versão 16+
- ✅ Verifique os logs no Netlify Dashboard

### Erro: "API not found"
- ✅ Verifique se a variável `REACT_APP_API_URL` está correta
- ✅ Confirme se o backend está funcionando
- ✅ Teste a API diretamente

### Erro: "Page not found"
- ✅ Verifique se o arquivo `netlify.toml` tem as redirects corretas
- ✅ Confirme se o `build/index.html` existe

## 📊 Performance

### Otimizações
- ✅ Lazy loading de componentes
- ✅ Code splitting
- ✅ Minificação de assets
- ✅ Cache otimizado

### Métricas
- Tempo de carregamento inicial
- Tempo de carregamento de páginas
- Performance mobile
- Lighthouse score

## 🔄 Atualizações

### Deploy Automático
- ✅ Conectado ao GitHub
- ✅ Deploy automático a cada push
- ✅ Preview de branches

### Deploy Manual
```bash
# Build local
npm run build

# Deploy via CLI
netlify deploy --dir=build --prod
```

## 📞 Suporte

### Recursos Úteis
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **React Docs**: [reactjs.org](https://reactjs.org)
- **Create React App**: [create-react-app.dev](https://create-react-app.dev)

### Logs e Debug
- **Build logs**: Dashboard do Netlify
- **Console logs**: Browser DevTools
- **Network logs**: Browser DevTools

## 🎯 Checklist de Deploy

### Antes do Deploy
- [ ] Frontend builda localmente
- [ ] API está funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Testes passando

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

**✅ Pronto para Deploy!** O frontend está configurado e otimizado para o Netlify.
