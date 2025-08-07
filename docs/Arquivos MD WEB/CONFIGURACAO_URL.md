# Configuração da URL Personalizada

## Objetivo
Alterar a URL de acesso de `http://localhost:3000` para `http://ouvadmin/venturosa`

## Métodos de Configuração

### Método 1: Usando o Servidor Personalizado (Recomendado)

1. **Construir o frontend:**
   ```bash
   cd frontend
   npm run build
   cd ..
   ```

2. **Iniciar o sistema:**
   ```bash
   npm run serve
   ```

3. **Acessar:**
   - URL: `http://localhost:3000/venturosa`
   - Backend: `http://localhost:3001`

### Método 2: Usando Nginx (Produção)

1. **Instalar Nginx**

2. **Configurar o arquivo hosts:**
   ```
   127.0.0.1 ouvadmin
   ```

3. **Usar o arquivo nginx.conf fornecido**

4. **Iniciar Nginx**

5. **Acessar:**
   - URL: `http://ouvadmin/venturosa`

### Método 3: Script Automático

1. **Executar o script:**
   ```bash
   iniciar_ouvadmin.bat
   ```

## Arquivos Modificados

### Frontend
- `package.json`: Adicionado homepage e proxy
- `.env`: Configuração de ambiente
- `public/index.html`: Título e base URL
- `src/App.js`: URL da API via variável de ambiente

### Backend
- `server.js`: Servidor personalizado
- `nginx.conf`: Configuração do Nginx

## URLs de Acesso

- **Desenvolvimento:** `http://localhost:3000/venturosa`
- **Produção:** `http://ouvadmin/venturosa`
- **Backend API:** `http://localhost:3001/api`

## Troubleshooting

1. **Erro de CORS:** Verificar se o proxy está configurado corretamente
2. **Arquivos não encontrados:** Verificar se o build foi gerado
3. **URL não acessível:** Verificar configuração do hosts e nginx 