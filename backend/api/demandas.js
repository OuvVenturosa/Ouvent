// Rotas de Demandas - Vercel
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Configurar banco de dados
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/ouvidoria.db'
  : path.join(__dirname, '..', 'ouvidoria.db');

const db = new sqlite3.Database(dbPath);

// Listar demandas
router.get('/', (req, res) => {
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

// Criar demanda
router.post('/', (req, res) => {
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

// Buscar demanda por protocolo
router.get('/:protocolo', (req, res) => {
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

// Função para gerar número de protocolo
function generateProtocolNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${year}${month}${day}${random}`;
}

module.exports = router; 