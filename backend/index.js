// API Principal - Vercel
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar banco de dados
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/ouvidoria.db'
  : path.join(__dirname, 'ouvidoria.db');

const db = new sqlite3.Database(dbPath);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'API da Ouvidoria funcionando',
    version: '1.0.0'
  });
});

// Rota para listar demandas
app.get('/api/demandas', (req, res) => {
  const query = `
    SELECT 
      d.id,
      d.protocolo,
      d.nome,
      d.telefone,
      d.servico,
      d.descricao,
      d.status,
      d.data_criacao,
      d.secretaria_responsavel
    FROM demandas d
    ORDER BY d.data_criacao DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar demandas:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(rows);
  });
});

// Rota para criar demanda
app.post('/api/demandas', (req, res) => {
  const { nome, telefone, servico, descricao, secretaria_responsavel } = req.body;
  
  if (!nome || !telefone || !servico || !descricao) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }
  
  const protocolo = generateProtocolNumber();
  const data_criacao = new Date().toISOString();
  
  const query = `
    INSERT INTO demandas (protocolo, nome, telefone, servico, descricao, status, data_criacao, secretaria_responsavel)
    VALUES (?, ?, ?, ?, ?, 'Pendente', ?, ?)
  `;
  
  db.run(query, [protocolo, nome, telefone, servico, descricao, data_criacao, secretaria_responsavel], function(err) {
    if (err) {
      console.error('Erro ao criar demanda:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    res.status(201).json({
      id: this.lastID,
      protocolo,
      message: 'Demanda criada com sucesso'
    });
  });
});

// Função para gerar número de protocolo
function generateProtocolNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${year}${month}${day}${random}`;
}

// Rota padrão
app.get('/', (req, res) => {
  res.json({ 
    message: 'API da Ouvidoria Municipal',
    version: '1.0.0',
    status: 'OK',
    endpoints: [
      'GET /api/health',
      'GET /api/demandas',
      'POST /api/demandas'
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