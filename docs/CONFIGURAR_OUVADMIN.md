# Configuração do Domínio OUNADMIN

## 🌐 URLs Atualizadas

O sistema agora está configurado para usar o domínio `ouvadmin` em vez do IP:

### URLs Principais:
- **http://ouvadmin/venturosa** (URL principal)
- **http://ouvadmin** (URL alternativa)

### URLs de Backup:
- **http://192.168.1.141/venturosa** (com IP)
- **http://localhost/venturosa** (acesso local)

## 📋 Como Configurar em Outras Máquinas

Para que outras máquinas na rede possam acessar usando `ouvadmin`, você precisa configurar o arquivo hosts:

### Windows:
1. Abra o Bloco de Notas como **Administrador**
2. Abra o arquivo: `C:\Windows\System32\drivers\etc\hosts`
3. Adicione a linha:
   ```
   192.168.1.141 ouvadmin
   ```
4. Salve o arquivo

### Linux/Mac:
1. Abra o terminal
2. Edite o arquivo hosts:
   ```bash
   sudo nano /etc/hosts
   ```
3. Adicione a linha:
   ```
   192.168.1.141 ouvadmin
   ```
4. Salve (Ctrl+X, Y, Enter)

### Android:
1. Instale um app como "Hosts Go" ou similar
2. Adicione a entrada:
   ```
   192.168.1.141 ouvadmin
   ```

### iOS:
1. Instale um app como "DNS Override" ou similar
2. Adicione a entrada:
   ```
   192.168.1.141 ouvadmin
   ```

## 🔧 Configurações Realizadas

### Nginx:
- ✅ Configurado para aceitar `ouvadmin` como server_name
- ✅ Proxy configurado para API
- ✅ Servindo arquivos estáticos

### Arquivo Hosts:
- ✅ Mapeamento: `192.168.1.141 ouvadmin`
- ✅ Funciona para acesso local e externo

### Servidores:
- ✅ Backend API (porta 3001)
- ✅ Servidor Principal (porta 3000)
- ✅ Nginx (porta 80)

## 📱 Acesso de Dispositivos Móveis

### Com Configuração de Hosts:
1. Configure o arquivo hosts no dispositivo
2. Acesse: `http://ouvadmin/venturosa`

### Sem Configuração de Hosts:
1. Use diretamente o IP: `http://192.168.1.141/venturosa`

## 🚀 Para Acesso Público (Internet)

Para tornar `ouvadmin` acessível pela internet:

1. **Configure Port Forwarding** no roteador:
   - Porta 80 → 192.168.1.141
   - Porta 443 → 192.168.1.141

2. **Registre um domínio** (opcional):
   - Compre um domínio como `ouvadmin.com`
   - Configure DNS para apontar para seu IP público

3. **Configure SSL/HTTPS** (recomendado):
   - Use Let's Encrypt ou similar
   - Configure certificado SSL

## 🔍 Teste de Funcionamento

Para testar se está funcionando:

```powershell
# Teste local
Invoke-WebRequest -Uri "http://ouvadmin/venturosa" -Method Head

# Teste com IP
Invoke-WebRequest -Uri "http://192.168.1.141/venturosa" -Method Head
```

## 📞 Solução de Problemas

### Se `ouvadmin` não funcionar:
1. Verifique se o arquivo hosts está correto
2. Teste com o IP diretamente
3. Verifique se está na mesma rede
4. Reinicie o navegador após alterar hosts

### Se o site não carregar:
1. Verifique se os serviços estão rodando
2. Execute: `.\mostrar_urls.ps1`
3. Verifique firewall/antivírus
4. Teste acesso local primeiro

## 📋 Comandos Úteis

```powershell
# Verificar status dos serviços
netstat -an | findstr ":80"
netstat -an | findstr ":300"

# Mostrar URLs
.\mostrar_urls.ps1

# Reiniciar nginx
taskkill /F /IM nginx.exe
Start-Process -FilePath "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe" -WindowStyle Hidden
``` 