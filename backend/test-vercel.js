// Teste simples para verificar configuração do Vercel
const express = require('express');
const app = express();

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Teste Vercel funcionando!',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'API da Ouvidoria - Teste',
    status: 'OK'
  });
});

module.exports = app; 