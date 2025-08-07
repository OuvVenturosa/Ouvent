const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'segredo_super_secreto';

app.use(cors());
app.use(express.json());

// Configuração do banco de dados para Vercel (usando SQLite em memória ou arquivo temporário)
const dbPath = path.join(__dirname, 'ouvidoria.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
    inicializarBanco();
  }
});

function inicializarBanco() {
  db.serialize(() => {
    // Tabela de usuários
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cpf TEXT UNIQUE,
      telefone TEXT,
      email TEXT UNIQUE,
      senha_hash TEXT,
      secretaria TEXT,
      is_master INTEGER DEFAULT 0
    )`);

    // Tabela de solicitações
    db.run(`CREATE TABLE IF NOT EXISTS solicitacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      protocolo TEXT UNIQUE,
      secretaria TEXT,
      status TEXT,
      pergunta TEXT,
      resposta TEXT,
      data TEXT,
      prazo_resposta TEXT,
      encaminhar_ouvidor INTEGER DEFAULT 0,
      motivo_encaminhamento TEXT,
      alerta_vencido_enviado INTEGER DEFAULT 0,
      alerta_hoje_enviado INTEGER DEFAULT 0,
      alerta_amanha_enviado INTEGER DEFAULT 0
    )`);

    // Tabela de histórico
    db.run(`CREATE TABLE IF NOT EXISTS historico_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      solicitacao_id INTEGER,
      status TEXT,
      responsavel TEXT,
      data TEXT,
      comentario TEXT,
      anexo TEXT
    )`);

    // Inserir usuário master padrão se não existir
    db.get("SELECT * FROM usuarios WHERE cpf = 'admin'", (err, row) => {
      if (!row) {
        const senhaHash = bcrypt.hashSync('admin123', 10);
        db.run(`INSERT INTO usuarios (cpf, telefone, email, senha_hash, secretaria, is_master) 
                VALUES ('admin', '00000000000', 'admin@ouvidoria.com', ?, 'Master', 1)`, [senhaHash]);
      }
    });
  });
}

// Função para enviar email
async function enviarEmailNotificacao(destinatario, assunto, corpo, anexo = null) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER || 'ouvidoria.venturosa@gmail.com',
        pass: process.env.EMAIL_PASS || 'kbng efuw gfwr uywd'
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || 'ouvidoria.venturosa@gmail.com',
      to: destinatario,
      subject: assunto,
      text: corpo
    };

    if (anexo) {
      mailOptions.attachments = [anexo];
    }

    await transporter.sendMail(mailOptions);
    console.log(`Email enviado para: ${destinatario}`);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Login
app.post('/api/login', (req, res) => {
  const { cpf, senha } = req.body;
  
  db.get('SELECT * FROM usuarios WHERE cpf = ?', [cpf], (err, usuario) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    if (!usuario) {
      return res.status(401).json({ error: 'CPF ou senha inválidos' });
    }
    
    const senhaValida = bcrypt.compareSync(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'CPF ou senha inválidos' });
    }
    
    const token = jwt.sign(
      { id: usuario.id, cpf: usuario.cpf, secretaria: usuario.secretaria, is_master: usuario.is_master },
      SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      usuario: {
        id: usuario.id,
        cpf: usuario.cpf,
        telefone: usuario.telefone,
        email: usuario.email,
        secretaria: usuario.secretaria,
        is_master: usuario.is_master
      }
    });
  });
});

// Middleware de autenticação
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

// Buscar solicitações
app.get('/api/solicitacoes', autenticarToken, (req, res) => {
  const { secretaria } = req.user;
  
  let query = 'SELECT * FROM solicitacoes';
  let params = [];
  
  if (!req.user.is_master) {
    query += ' WHERE secretaria = ?';
    params.push(secretaria);
  }
  
  query += ' ORDER BY data DESC';
  
  db.all(query, params, (err, solicitacoes) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar solicitações' });
    }
    res.json(solicitacoes);
  });
});

// Responder solicitação
app.post('/api/responder', autenticarToken, (req, res) => {
  const { id, resposta } = req.body;
  const responsavel = req.user.cpf;
  
  db.run(
    'UPDATE solicitacoes SET resposta = ?, status = ? WHERE id = ?',
    [resposta, 'Respondido', id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar solicitação' });
      }
      
      // Registrar no histórico
      db.run(
        'INSERT INTO historico_status (solicitacao_id, status, responsavel, data, comentario) VALUES (?, ?, ?, ?, ?)',
        [id, 'Respondido', responsavel, new Date().toISOString(), resposta]
      );
      
      res.json({ message: 'Resposta registrada com sucesso' });
    }
  );
});

// Buscar usuários (apenas master)
app.get('/api/usuarios', autenticarToken, (req, res) => {
  if (!req.user.is_master) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  db.all('SELECT id, cpf, telefone, email, secretaria, is_master FROM usuarios', (err, usuarios) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
    res.json(usuarios);
  });
});

// Adicionar usuário (apenas master)
app.post('/api/usuarios', autenticarToken, (req, res) => {
  if (!req.user.is_master) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  const { cpf, telefone, email, secretaria, senha, is_master } = req.body;
  const senhaHash = bcrypt.hashSync(senha, 10);
  
  db.run(
    'INSERT INTO usuarios (cpf, telefone, email, senha_hash, secretaria, is_master) VALUES (?, ?, ?, ?, ?, ?)',
    [cpf, telefone, email, senhaHash, secretaria, is_master ? 1 : 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao criar usuário' });
      }
      res.json({ message: 'Usuário criado com sucesso', id: this.lastID });
    }
  );
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app; 