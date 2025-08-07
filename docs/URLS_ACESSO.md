# URLs de Acesso ao Sistema da Ouvidoria

## 🌐 URLs Disponíveis

### Acesso Local (mesma máquina)
- **URL Principal:** http://localhost/venturosa
- **URL Alternativa:** http://127.0.0.1/venturosa

### Acesso Externo (outras máquinas/dispositivos)
- **URL Principal:** http://ouvadmin/venturosa
- **URL Alternativa:** http://ouvadmin
- **URL com IP:** http://192.168.1.141/venturosa

### Acesso Direto aos Servidores (para desenvolvimento)
- **Servidor Principal:** http://192.168.1.141:3000/venturosa
- **API Backend:** http://192.168.1.141:3001/api/health

## 📱 Como Acessar de Dispositivos Móveis

1. **Certifique-se de que o dispositivo está na mesma rede Wi-Fi**
2. **Abra o navegador no celular/tablet**
3. **Digite uma das URLs externas:**
   - http://ouvadmin/venturosa
   - http://ouvadmin
   - http://192.168.1.141/venturosa

## 🔧 Configurações de Rede

### Firewall
- **Porta 80:** Aberta para acesso HTTP
- **Porta 3000:** Servidor principal (proxy)
- **Porta 3001:** API backend

### Serviços Ativos
- ✅ Nginx (porta 80)
- ✅ Servidor Principal (porta 3000)
- ✅ API Backend (porta 3001)

## 🚀 Para Acesso Público (Internet)

Para tornar o sistema acessível pela internet, você precisará:

1. **Configurar Port Forwarding** no roteador:
   - Porta 80 → IP da máquina (192.168.1.141)
   - Porta 443 → IP da máquina (192.168.1.141) (para HTTPS)

2. **Obter um IP Público** ou usar um serviço como:
   - ngrok (temporário)
   - No-IP (domínio dinâmico)
   - Cloudflare Tunnel

3. **Configurar um domínio** (opcional):
   - Comprar um domínio
   - Configurar DNS para apontar para o IP público

## 📋 Comandos Úteis

### Verificar Status dos Serviços
```powershell
# Verificar se os servidores estão rodando
netstat -an | findstr ":300"
netstat -an | findstr ":80"

# Verificar IP da máquina
ipconfig | findstr "IPv4"
```

### Reiniciar Serviços
```powershell
# Parar todos os serviços
taskkill /F /IM node.exe

# Iniciar backend
cd backend
node backend.js

# Iniciar servidor principal
node server.js
```

## 🔒 Segurança

- O sistema está configurado para aceitar conexões de qualquer IP
- Recomenda-se configurar firewall para restringir acesso se necessário
- Para produção, considere usar HTTPS

## 📞 Suporte

Se houver problemas de acesso:
1. Verifique se todos os serviços estão rodando
2. Confirme se o dispositivo está na mesma rede
3. Teste o acesso local primeiro
4. Verifique as configurações de firewall 