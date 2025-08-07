# 🚀 GUIA RÁPIDO DE EXECUÇÃO

## 📋 Pré-requisitos
- Node.js instalado (versão 14 ou superior)
- NPM (Node Package Manager)
- Conexão com internet

## 🔧 Instalação
1. Abra o terminal na pasta do projeto
2. Execute: `npm install`
3. Aguarde a instalação das dependências

## 🚀 Como Executar

### ⭐ **OPÇÃO RECOMENDADA: Sistema Completo**

#### **Windows - PowerShell (CORRIGIDO):**
```powershell
# Executar sistema completo (Backend + Frontend)
.\executar_sistema_completo.ps1

# Fechar sistema completo
.\fechar_sistema_completo.ps1
```

#### **Windows - Batch:**
```cmd
# Executar sistema completo (Backend + Frontend)
executar_sistema_completo.bat

# Fechar sistema completo
fechar_sistema_completo.bat
```

### 🔧 **OPÇÕES INDIVIDUAIS:**

#### **Windows - PowerShell:**
```powershell
# Versão simples (mais compatível)
.\iniciar_sistema_simples.ps1

# Versão original (pode ter problemas de sintaxe)
.\iniciar_sistema_corrigido.ps1
```

#### **Windows - Batch:**
```cmd
iniciar_sistema.bat
```

#### **Linux/Mac:**
```bash
./iniciar_sistema_corrigido.ps1
```

### 📱 **Execução Manual:**

#### Para iniciar apenas o Chatbot WhatsApp:
```bash
node chat.js
```

#### Para testar o QR Code:
```bash
node test_qr.js
```

#### Para iniciar apenas a Interface Web:
```bash
node backend.js
```

#### Para iniciar o Frontend React:
```bash
cd frontend
npm start
```

## 📱 Configuração do WhatsApp

1. Execute o chatbot: `node chat.js`
2. Aguarde o QR Code aparecer no terminal
3. Escaneie o QR Code com seu WhatsApp
4. Aguarde a mensagem "Cliente WhatsApp pronto!"

## 🌐 Acessando a Interface Web

- **URL Principal**: http://localhost:3001
- **Login Master**: CPF 12345678900 / Senha admin123
- **Login Secretaria**: CPF 98765432100 / Senha secretaria123

## 🔧 Solução de Problemas

### Erro de QR Code não aparece:
```bash
node test_qr.js
```

### Erro de dependências:
```bash
npm install
```

### Erro de porta em uso:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID [PID] /F

# Linux/Mac
lsof -i :3001
kill -9 [PID]
```

### Erro de autenticação WhatsApp:
1. Delete a pasta `.wwebjs_auth` (se existir)
2. Execute novamente: `node chat.js`

### Erro de sintaxe PowerShell (RESOLVIDO):
- Os scripts PowerShell foram corrigidos e agora funcionam sem problemas
- Use: `.\executar_sistema_completo.ps1`
- Ou use o script batch como alternativa: `executar_sistema_completo.bat`

### Sistema não inicia completamente:
1. Execute: `fechar_sistema_completo.bat` (ou .ps1)
2. Aguarde 5 segundos
3. Execute: `executar_sistema_completo.bat` (ou .ps1)

## 📊 Funcionalidades Disponíveis

### Para o Ouvidor Master:
- ✅ Visualizar todas as demandas
- ✅ Exportar relatórios (PDF, Excel, CSV)
- ✅ Gerenciar usuários
- ✅ Verificar alertas de prazo
- ✅ Resolver solicitações encaminhadas

### Para Responsáveis de Secretaria:
- ✅ Visualizar demandas da secretaria
- ✅ Responder demandas
- ✅ Atualizar status
- ✅ Encaminhar ao ouvidor

### Chatbot WhatsApp:
- ✅ Atendimento automático
- ✅ Coleta de dados
- ✅ Encaminhamento para secretarias
- ✅ Geração de protocolos
- ✅ Relatórios automáticos

## 🆘 Suporte

Se encontrar problemas:
1. Verifique se o Node.js está instalado: `node --version`
2. Verifique se as dependências estão instaladas: `npm list`
3. Execute o teste de QR Code: `node test_qr.js`
4. Verifique os logs no terminal
5. Use o script batch como alternativa: `executar_sistema_completo.bat`
6. Feche e reinicie o sistema: `fechar_sistema_completo.bat` → `executar_sistema_completo.bat`

## 📞 Contato

Para suporte técnico, entre em contato com a equipe de desenvolvimento. 