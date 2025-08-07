// API Principal - Vercel
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const demandasRouter = require('./demandas');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rotas
app.use('/api/demandas', demandasRouter);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'API da Ouvidoria funcionando',
    version: '1.0.0'
  });
});

// Rota padrão
app.get('/', (req, res) => {
  res.json({ 
    message: 'API da Ouvidoria Municipal',
    version: '1.0.0',
    status: 'OK',
    endpoints: [
      'GET /api/health',
      'GET /api/demandas',
      'POST /api/demandas',
      'GET /api/demandas/:protocolo'
    ]
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

// Exportar para Vercel
module.exports = app; 