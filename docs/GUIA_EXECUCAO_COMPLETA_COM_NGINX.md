# 🚀 GUIA COMPLETO - EXECUTAR SISTEMA COM NGINX

## 📋 **PRÉ-REQUISITOS**
- Node.js instalado (versão 14 ou superior)
- NPM (Node Package Manager)
- Nginx instalado (ou disponível em: `C:\Users\Bruno Galindo\Documents\nginx-1.29.0`)
- Conexão com internet

---

## 🚀 **EXECUTAR SISTEMA COMPLETO COM NGINX**

### **⭐ OPÇÃO RECOMENDADA - PowerShell:**
```powershell
# Na pasta raiz do projeto, execute:
.\executar_sistema_completo_com_nginx.ps1
```

### **⭐ OPÇÃO ALTERNATIVA - Batch:**
```cmd
# Na pasta raiz do projeto, execute:
executar_sistema_completo_com_nginx.bat
```

### **📱 Execução Manual (se necessário):**
```bash
# Terminal 1 - Backend
node backend/backend.js

# Terminal 2 - Frontend  
cd frontend
npm start

# Terminal 3 - Nginx
"C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe"

# Terminal 4 - WhatsApp (opcional)
node chat.js
```

---

## 🌐 **ACESSAR O SISTEMA**

Após a execução, você pode acessar:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **URL Principal**: http://ouvadmin/venturosa
- **URL Nginx**: http://localhost

#### **🔑 Logins de Teste:**
- **Master**: CPF `12345678900` / Senha `admin123`
- **Secretaria**: CPF `98765432100` / Senha `secretaria123`

---

## 🛑 **FINALIZAR SISTEMA COMPLETO COM NGINX**

### **⭐ OPÇÃO RECOMENDADA - PowerShell:**
```powershell
# Para encerrar todo o sistema:
.\fechar_sistema_completo_com_nginx.ps1
```

### **⭐ OPÇÃO ALTERNATIVA - Batch:**
```cmd
# Para encerrar todo o sistema:
fechar_sistema_completo_com_nginx.bat
```

### **📱 Encerramento Manual:**
```bash
# Encerrar processos nas portas
# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID] /F

netstat -ano | findstr :3001  
taskkill /PID [PID] /F

netstat -ano | findstr :80
taskkill /PID [PID] /F

# Encerrar Nginx
"C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe" -s stop
```

---

## 🔧 **CONFIGURAÇÃO DO NGINX**

### **Verificar se Nginx está instalado:**
```powershell
# Verificar se o caminho existe
Test-Path "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe"
```

### **Se Nginx não estiver instalado:**
1. Baixe o Nginx para Windows
2. Extraia para: `C:\Users\Bruno Galindo\Documents\nginx-1.29.0\`
3. Ou ajuste o caminho no script conforme necessário

### **Testar configuração do Nginx:**
```powershell
# Testar se a configuração está correta
.\testar_nginx.ps1

# Verificar status do Nginx
.\verificar_nginx.ps1
```

---

## 🔧 **SOLUÇÃO DE PROBLEMAS**

#### **Se o sistema não iniciar:**
1. Execute: `.\fechar_sistema_completo_com_nginx.ps1`
2. Aguarde 5 segundos
3. Execute: `.\executar_sistema_completo_com_nginx.ps1`

#### **Se aparecer erro de permissão PowerShell:**
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### **Se as dependências não estiverem instaladas:**
```bash
npm install
cd frontend
npm install
```

#### **Se Nginx não iniciar:**
```powershell
# Verificar se Nginx está instalado
.\verificar_nginx.ps1

# Preparar ambiente Nginx
.\preparar_nginx.ps1

# Iniciar Nginx manualmente
.\iniciar_nginx_manual.ps1
```

#### **Para testar o WhatsApp:**
```bash
node test_qr.js
```

---

## 📊 **FUNCIONALIDADES DISPONÍVEIS**

#### **Para o Ouvidor Master:**
- ✅ Visualizar todas as demandas
- ✅ Exportar relatórios (PDF, Excel, CSV)
- ✅ Gerenciar usuários
- ✅ Verificar alertas de prazo
- ✅ Resolver solicitações encaminhadas

#### **Para Responsáveis de Secretaria:**
- ✅ Visualizar demandas da secretaria
- ✅ Responder demandas
- ✅ Atualizar status
- ✅ Encaminhar ao ouvidor

#### **Chatbot WhatsApp:**
- ✅ Atendimento automático
- ✅ Coleta de dados
- ✅ Encaminhamento para secretarias
- ✅ Geração de protocolos
- ✅ Relatórios automáticos

#### **Nginx (Proxy Reverso):**
- ✅ Balanceamento de carga
- ✅ Proxy reverso para Backend/Frontend
- ✅ SSL/TLS (se configurado)
- ✅ Cache estático
- ✅ Compressão gzip

---

## 🆘 **SUPORTE**

Se encontrar problemas:
1. Verifique se o Node.js está instalado: `node --version`
2. Verifique se as dependências estão instaladas: `npm list`
3. Execute o teste de QR Code: `node test_qr.js`
4. Verifique os logs no terminal
5. Use o script batch como alternativa: `executar_sistema_completo_com_nginx.bat`
6. Feche e reinicie o sistema: `fechar_sistema_completo_com_nginx.bat` → `executar_sistema_completo_com_nginx.bat`

**Resumo dos comandos principais:**
- **Iniciar**: `.\executar_sistema_completo_com_nginx.ps1`
- **Finalizar**: `.\fechar_sistema_completo_com_nginx.ps1`
- **Acesso**: http://localhost:3000 ou http://localhost

---

## 📝 **ARQUIVOS CRIADOS**

### **Scripts de Execução:**
- `executar_sistema_completo_com_nginx.ps1` - PowerShell
- `executar_sistema_completo_com_nginx.bat` - Batch
- `fechar_sistema_completo_com_nginx.ps1` - PowerShell
- `fechar_sistema_completo_com_nginx.bat` - Batch

### **Documentação:**
- `GUIA_EXECUCAO_COMPLETA_COM_NGINX.md` - Este guia

O sistema está pronto para uso completo com Nginx! 🎉 