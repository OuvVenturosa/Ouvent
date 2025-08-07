# Configuração de OUNADMIN.COM

## 🌐 Informações Atuais

**IP Público:** `45.237.166.236`  
**Domínio Desejado:** `ouvadmin.com`  
**URL Final:** `https://ouvadmin.com/venturosa`

## 📋 Passos para Configurar OUNADMIN.COM

### Passo 1: Registrar o Domínio

1. **Escolher um registrador:**
   - GoDaddy (recomendado)
   - Namecheap
   - Registro.br
   - Google Domains

2. **Comprar o domínio:**
   - Nome: `ouvadmin.com`
   - Custo: ~R$ 30-50/ano

### Passo 2: Configurar DNS

Após comprar o domínio, configure os registros DNS:

```
Tipo    Nome              Valor
A       @                 45.237.166.236
A       www               45.237.166.236
CNAME   *                 @
```

### Passo 3: Configurar Port Forwarding

No seu roteador (192.168.1.1):

```
Porta Externa    Porta Interna    IP Interno
80              → 80             → 192.168.1.141
443             → 443             → 192.168.1.141
```

### Passo 4: Configurar SSL/HTTPS

#### Opção A: Let's Encrypt (Gratuito)
```bash
# Instalar certbot
# Baixar de: https://certbot.eff.org/

# Gerar certificado
certbot --nginx -d ouvadmin.com -d www.ouvadmin.com
```

#### Opção B: Certificado do Registrador
- Comprar SSL do registrador
- Baixar certificados
- Configurar no nginx

### Passo 5: Atualizar Configuração do Nginx

Substituir o arquivo `nginx.conf` por:

```nginx
# Configuração para ouvadmin.com
server {
    listen 80;
    server_name ouvadmin.com www.ouvadmin.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ouvadmin.com www.ouvadmin.com;
    
    # Certificados SSL
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Configuração da aplicação
    location /venturosa {
        alias "J:/CHATBOT OUV/frontend/build";
        try_files $uri $uri/ /venturosa/index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location / {
        try_files $uri $uri/ /venturosa/index.html;
    }
}
```

## 🔧 Configuração Atual vs. Desejada

### Atual:
- ✅ Local: `http://ouvadmin/venturosa`
- ✅ Rede: `http://192.168.1.141/venturosa`
- ❌ Público: Não configurado

### Desejada:
- ✅ Local: `http://ouvadmin/venturosa`
- ✅ Rede: `http://192.168.1.141/venturosa`
- ✅ Público: `https://ouvadmin.com/venturosa`

## 💰 Custos Estimados

| Item | Custo | Frequência |
|------|-------|------------|
| Domínio | R$ 30-50 | Anual |
| SSL | Gratuito | Anual |
| **Total** | **R$ 30-50** | **Anual** |

## 🚀 URLs Finais

Após configuração completa:

- **Público Principal:** `https://ouvadmin.com/venturosa`
- **Público Alternativo:** `https://www.ouvadmin.com/venturosa`
- **Local:** `http://ouvadmin/venturosa`
- **Rede:** `http://192.168.1.141/venturosa`

## 📱 Acesso de Dispositivos

### Qualquer dispositivo na internet:
1. Abrir navegador
2. Digitar: `https://ouvadmin.com/venturosa`

### Sem configuração adicional!

## 🔍 Teste de Funcionamento

### Teste Local:
```powershell
Invoke-WebRequest -Uri "http://ouvadmin/venturosa" -Method Head
```

### Teste Público (após configuração):
```powershell
Invoke-WebRequest -Uri "https://ouvadmin.com/venturosa" -Method Head
```

## 📋 Checklist de Configuração

- [ ] Comprar domínio `ouvadmin.com`
- [ ] Configurar registros DNS
- [ ] Configurar port forwarding no roteador
- [ ] Instalar certificado SSL
- [ ] Atualizar configuração do nginx
- [ ] Testar acesso público
- [ ] Configurar backup e monitoramento

## 🛠️ Comandos Úteis

```powershell
# Verificar se o domínio está resolvendo
nslookup ouvadmin.com

# Testar conectividade
Test-NetConnection -ComputerName ouvadmin.com -Port 443

# Verificar certificado SSL
Invoke-WebRequest -Uri "https://ouvadmin.com" -Method Head
```

## 📞 Próximos Passos

1. **Comprar o domínio** `ouvadmin.com`
2. **Configurar DNS** com o IP `45.237.166.236`
3. **Configurar port forwarding** no roteador
4. **Instalar certificado SSL**
5. **Atualizar nginx**
6. **Testar acesso público**

## 🔒 Segurança

- ✅ HTTPS obrigatório
- ✅ Headers de segurança configurados
- ✅ SSL/TLS 1.2+ configurado
- ✅ Redirecionamento HTTP → HTTPS

## 📊 Monitoramento

Após configuração, monitorar:
- Disponibilidade do site
- Certificado SSL
- Logs de acesso
- Performance

---

**Resultado Final:** `https://ouvadmin.com/venturosa` acessível de qualquer lugar do mundo! 