# 🚀 GUIA COMPLETO DE EXECUÇÃO DO SISTEMA DE OUVIDORIA

## 📋 ÍNDICE
1. [Pré-requisitos](#pré-requisitos)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Instalação](#instalação)
4. [Execução Completa do Sistema](#execução-completa-do-sistema)
5. [Execução Individual dos Componentes](#execução-individual-dos-componentes)
6. [Fechamento do Sistema](#fechamento-do-sistema)
7. [URLs de Acesso](#urls-de-acesso)
8. [Troubleshooting](#troubleshooting)
9. [Backup e Restauração](#backup-e-restauração)

---

## 🔧 PRÉ-REQUISITOS

### Software Necessário:
- **Node.js** (versão 16 ou superior)
- **npm** (vem com Node.js)
- **Python** (versão 3.8 ou superior)
- **Nginx** (para produção)
- **Git** (para clonar o repositório)

### Verificar Instalações:
```bash
node --version
npm --version
python --version
nginx -v
git --version
```

---

## 📁 ESTRUTURA DO PROJETO

```
CHATBOT OUV/
├── 📁 backend/                 # API REST do sistema
│   ├── 📁 api/                # Endpoints da API
│   ├── 📁 node_modules/       # Dependências do backend
│   ├── ouvidoria.db          # Banco de dados SQLite
│   ├── backend.js            # Servidor principal
│   ├── index.js              # Configuração do servidor
│   └── package.json          # Dependências do backend
├── 📁 frontend/               # Interface web React
│   ├── 📁 public/            # Arquivos públicos
│   ├── 📁 src/               # Código fonte React
│   ├── 📁 build/             # Build de produção
│   └── package.json          # Dependências do frontend
├── 📁 chatbot/                # Bot do WhatsApp
│   ├── 📁 src/               # Código fonte do bot
│   ├── 📁 logs/              # Logs do chatbot
│   ├── 📁 relatorios/        # Relatórios gerados
│   └── package.json          # Dependências do chatbot
├── 📁 config/                 # Configurações do Nginx
│   ├── nginx.conf            # Configuração principal
│   ├── mime.types            # Tipos MIME
│   ├── configurar_nginx.ps1  # Script de configuração
│   └── preparar_nginx.ps1    # Script de preparação
├── 📁 scripts/                # Scripts de automação
│   ├── executar_sistema_completo_com_nginx.ps1
│   └── fechar_sistema_completo_com_nginx.ps1
├── 📁 docs/                   # Documentação
├── 📁 assets/                 # Imagens e recursos
├── 📁 anexos/                 # Arquivos anexados
├── 📁 relatorios/             # Relatórios gerais
├── chat.js                    # Chat principal (legado)
└── package.json               # Dependências principais
```

---

## ⚙️ INSTALAÇÃO

### 1. Clonar o Repositório
```bash
git clone [URL_DO_REPOSITORIO]
cd "CHATBOT OUV"
```

### 2. Instalar Dependências Principais
```bash
npm install
```

### 3. Instalar Dependências do Backend
```bash
cd backend
npm install
cd ..
```

### 4. Instalar Dependências do Frontend
```bash
cd frontend
npm install
cd ..
```

### 5. Instalar Dependências do Chatbot
```bash
cd chatbot
npm install
cd ..
```

### 6. Configurar Nginx (Opcional - para produção)
```bash
cd config
./configurar_nginx.ps1
cd ..
```

---

## 🚀 EXECUÇÃO COMPLETA DO SISTEMA

### Método 1: Script Automatizado (Recomendado)
```bash
# Executar todo o sistema incluindo Nginx
./scripts/executar_sistema_completo_com_nginx.ps1
```

### Método 2: Execução Manual
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start

# Terminal 3 - Chatbot
cd chatbot
npm start
```

---

## 🔧 EXECUÇÃO INDIVIDUAL DOS COMPONENTES

### Backend (API REST)
```bash
cd backend
npm start
# Servidor rodando em: http://localhost:3001
```

### Frontend (Interface Web)
```bash
cd frontend
npm start
# Interface rodando em: http://localhost:3000
```

### Chatbot (WhatsApp)
```bash
cd chatbot
npm start
# Bot conectado ao WhatsApp
```

### Nginx (Proxy Reverso)
```bash
cd config
./preparar_nginx.ps1
# Nginx configurado e iniciado
```

---

## 🛑 FECHAMENTO DO SISTEMA

### Método 1: Script Automatizado
```bash
./scripts/fechar_sistema_completo_com_nginx.ps1
```

### Método 2: Fechamento Manual
```bash
# Parar Nginx
taskkill /f /im nginx.exe

# Parar processos Node.js
taskkill /f /im node.exe

# Ou usar Ctrl+C em cada terminal
```

---

## 🌐 URLS DE ACESSO

### Desenvolvimento Local:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Documentação API**: http://localhost:3001/api

### Produção (com Nginx):
- **Sistema Principal**: http://localhost:80
- **API**: http://localhost/api
- **Admin**: http://localhost/admin

### URLs Específicas:
- **Lista de Demandas**: http://localhost/demandas
- **Detalhes de Demanda**: http://localhost/demanda/[ID]
- **Editor de Respostas**: http://localhost/editor
- **Estatísticas**: http://localhost/estatisticas

---

## 🔍 TROUBLESHOOTING

### Problemas Comuns:

#### 1. Porta já em uso
```bash
# Verificar processos usando as portas
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :80

# Matar processo específico
taskkill /PID [NUMERO_DO_PROCESSO] /F
```

#### 2. Erro de dependências
```bash
# Limpar cache do npm
npm cache clean --force

# Remover node_modules e reinstalar
rm -rf node_modules
npm install
```

#### 3. Erro de banco de dados
```bash
# Verificar se o banco existe
ls backend/ouvidoria.db

# Se não existir, criar
cd backend
node initDatabase.js
```

#### 4. Erro do Nginx
```bash
# Verificar configuração
nginx -t

# Reiniciar Nginx
nginx -s reload
```

#### 5. Chatbot não conecta
```bash
# Verificar logs
cd chatbot/logs
tail -f chatbot.log

# Verificar QR Code
cat last_qrcode.txt
```

### Logs Importantes:
- **Backend**: `backend/logs/`
- **Frontend**: Console do navegador
- **Chatbot**: `chatbot/logs/`
- **Nginx**: `/var/log/nginx/` (Linux) ou logs do Windows

---

## 💾 BACKUP E RESTAURAÇÃO

### Backup do Banco de Dados
```bash
# Backup automático
cp backend/ouvidoria.db backup/ouvidoria_$(date +%Y%m%d_%H%M%S).db

# Backup manual
cp backend/ouvidoria.db backup/ouvidoria_backup.db
```

### Restauração do Banco
```bash
# Parar o sistema
./scripts/fechar_sistema_completo_com_nginx.ps1

# Restaurar backup
cp backup/ouvidoria_backup.db backend/ouvidoria.db

# Reiniciar sistema
./scripts/executar_sistema_completo_com_nginx.ps1
```

### Backup Completo do Sistema
```bash
# Criar backup completo
tar -czf backup_sistema_$(date +%Y%m%d_%H%M%S).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=logs \
  .
```

---

## 📊 MONITORAMENTO

### Verificar Status dos Serviços
```bash
# Verificar processos Node.js
tasklist | findstr node

# Verificar porta do Nginx
netstat -ano | findstr :80

# Verificar uso de memória
wmic process where name="node.exe" get ProcessId,WorkingSetSize
```

### Métricas Importantes:
- **CPU**: Monitorar uso do Node.js
- **Memória**: Verificar vazamentos
- **Disco**: Espaço para logs e anexos
- **Rede**: Latência das APIs

---

## 🔐 SEGURANÇA

### Configurações Recomendadas:
1. **Firewall**: Bloquear portas desnecessárias
2. **HTTPS**: Configurar SSL/TLS em produção
3. **Autenticação**: Implementar login seguro
4. **Backup**: Backup regular do banco de dados
5. **Logs**: Monitorar logs de acesso

### Variáveis de Ambiente:
```bash
# Criar arquivo .env no backend
NODE_ENV=production
PORT=3001
DB_PATH=./ouvidoria.db
JWT_SECRET=sua_chave_secreta_aqui
```

---

## 📞 SUPORTE

### Informações de Contato:
- **Desenvolvedor**: [SEU_NOME]
- **Email**: [SEU_EMAIL]
- **Telefone**: [SEU_TELEFONE]

### Documentação Adicional:
- **README.md**: Documentação geral
- **MANUAL.MD**: Manual detalhado
- **docs/**: Documentação específica

---

## 🎯 COMANDOS RÁPIDOS

### Iniciar Sistema Completo:
```bash
./scripts/executar_sistema_completo_com_nginx.ps1
```

### Parar Sistema Completo:
```bash
./scripts/fechar_sistema_completo_com_nginx.ps1
```

### Verificar Status:
```bash
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :80
```

### Reiniciar Serviço Específico:
```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm start

# Chatbot
cd chatbot && npm start
```

---

## 📝 NOTAS IMPORTANTES

1. **Sempre execute os scripts como administrador** no Windows
2. **Mantenha o sistema atualizado** regularmente
3. **Faça backup regular** do banco de dados
4. **Monitore os logs** para identificar problemas
5. **Teste em ambiente de desenvolvimento** antes de produção
6. **Mantenha as dependências atualizadas**
7. **Documente mudanças** no sistema

---

## ✅ CHECKLIST DE VERIFICAÇÃO

- [ ] Node.js instalado e funcionando
- [ ] npm instalado e funcionando
- [ ] Python instalado e funcionando
- [ ] Nginx instalado (se necessário)
- [ ] Dependências instaladas
- [ ] Banco de dados criado
- [ ] Configurações do Nginx aplicadas
- [ ] Portas disponíveis (3000, 3001, 80)
- [ ] Firewall configurado
- [ ] Backup inicial realizado
- [ ] Logs configurados
- [ ] Sistema testado

---

**🎉 Sistema pronto para uso!**

Para dúvidas ou problemas, consulte a documentação em `docs/` ou entre em contato com o suporte.
