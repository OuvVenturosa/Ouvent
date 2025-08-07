const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar banco de dados
const dbPath = path.join(__dirname, 'ouvidoria.db');
const db = new sqlite3.Database(dbPath);

// Rotas da API
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API da Ouvidoria funcionando' });
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

// Rota para buscar demanda por protocolo
app.get('/api/demandas/:protocolo', (req, res) => {
  const { protocolo } = req.params;
  
  const query = `
    SELECT 
      d.*,
      GROUP_CONCAT(u.descricao) as atualizacoes
    FROM demandas d
    LEFT JOIN atualizacoes u ON d.protocolo = u.protocolo
    WHERE d.protocolo = ?
    GROUP BY d.id
  `;
  
  db.get(query, [protocolo], (err, row) => {
    if (err) {
      console.error('Erro ao buscar demanda:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Demanda não encontrada' });
    }
    
    res.json(row);
  });
});

// Rota para criar nova demanda
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

// Rota para atualizar status da demanda
app.put('/api/demandas/:protocolo/status', (req, res) => {
  const { protocolo } = req.params;
  const { status, responsavel, descricao } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status é obrigatório' });
  }
  
  const updateQuery = 'UPDATE demandas SET status = ? WHERE protocolo = ?';
  const insertQuery = `
    INSERT INTO atualizacoes (protocolo, responsavel, descricao, data_atualizacao)
    VALUES (?, ?, ?, ?)
  `;
  
  db.serialize(() => {
    db.run(updateQuery, [status, protocolo], function(err) {
      if (err) {
        console.error('Erro ao atualizar status:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Demanda não encontrada' });
      }
      
      // Inserir atualização no histórico
      if (responsavel && descricao) {
        const data_atualizacao = new Date().toISOString();
        db.run(insertQuery, [protocolo, responsavel, descricao, data_atualizacao], function(err) {
          if (err) {
            console.error('Erro ao inserir atualização:', err);
          }
        });
      }
      
      res.json({ message: 'Status atualizado com sucesso' });
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
    endpoints: [
      'GET /api/health',
      'GET /api/demandas',
      'GET /api/demandas/:protocolo',
      'POST /api/demandas',
      'PUT /api/demandas/:protocolo/status'
    ]
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Inicializar servidor
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`API da Ouvidoria rodando na porta ${PORT}`);
  });
}

module.exports = app; 