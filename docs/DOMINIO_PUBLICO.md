# Configuração de Domínio Público - OUNADMIN

## 🌐 Objetivo
Configurar `ouvadmin/venturosa` como URL pública acessível pela internet.

## 📋 Opções Disponíveis

### Opção 1: Domínio Real (Recomendado)

#### 1.1 Registrar um Domínio
- Comprar domínio: `ouvadmin.com` ou `ouvadmin.com.br`
- Custo: ~R$ 30-50/ano
- Registradores recomendados: GoDaddy, Namecheap, Registro.br

#### 1.2 Configurar DNS
```
A     ouvadmin.com      → [SEU_IP_PUBLICO]
A     www.ouvadmin.com  → [SEU_IP_PUBLICO]
```

#### 1.3 Configurar Port Forwarding
No seu roteador:
- Porta 80 → 192.168.1.141
- Porta 443 → 192.168.1.141

### Opção 2: Serviços de Túnel (Gratuito)

#### 2.1 ngrok (Temporário)
```bash
# Instalar ngrok
# Baixar de: https://ngrok.com/

# Executar
ngrok http 80

# Resultado: https://abc123.ngrok.io/venturosa
```

#### 2.2 Cloudflare Tunnel (Permanente)
```bash
# Instalar cloudflared
# Configurar tunnel para ouvadmin.com
```

#### 2.3 No-IP (Domínio Dinâmico)
- Criar conta gratuita
- Configurar domínio: `ouvadmin.ddns.net`
- Instalar cliente DDNS

### Opção 3: VPS/Cloud (Profissional)

#### 3.1 Configurar VPS
- Alugar VPS (DigitalOcean, AWS, etc.)
- Configurar domínio para VPS
- Fazer deploy do sistema

## 🔧 Configuração Atual

### Status Atual:
- ✅ Nginx configurado para `ouvadmin`
- ✅ Arquivo hosts local configurado
- ✅ Servidores aceitando conexões externas
- ❌ Domínio público não configurado

### URLs Atuais:
- Local: `http://ouvadmin/venturosa`
- Rede: `http://192.168.1.141/venturosa`
- Público: ❌ Não configurado

## 🚀 Passos para Configurar Domínio Público

### Passo 1: Obter IP Público
```powershell
# Verificar IP público
Invoke-WebRequest -Uri "https://ipinfo.io/ip"
```

### Passo 2: Configurar Port Forwarding
1. Acessar roteador (192.168.1.1)
2. Configurar port forwarding:
   - Porta 80 → 192.168.1.141
   - Porta 443 → 192.168.1.141

### Passo 3: Registrar Domínio
1. Comprar domínio `ouvadmin.com`
2. Configurar DNS:
   ```
   A     ouvadmin.com      → [SEU_IP_PUBLICO]
   A     www.ouvadmin.com  → [SEU_IP_PUBLICO]
   ```

### Passo 4: Configurar SSL
```bash
# Usar Let's Encrypt
certbot --nginx -d ouvadmin.com -d www.ouvadmin.com
```

### Passo 5: Atualizar Nginx
```nginx
server {
    listen 443 ssl;
    server_name ouvadmin.com www.ouvadmin.com;
    
    ssl_certificate /etc/letsencrypt/live/ouvadmin.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ouvadmin.com/privkey.pem;
    
    # ... resto da configuração
}
```

## 📱 URLs Finais

### Após Configuração:
- **Público:** `https://ouvadmin.com/venturosa`
- **Local:** `http://ouvadmin/venturosa`
- **Rede:** `http://192.168.1.141/venturosa`

## 💰 Custos Estimados

### Opção Domínio Real:
- Domínio: R$ 30-50/ano
- SSL: Gratuito (Let's Encrypt)
- Total: ~R$ 30-50/ano

### Opção Serviços Gratuitos:
- ngrok: Gratuito (limitado)
- No-IP: Gratuito (limitado)
- Cloudflare: Gratuito

## 🔍 Teste de Funcionamento

### Teste Local:
```powershell
Invoke-WebRequest -Uri "http://ouvadmin/venturosa" -Method Head
```

### Teste Público (após configuração):
```powershell
Invoke-WebRequest -Uri "https://ouvadmin.com/venturosa" -Method Head
```

## 📞 Próximos Passos

1. **Escolher opção** (domínio real ou serviço gratuito)
2. **Configurar port forwarding** no roteador
3. **Registrar domínio** (se escolher opção 1)
4. **Configurar SSL** para HTTPS
5. **Testar acesso** público

## 🛠️ Comandos Úteis

```powershell
# Verificar IP público
Invoke-WebRequest -Uri "https://ipinfo.io/ip"

# Testar conectividade
Test-NetConnection -ComputerName ouvadmin.com -Port 80

# Verificar status dos serviços
.\mostrar_urls.ps1
```

## 📋 Checklist

- [ ] Escolher opção de domínio público
- [ ] Configurar port forwarding
- [ ] Registrar domínio (se aplicável)
- [ ] Configurar DNS
- [ ] Configurar SSL/HTTPS
- [ ] Testar acesso público
- [ ] Documentar URLs finais 