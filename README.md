# 🤖 Sistema de Ouvidoria Municipal - Venturosa

## 📁 Estrutura do Projeto

```
CHATBOT OUV/
├── 📁 scripts/           # Scripts de inicialização e execução
├── 📁 config/            # Arquivos de configuração
├── 📁 database/          # Banco de dados
├── 📁 logs/              # Logs do sistema
├── 📁 temp/              # Arquivos temporários
├── 📁 docs/              # Documentação
├── 📁 backend/           # Servidor backend
├── 📁 frontend/          # Aplicação React
├── 📁 assets/            # Recursos estáticos
├── 📁 anexos/            # Anexos de mensagens
├── 📄 chat.js            # Código principal do chatbot
└── 📄 .gitignore         # Configuração do Git
```

## 🚀 Como Executar

### 🌐 **DEPLOY PÚBLICO GRATUITO (Recomendado)**

#### 🥇 Opção 1: ngrok (Mais Rápido - 5 minutos)
```powershell
# Baixar ngrok de: https://ngrok.com/download
# Executar sistema
.\executar_sistema_completo_com_nginx.ps1
# Em novo terminal: ngrok http 80
# URL pública: https://abc123.ngrok.io/venturosa
```

#### 🥈 Opção 2: Vercel (Permanente - 15 minutos)
```powershell
# Preparar arquivos
.\deploy_vercel.ps1
# Seguir instruções para deploy no Vercel
# Backend: Root Directory = backend
# Frontend: Root Directory = frontend
```

#### 📚 Documentação Completa:
- **Guia Rápido:** `DEPLOY_RAPIDO.md`
- **Guia Completo:** `docs/DEPLOY_GRATUITO_GUIDE.md`
- **Deploy Vercel:** `DEPLOY_VERCEL_RAPIDO.md`
- **Deploy Netlify:** `DEPLOY_NETLIFY_FRONTEND.md`

### 🏠 **EXECUÇÃO LOCAL**

#### Opção 1: Execução Completa (Recomendado)
```powershell
# Executar sistema completo com nginx
.\scripts\executar_sistema_completo_com_nginx.ps1
```

#### Opção 2: Execução Simples
```powershell
# Executar sistema simples
.\iniciar_sistema_simples.ps1
```

#### Opção 3: Menu Interativo
```powershell
# Menu com opções
.\iniciar_sistema.ps1
```

#### Opção 4: Execução Manual
```powershell
# Iniciar backend
.\scripts\iniciar_backend.js

# Iniciar frontend
cd frontend
npm start

# Iniciar nginx
.\scripts\iniciar_nginx_manual.ps1
```

## 📋 Scripts Disponíveis

### 🟢 Scripts de Inicialização
- `iniciar_sistema_completo.ps1` - Inicia todo o sistema
- `iniciar_backend.js` - Inicia apenas o backend
- `iniciar_whatsapp.js` - Inicia apenas o WhatsApp
- `iniciar_nginx_manual.ps1` - Inicia o nginx manualmente

### 🔴 Scripts de Finalização
- `fechar_sistema_completo.ps1` - Para todo o sistema
- `fechar_sistema.ps1` - Para processos básicos

### ⚙️ Scripts de Configuração
- `configurar_nginx.ps1` - Configura o nginx
- `preparar_nginx.ps1` - Prepara ambiente nginx
- `testar_nginx.ps1` - Testa configuração nginx
- `verificar_nginx.ps1` - Verifica status nginx

### 🛠️ Scripts Utilitários
- `cadastrar_master.js` - Cadastra usuário master
- `mostrar_urls.ps1` - Mostra URLs de acesso

## 🌐 URLs de Acesso

### 🌍 **ACESSO PÚBLICO (Internet)**
- **ngrok:** `https://abc123.ngrok.io/venturosa` (temporário)
- **Vercel:** `https://seu-dominio.vercel.app/venturosa` (permanente)
- **Netlify:** `https://seu-dominio.netlify.app/venturosa` (permanente)

### 🏠 **ACESSO LOCAL**
- **Principal:** http://localhost/venturosa
- **Alternativa:** http://127.0.0.1/venturosa

### 🌐 **REDE LOCAL**
- **Principal:** http://ouvadmin/venturosa
- **IP:** http://192.168.1.141/venturosa

### 🔧 **DESENVOLVIMENTO**
- **Frontend:** http://192.168.1.141:3000/venturosa
- **API:** http://192.168.1.141:3001/api/health

## 📚 Documentação

Toda a documentação está organizada na pasta `docs/`:

- **Guia Rápido:** `docs/GUIA_RAPIDO_EXECUCAO.md`
- **Manual Completo:** `docs/MANUAL_EXECUCAO_SISTEMA.md`
- **Configuração de Domínio:** `docs/DOMINIO_PUBLICO.md`
- **URLs de Acesso:** `docs/URLS_ACESSO.md`

## 🔧 Configuração

### Banco de Dados
- **Localização:** `database/ouvidoria.db`
- **Tipo:** SQLite
- **Backup:** Automático

### Nginx
- **Configuração:** `config/nginx.conf`
- **Mime Types:** `config/mime.types`
- **Logs:** `logs/`

### Node.js
- **Package.json:** `config/package.json`
- **Dependências:** `node_modules/`

## 📱 Funcionalidades

### 🤖 Chatbot WhatsApp
- Atendimento automatizado
- Encaminhamento para secretarias
- Geração de protocolos
- Suporte a anexos

### 🏛️ Secretarias Atendidas
1. **Desenvolvimento Rural e Meio Ambiente**
2. **Assistência Social**
3. **Educação e Esporte**
4. **Infraestrutura e Segurança Pública**
5. **Saúde e Direitos da Mulher**
6. **Hospital e Maternidade**
7. **Programa Mulher Segura**
8. **Finanças (Tributos)**
9. **Administração (Servidores)**

### 📊 Relatórios
- Relatórios mensais automáticos
- Relatórios por protocolo
- Estatísticas de atendimento

## 🛡️ Segurança

- ✅ Autenticação de administradores
- ✅ Validação de dados
- ✅ Logs de auditoria
- ✅ Backup automático

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs em `logs/`
2. Consulte a documentação em `docs/`
3. Execute `.\scripts\verificar_nginx.ps1` para diagnóstico

## 🔄 Manutenção

### Limpeza de Logs
```powershell
# Limpar logs antigos
Remove-Item "logs\*.log" -Force
```

### Backup do Banco
```powershell
# Fazer backup do banco
Copy-Item "database\ouvidoria.db" "database\ouvidoria_backup_$(Get-Date -Format 'yyyyMMdd').db"
```

### Atualização
```powershell
# Atualizar dependências
cd config
npm update
```

---

**Desenvolvido para a Prefeitura Municipal de Venturosa** 🏛️ 