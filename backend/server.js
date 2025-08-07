const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar proxy para API
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
}));

// Servir arquivos estáticos do build do React
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Configurar rota para a URL base
app.use('/venturosa', express.static(path.join(__dirname, 'frontend/build')));

// Rota para todas as outras requisições (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log(`Acesse a aplicação em: http://localhost/venturosa`);
  console.log(`Para acesso externo, use o IP da máquina`);
}); 