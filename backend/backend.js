// backend.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
// Função de email simplificada para evitar inicialização do WhatsApp
async function enviarEmailNotificacao(destinatario, assunto, corpo, anexo = null) {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'ouvidoria.venturosa@gmail.com',
                pass: 'kbng efuw gfwr uywd'
            }
        });

        const mailOptions = {
            from: 'ouvidoria.venturosa@gmail.com',
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

const app = express();
const PORT = 3001;
const SECRET = 'segredo_super_secreto'; // Troque por um segredo forte em produção

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Inicialização do banco de dados
const path = require('path');
// Caminho modificado para apontar para a unidade N:
const dbPath = 'N:\\ouvidoria.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    console.error('Caminho tentado:', dbPath);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
    console.log('Caminho do banco:', dbPath);
  }
});

// Criação das tabelas se não existirem
// Usuários: id, cpf, telefone, email, senha_hash, secretaria, is_master
// Solicitações: id, protocolo, secretaria, status, pergunta, resposta, data

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cpf TEXT UNIQUE,
    telefone TEXT,
    email TEXT UNIQUE,
    senha_hash TEXT,
    secretaria TEXT,
    is_master INTEGER DEFAULT 0
  )`);

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

  db.run(`CREATE TABLE IF NOT EXISTS historico_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    solicitacao_id INTEGER,
    status TEXT,
    data TEXT,
    responsavel_id INTEGER,
    descricao TEXT,
    anexo TEXT,
    FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes(id),
    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS demandas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    protocolo TEXT UNIQUE,
    secretaria TEXT,
    categoria TEXT,
    status TEXT DEFAULT 'pendente',
    prioridade TEXT DEFAULT 'normal',
    usuario_id TEXT,
    usuario_anonimizado TEXT,
    data_criacao TEXT,
    data_atualizacao TEXT,
    resumo_mensagem TEXT,
    descricao_completa TEXT,
    responsavel_id INTEGER,
    prazo_resposta TEXT,
    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS historico_interacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    demanda_id INTEGER,
    protocolo TEXT,
    usuario_id TEXT,
    mensagem TEXT,
    origem TEXT,
    timestamp TEXT,
    tipo_midia TEXT,
    caminho_arquivo TEXT,
    FOREIGN KEY (demanda_id) REFERENCES demandas(id)
  )`);
});

// Função para calcular 5 dias úteis
function calcularPrazoResposta(dataCriacao) {
  const data = new Date(dataCriacao);
  let diasAdicionados = 0;
  let diasUteis = 0;
  
  while (diasUteis < 5) {
    data.setDate(data.getDate() + 1);
    const diaSemana = data.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) { // 0 = domingo, 6 = sábado
      diasUteis++;
    }
    diasAdicionados++;
  }
  
  return data.toISOString();
}

// Função para verificar status do prazo
function verificarStatusPrazo(prazoResposta) {
  const hoje = new Date();
  const prazo = new Date(prazoResposta);
  const diffTime = prazo - hoje;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'vencida';
  if (diffDays === 0) return 'vence_hoje';
  return 'dentro_prazo';
}

// Middleware para autenticação do master
function autenticarMaster(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), SECRET);
    if (!decoded.is_master) return res.status(403).json({ erro: 'Acesso restrito ao master' });
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
}

// Middleware para autenticação de qualquer usuário logado
function autenticarUsuario(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
}

// Middleware de autorização por secretaria
function autorizarPorSecretaria(req, res, next) {
  const { secretaria } = req.params;
  const usuarioSecretaria = req.usuario.secretaria;
  
  // Master pode acessar todas as secretarias
  if (req.usuario.is_master) {
    return next();
  }
  
  // Usuário só pode acessar sua própria secretaria
  if (usuarioSecretaria !== secretaria) {
    return res.status(403).json({ 
      erro: 'Acesso negado. Você só pode acessar demandas da sua secretaria.' 
    });
  }
  
  next();
}

// Middleware para verificar acesso à demanda específica
function autorizarAcessoDemanda(req, res, next) {
  const { id } = req.params;
  
  // Master pode acessar todas as demandas
  if (req.usuario.is_master) {
    return next();
  }
  
  // Buscar a demanda para verificar a secretaria
  db.get('SELECT secretaria FROM demandas WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Erro ao verificar acesso à demanda:', err);
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
    
    if (!row) {
      return res.status(404).json({ erro: 'Demanda não encontrada' });
    }
    
    // Verificar se o usuário tem acesso à secretaria da demanda
    if (req.usuario.secretaria !== row.secretaria) {
      return res.status(403).json({ 
        erro: 'Acesso negado. Você só pode acessar demandas da sua secretaria.' 
      });
    }
    
    next();
  });
}

// Rota de teste
app.get('/', (req, res) => {
  res.send('API da Ouvidoria rodando!');
});

// Rota para login (CPF + senha)
app.post('/api/login', (req, res) => {
  const { cpf, senha } = req.body;
  db.get('SELECT * FROM usuarios WHERE cpf = ?', [cpf], (err, usuario) => {
    if (err) return res.status(500).json({ erro: 'Erro no banco de dados' });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
    if (!bcrypt.compareSync(senha, usuario.senha_hash)) {
      return res.status(401).json({ erro: 'Senha incorreta' });
    }
    const token = jwt.sign({ id: usuario.id, secretaria: usuario.secretaria, is_master: usuario.is_master }, SECRET, { expiresIn: '8h' });
    res.json({ token, usuario: { id: usuario.id, cpf: usuario.cpf, secretaria: usuario.secretaria, is_master: usuario.is_master } });
  });
});

// Rota para cadastro de responsável (restrito ao master)
app.post('/api/cadastrar-responsavel', autenticarMaster, async (req, res) => {
  const { cpf, telefone, email, secretaria } = req.body;
  const senha = Math.random().toString(36).slice(-8); // senha aleatória
  const senha_hash = bcrypt.hashSync(senha, 10);
  
  try {
    // Inserir no banco de dados
    db.run('INSERT INTO usuarios (cpf, telefone, email, senha_hash, secretaria, is_master) VALUES (?, ?, ?, ?, ?, 0)',
      [cpf, telefone, email, senha_hash, secretaria],
      async function (err) {
        if (err) {
          return res.status(400).json({ erro: 'Erro ao cadastrar responsável. Verifique se o CPF ou email já está cadastrado.' });
        }
        
        // Preparar dados para email
        const urlSistema = process.env.REACT_APP_URL || 'http://localhost:3000';
        const assunto = '🔐 Acesso ao Sistema da Ouvidoria - Credenciais de Login';
        const corpo = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #003366; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0;">🏛️ Sistema da Ouvidoria</h1>
              <p style="margin: 10px 0 0 0;">Prefeitura Municipal de Venturosa</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #003366; margin-top: 0;">🔐 Suas Credenciais de Acesso</h2>
              
              <p>Olá! Você foi cadastrado como responsável da <strong>${secretaria}</strong> no Sistema da Ouvidoria.</p>
              
              <div style="background-color: #f0f8ff; border-left: 4px solid #003366; padding: 15px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #003366;">📋 Informações de Acesso:</h3>
                <p><strong>URL do Sistema:</strong> <a href="${urlSistema}" style="color: #003366;">${urlSistema}</a></p>
                <p><strong>CPF:</strong> ${cpf}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Senha:</strong> <span style="background-color: #ffffcc; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${senha}</span></p>
                <p><strong>Secretaria:</strong> ${secretaria}</p>
              </div>
              
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #856404;">⚠️ Importante:</h4>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Guarde essas informações em local seguro</li>
                  <li>Altere sua senha no primeiro acesso</li>
                  <li>Em caso de dúvidas, entre em contato com o administrador</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${urlSistema}" style="background-color: #003366; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  🚀 Acessar Sistema
                </a>
              </div>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="text-align: center; color: #666; font-size: 12px;">
                Este é um email automático do Sistema da Ouvidoria.<br>
                Não responda a este email.
              </p>
            </div>
          </div>
        `;
        
        // Enviar email
        try {
          await enviarEmail(email, assunto, corpo);
          console.log(`Email enviado com sucesso para: ${email}`);
        } catch (emailError) {
          console.error('Erro ao enviar email:', emailError);
        }
        
        // Retornar resposta com informações detalhadas
        res.json({ 
          mensagem: 'Responsável cadastrado com sucesso! Email enviado com as credenciais.',
          dados_cadastro: {
            cpf: cpf,
            email: email,
            telefone: telefone,
            secretaria: secretaria,
            senha: senha,
            url_sistema: urlSistema
          },
          email_enviado: true
        });
      });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// Rota para redefinir senha (esqueci a senha)
app.post('/api/esqueci-senha', (req, res) => {
  const { email } = req.body;
  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, usuario) => {
    if (err) return res.status(500).json({ erro: 'Erro no banco de dados' });
    if (!usuario) return res.status(404).json({ erro: 'Email não encontrado' });
    const novaSenha = Math.random().toString(36).slice(-8);
    const senha_hash = bcrypt.hashSync(novaSenha, 10);
    db.run('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [senha_hash, usuario.id], function (err2) {
      if (err2) return res.status(500).json({ erro: 'Erro ao atualizar senha' });
      // Enviar nova senha por email
      // (Configuração do nodemailer deve ser feita conforme o provedor de email)
      // Exemplo básico:
      /*
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: 'SEU_EMAIL', pass: 'SUA_SENHA' }
      });
      transporter.sendMail({
        from: 'SEU_EMAIL',
        to: email,
        subject: 'Redefinição de Senha - Ouvidoria',
        text: `Sua nova senha de acesso: ${novaSenha}`
      });
      */
      res.json({ mensagem: 'Nova senha enviada para o email cadastrado.' });
    });
  });
});

// Rota para listar solicitações da secretaria do usuário logado
app.get('/api/solicitacoes', autenticarUsuario, (req, res) => {
  const secretaria = req.usuario.secretaria;
  db.all('SELECT * FROM solicitacoes WHERE secretaria = ?', [secretaria], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar solicitações' });
    // Adicionar status do prazo para cada solicitação
    const solicitacoesComPrazo = rows.map(sol => ({
      ...sol,
      status_prazo: verificarStatusPrazo(sol.prazo_resposta),
      dias_restantes: Math.ceil((new Date(sol.prazo_resposta) - new Date()) / (1000 * 60 * 60 * 24))
    }));
    res.json(solicitacoesComPrazo);
  });
});

// Rota para o master listar todas as solicitações agrupadas por secretaria
app.get('/api/solicitacoes-todas', autenticarMaster, (req, res) => {
  db.all('SELECT * FROM solicitacoes ORDER BY secretaria', [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar solicitações' });
    // Agrupar por secretaria
    const agrupado = {};
    rows.forEach(sol => {
      if (!agrupado[sol.secretaria]) agrupado[sol.secretaria] = [];
      agrupado[sol.secretaria].push(sol);
    });
    res.json(agrupado);
  });
});

// Rota para criar uma nova solicitação
app.post('/api/solicitacoes', autenticarUsuario, (req, res) => {
  const { protocolo, secretaria, pergunta, descricao } = req.body;
  const dataCriacao = new Date().toISOString();
  const prazoResposta = calcularPrazoResposta(dataCriacao);
  
  db.run('INSERT INTO solicitacoes (protocolo, secretaria, status, pergunta, resposta, data, prazo_resposta) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [protocolo, secretaria, 'Em aberto', pergunta, null, dataCriacao, prazoResposta],
    function (err) {
      if (err) return res.status(400).json({ erro: 'Erro ao criar solicitação' });
      res.json({ mensagem: 'Solicitação criada com sucesso!', prazo_resposta: prazoResposta });
    });
});

// Rota para responder uma solicitação
app.post('/api/solicitacoes/:id/responder', autenticarUsuario, (req, res) => {
  const { id } = req.params;
  const { resposta } = req.body;
  // Só pode responder se for da secretaria do usuário
  db.get('SELECT * FROM solicitacoes WHERE id = ?', [id], (err, solicitacao) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar solicitação' });
    if (!solicitacao) return res.status(404).json({ erro: 'Solicitação não encontrada' });
    if (solicitacao.secretaria !== req.usuario.secretaria) {
      return res.status(403).json({ erro: 'Acesso negado à solicitação de outra secretaria' });
    }
    db.run('UPDATE solicitacoes SET resposta = ?, status = ? WHERE id = ?', [resposta, 'respondida', id], function (err2) {
      if (err2) return res.status(500).json({ erro: 'Erro ao responder solicitação' });
      res.json({ mensagem: 'Solicitação respondida com sucesso!' });
    });
  });
});

// Rota para atualizar status da solicitação (responsável de secretaria)
app.post('/api/solicitacoes/:id/status', autenticarUsuario, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const responsavelId = req.usuario.id;
  const dataHora = new Date().toISOString();
  db.get('SELECT * FROM solicitacoes WHERE id = ?', [id], (err, solicitacao) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar solicitação' });
    if (!solicitacao) return res.status(404).json({ erro: 'Solicitação não encontrada' });
    if (solicitacao.secretaria !== req.usuario.secretaria) {
      return res.status(403).json({ erro: 'Acesso negado à solicitação de outra secretaria' });
    }
    db.run('UPDATE solicitacoes SET status = ? WHERE id = ?', [status, id], function (err2) {
      if (err2) return res.status(500).json({ erro: 'Erro ao atualizar status' });
      // Registrar histórico
      db.run('INSERT INTO historico_status (solicitacao_id, status, data, responsavel_id) VALUES (?, ?, ?, ?)',
        [id, status, dataHora, responsavelId],
        async function (err3) {
          if (err3) return res.status(500).json({ erro: 'Erro ao registrar histórico' });
          // Notificar solicitante (email e WhatsApp)
          // Buscar email e telefone do solicitante (adapte conforme sua estrutura)
          const emailSolicitante = solicitacao.email;
          const telefoneSolicitante = solicitacao.telefone;
          const protocolo = solicitacao.protocolo;
          const assunto = `Atualização de status do seu atendimento - Protocolo ${protocolo}`;
          const corpo = `<p>O status do seu atendimento foi alterado para: <b>${status}</b>.<br>Protocolo: <b>${protocolo}</b></p>`;
          if (emailSolicitante) {
            try { await enviarEmailNotificacao(emailSolicitante, assunto, corpo); } catch(e){}
          }
          // WhatsApp: aqui você pode usar sua função de envio, ex: client.sendMessage(telefoneSolicitante, ...)
          // ...
          res.json({ mensagem: 'Status atualizado, histórico registrado e notificações enviadas!' });
        });
    });
  });
});

// Rota para consultar histórico de status de uma solicitação
app.get('/api/solicitacoes/:id/historico', autenticarUsuario, (req, res) => {
  const { id } = req.params;
  db.all(`SELECT h.*, u.cpf, u.email FROM historico_status h LEFT JOIN usuarios u ON h.responsavel_id = u.id WHERE h.solicitacao_id = ? ORDER BY h.data ASC`, [id], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar histórico' });
    res.json(rows);
  });
});

// Rota para adicionar comentário do responsável
app.post('/api/solicitacoes/:id/comentario', autenticarUsuario, (req, res) => {
  const { id } = req.params;
  const { comentario, anexo } = req.body;
  const responsavelId = req.usuario.id;
  const dataHora = new Date().toISOString();
  db.get('SELECT * FROM solicitacoes WHERE id = ?', [id], (err, solicitacao) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar solicitação' });
    if (!solicitacao) return res.status(404).json({ erro: 'Solicitação não encontrada' });
    if (solicitacao.secretaria !== req.usuario.secretaria && !req.usuario.is_master) {
      return res.status(403).json({ erro: 'Acesso negado à solicitação de outra secretaria' });
    }
    db.run('INSERT INTO historico_status (solicitacao_id, status, data, responsavel_id, descricao, anexo) VALUES (?, ?, ?, ?, ?, ?)',
      [id, solicitacao.status, dataHora, responsavelId, comentario, anexo || null],
      function (err2) {
        if (err2) return res.status(500).json({ erro: 'Erro ao registrar comentário' });
        res.json({ mensagem: 'Comentário adicionado com sucesso!' });
      });
  });
});

// Atualizar rota de detalhes para incluir campo anexo
app.get('/api/solicitacoes/:id/detalhes', autenticarUsuario, (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM solicitacoes WHERE id = ?', [id], (err, solicitacao) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar solicitação' });
    if (!solicitacao) return res.status(404).json({ erro: 'Solicitação não encontrada' });
    if (solicitacao.secretaria !== req.usuario.secretaria && !req.usuario.is_master) {
      return res.status(403).json({ erro: 'Acesso negado à solicitação de outra secretaria' });
    }
    db.all('SELECT h.*, u.cpf, u.email FROM historico_status h LEFT JOIN usuarios u ON h.responsavel_id = u.id WHERE h.solicitacao_id = ? ORDER BY h.data ASC', [id], (err2, historico) => {
      if (err2) return res.status(500).json({ erro: 'Erro ao buscar histórico' });
      res.json({
        solicitacao,
        historico
      });
    });
  });
});

// Função para verificar e enviar alertas de prazo
function verificarAlertasPrazos() {
  const hoje = new Date();
  
  db.all('SELECT s.*, u.email, u.telefone FROM solicitacoes s LEFT JOIN usuarios u ON s.secretaria = u.secretaria WHERE u.is_master = 0', [], (err, rows) => {
    if (err) {
      console.error('Erro ao verificar prazos:', err);
      return;
    }
    
    rows.forEach(solicitacao => {
      const prazo = new Date(solicitacao.prazo_resposta);
      const diffTime = prazo - hoje;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Alerta para prazos vencidos
      if (diffDays < 0 && !solicitacao.alerta_vencido_enviado) {
        enviarAlertaPrazo(solicitacao, 'vencido', diffDays);
        marcarAlertaEnviado(solicitacao.id, 'vencido');
      }
      
      // Alerta para prazos que vencem hoje
      if (diffDays === 0 && !solicitacao.alerta_hoje_enviado) {
        enviarAlertaPrazo(solicitacao, 'hoje', diffDays);
        marcarAlertaEnviado(solicitacao.id, 'hoje');
      }
      
      // Alerta para prazos que vencem amanhã
      if (diffDays === 1 && !solicitacao.alerta_amanha_enviado) {
        enviarAlertaPrazo(solicitacao, 'amanha', diffDays);
        marcarAlertaEnviado(solicitacao.id, 'amanha');
      }
    });
  });
}

// Função para enviar alerta de prazo
function enviarAlertaPrazo(solicitacao, tipo, dias) {
  const protocolo = solicitacao.protocolo;
  const secretaria = solicitacao.secretaria;
  const email = solicitacao.email;
  const telefone = solicitacao.telefone;
  
  let assunto, mensagem, mensagemWhatsApp;
  
  switch (tipo) {
    case 'vencido':
      assunto = `🚨 URGENTE: Protocolo ${protocolo} VENCIDO`;
      mensagem = `
        <h2>🚨 ALERTA DE PRAZO VENCIDO</h2>
        <p><strong>Protocolo:</strong> ${protocolo}</p>
        <p><strong>Secretaria:</strong> ${secretaria}</p>
        <p><strong>Status:</strong> ${solicitacao.status}</p>
        <p><strong>Prazo:</strong> ${new Date(solicitacao.prazo_resposta).toLocaleDateString('pt-BR')}</p>
        <p><strong>Dias vencido:</strong> ${Math.abs(dias)} dias</p>
        <p><strong>Pergunta:</strong> ${solicitacao.pergunta}</p>
        <br>
        <p style="color: red; font-weight: bold;">ATENÇÃO: Esta solicitação está VENCIDA e precisa de resposta URGENTE!</p>
      `;
      mensagemWhatsApp = `🚨 *ALERTA DE PRAZO VENCIDO*\n\n*Protocolo:* ${protocolo}\n*Secretaria:* ${secretaria}\n*Status:* ${solicitacao.status}\n*Prazo:* ${new Date(solicitacao.prazo_resposta).toLocaleDateString('pt-BR')}\n*Dias vencido:* ${Math.abs(dias)} dias\n\n*Pergunta:* ${solicitacao.pergunta}\n\n⚠️ *ATENÇÃO: Esta solicitação está VENCIDA e precisa de resposta URGENTE!*`;
      break;
      
    case 'hoje':
      assunto = `⚠️ ATENÇÃO: Protocolo ${protocolo} vence HOJE`;
      mensagem = `
        <h2>⚠️ ALERTA DE PRAZO</h2>
        <p><strong>Protocolo:</strong> ${protocolo}</p>
        <p><strong>Secretaria:</strong> ${secretaria}</p>
        <p><strong>Status:</strong> ${solicitacao.status}</p>
        <p><strong>Prazo:</strong> ${new Date(solicitacao.prazo_resposta).toLocaleDateString('pt-BR')}</p>
        <p><strong>Status:</strong> VENCE HOJE</p>
        <p><strong>Pergunta:</strong> ${solicitacao.pergunta}</p>
        <br>
        <p style="color: orange; font-weight: bold;">ATENÇÃO: Esta solicitação vence HOJE!</p>
      `;
      mensagemWhatsApp = `⚠️ *ALERTA DE PRAZO*\n\n*Protocolo:* ${protocolo}\n*Secretaria:* ${secretaria}\n*Status:* ${solicitacao.status}\n*Prazo:* ${new Date(solicitacao.prazo_resposta).toLocaleDateString('pt-BR')}\n*Status:* VENCE HOJE\n\n*Pergunta:* ${solicitacao.pergunta}\n\n⚠️ *ATENÇÃO: Esta solicitação vence HOJE!*`;
      break;
      
    case 'amanha':
      assunto = `📅 LEMBRETE: Protocolo ${protocolo} vence AMANHÃ`;
      mensagem = `
        <h2>📅 LEMBRETE DE PRAZO</h2>
        <p><strong>Protocolo:</strong> ${protocolo}</p>
        <p><strong>Secretaria:</strong> ${secretaria}</p>
        <p><strong>Status:</strong> ${solicitacao.status}</p>
        <p><strong>Prazo:</strong> ${new Date(solicitacao.prazo_resposta).toLocaleDateString('pt-BR')}</p>
        <p><strong>Status:</strong> VENCE AMANHÃ</p>
        <p><strong>Pergunta:</strong> ${solicitacao.pergunta}</p>
        <br>
        <p style="color: blue; font-weight: bold;">LEMBRETE: Esta solicitação vence AMANHÃ!</p>
      `;
      mensagemWhatsApp = `📅 *LEMBRETE DE PRAZO*\n\n*Protocolo:* ${protocolo}\n*Secretaria:* ${secretaria}\n*Status:* ${solicitacao.status}\n*Prazo:* ${new Date(solicitacao.prazo_resposta).toLocaleDateString('pt-BR')}\n*Status:* VENCE AMANHÃ\n\n*Pergunta:* ${solicitacao.pergunta}\n\n📅 *LEMBRETE: Esta solicitação vence AMANHÃ!*`;
      break;
  }
  
  // Enviar email
  if (email) {
    enviarEmail(email, assunto, mensagem);
  }
  
  // Enviar WhatsApp
  if (telefone) {
    enviarWhatsApp(telefone, mensagemWhatsApp);
  }
}

// Função para enviar email
async function enviarEmail(destinatario, assunto, corpo) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'ouvidoria.venturosa@gmail.com',
        pass: 'kbng efuw gfwr uywd'
      },
      tls: {
        rejectUnauthorized: false 
      }
    });

    const mailOptions = {
      from: 'ouvidoria.venturosa@gmail.com',
      to: destinatario,
      subject: assunto,
      html: corpo
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email enviado com sucesso para: ${destinatario}`);
  } catch (error) {
    console.error('Erro ao enviar email:', error);
  }
}

// Função para enviar WhatsApp
async function enviarWhatsApp(telefone, mensagem) {
  try {
    // Aqui você pode implementar a lógica de envio do WhatsApp
    // Por enquanto, apenas logamos a mensagem
    console.log(`WhatsApp para ${telefone}: ${mensagem}`);
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
  }
}

// Função para marcar alerta como enviado
function marcarAlertaEnviado(solicitacaoId, tipo) {
  const campo = `alerta_${tipo}_enviado`;
  db.run(`UPDATE solicitacoes SET ${campo} = 1 WHERE id = ?`, [solicitacaoId], (err) => {
    if (err) console.error('Erro ao marcar alerta enviado:', err);
  });
}

// Executar verificação de alertas a cada hora
setInterval(verificarAlertasPrazos, 60 * 60 * 1000); // 1 hora

// Executar verificação inicial após 5 segundos
setTimeout(verificarAlertasPrazos, 5000);

// Rota para verificar alertas manualmente (apenas para master)
app.get('/api/verificar-alertas', autenticarMaster, (req, res) => {
  verificarAlertasPrazos();
  res.json({ mensagem: 'Verificação de alertas executada' });
});

// Rota para redefinir alertas (apenas para master)
app.post('/api/redefinir-alertas/:solicitacaoId', autenticarMaster, (req, res) => {
  const { solicitacaoId } = req.params;
  db.run(`UPDATE solicitacoes SET alerta_vencido_enviado = 0, alerta_hoje_enviado = 0, alerta_amanha_enviado = 0 WHERE id = ?`, [solicitacaoId], (err) => {
    if (err) return res.status(500).json({ erro: 'Erro ao redefinir alertas' });
    res.json({ mensagem: 'Alertas redefinidos com sucesso' });
  });
});

// Rota para marcar solicitação para encaminhamento ao ouvidor
app.post('/api/solicitacoes/:id/encaminhar-ouvidor', autenticarUsuario, (req, res) => {
  const { id } = req.params;
  const { encaminhar, motivo } = req.body;
  
  db.run('UPDATE solicitacoes SET encaminhar_ouvidor = ?, motivo_encaminhamento = ? WHERE id = ?', 
    [encaminhar ? 1 : 0, motivo || null, id], 
    function (err) {
      if (err) return res.status(500).json({ erro: 'Erro ao atualizar solicitação' });
      
      // Se foi marcado para encaminhamento, enviar notificação ao ouvidor
      if (encaminhar) {
        notificarOuvidorGeral(id, motivo);
      }
      
      res.json({ mensagem: encaminhar ? 'Solicitação marcada para encaminhamento ao ouvidor' : 'Encaminhamento cancelado' });
    });
});

// Função para notificar o ouvidor geral
function notificarOuvidorGeral(solicitacaoId, motivo) {
  db.get('SELECT * FROM solicitacoes WHERE id = ?', [solicitacaoId], (err, solicitacao) => {
    if (err || !solicitacao) return;
    
    // Buscar dados do ouvidor geral (master)
    db.get('SELECT * FROM usuarios WHERE is_master = 1 LIMIT 1', [], (err, ouvidor) => {
      if (err || !ouvidor) return;
      
      const assunto = `📋 NOVA SOLICITAÇÃO ENCAMINHADA - Protocolo ${solicitacao.protocolo}`;
      const mensagem = `
        <h2>📋 SOLICITAÇÃO ENCAMINHADA AO OUVIDOR GERAL</h2>
        <p><strong>Protocolo:</strong> ${solicitacao.protocolo}</p>
        <p><strong>Secretaria:</strong> ${solicitacao.secretaria}</p>
        <p><strong>Status:</strong> ${solicitacao.status}</p>
        <p><strong>Prazo:</strong> ${new Date(solicitacao.prazo_resposta).toLocaleDateString('pt-BR')}</p>
        <p><strong>Pergunta:</strong> ${solicitacao.pergunta}</p>
        <p><strong>Motivo do Encaminhamento:</strong> ${motivo}</p>
        <br>
        <p style="color: #ff6b35; font-weight: bold;">Esta solicitação foi marcada para análise do ouvidor geral devido à complexidade ou impossibilidade de resolução pela secretaria.</p>
      `;
      
      const mensagemWhatsApp = `📋 *NOVA SOLICITAÇÃO ENCAMINHADA*\n\n*Protocolo:* ${solicitacao.protocolo}\n*Secretaria:* ${solicitacao.secretaria}\n*Status:* ${solicitacao.status}\n*Prazo:* ${new Date(solicitacao.prazo_resposta).toLocaleDateString('pt-BR')}\n\n*Pergunta:* ${solicitacao.pergunta}\n\n*Motivo do Encaminhamento:* ${motivo}\n\n📋 *Esta solicitação foi marcada para análise do ouvidor geral devido à complexidade ou impossibilidade de resolução pela secretaria.*`;
      
      // Enviar notificação por email
      if (ouvidor.email) {
        enviarEmail(ouvidor.email, assunto, mensagem);
      }
      
      // Enviar notificação por WhatsApp
      if (ouvidor.telefone) {
        enviarWhatsApp(ouvidor.telefone, mensagemWhatsApp);
      }
    });
  });
}

// Rota para listar solicitações encaminhadas ao ouvidor (apenas para master)
app.get('/api/solicitacoes-encaminhadas', autenticarMaster, (req, res) => {
  db.all('SELECT * FROM solicitacoes WHERE encaminhar_ouvidor = 1 ORDER BY data DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar solicitações encaminhadas' });
    res.json(rows);
  });
});

// Rota para resolver solicitação encaminhada (apenas para master)
app.post('/api/solicitacoes/:id/resolver-encaminhamento', autenticarMaster, (req, res) => {
  const { id } = req.params;
  const { resposta_ouvidor, status_final } = req.body;
  
  db.run('UPDATE solicitacoes SET resposta = ?, status = ?, encaminhar_ouvidor = 0 WHERE id = ?', 
    [resposta_ouvidor, status_final, id], 
    function (err) {
      if (err) return res.status(500).json({ erro: 'Erro ao resolver solicitação' });
      
      // Adicionar ao histórico
      const data = new Date().toISOString();
      db.run('INSERT INTO historico_status (solicitacao_id, status, data, responsavel_id, descricao) VALUES (?, ?, ?, ?, ?)',
        [id, status_final, data, req.usuario.id, `Resolvido pelo ouvidor geral: ${resposta_ouvidor}`]);
      
      res.json({ mensagem: 'Solicitação resolvida pelo ouvidor geral' });
    });
});

// =============================================
// ROTAS DE GERENCIAMENTO DE USUÁRIOS
// =============================================

// Rota para listar todos os usuários (apenas para master)
app.get('/api/usuarios', autenticarMaster, (req, res) => {
  db.all('SELECT id, cpf, telefone, email, secretaria, is_master FROM usuarios ORDER BY secretaria, is_master DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar usuários' });
    res.json(rows);
  });
});

// Rota para buscar usuário específico (apenas para master)
app.get('/api/usuarios/:id', autenticarMaster, (req, res) => {
  const { id } = req.params;
  db.get('SELECT id, cpf, telefone, email, secretaria, is_master FROM usuarios WHERE id = ?', [id], (err, usuario) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar usuário' });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json(usuario);
  });
});

// Rota para atualizar usuário (apenas para master)
app.put('/api/usuarios/:id', autenticarMaster, (req, res) => {
  const { id } = req.params;
  const { cpf, telefone, email, secretaria, is_master } = req.body;
  
  db.run('UPDATE usuarios SET cpf = ?, telefone = ?, email = ?, secretaria = ?, is_master = ? WHERE id = ?',
    [cpf, telefone, email, secretaria, is_master ? 1 : 0, id],
    function (err) {
      if (err) return res.status(500).json({ erro: 'Erro ao atualizar usuário' });
      res.json({ mensagem: 'Usuário atualizado com sucesso!' });
    });
});

// Rota para excluir usuário (apenas para master)
app.delete('/api/usuarios/:id', autenticarMaster, (req, res) => {
  const { id } = req.params;
  
  // Verificar se não é o último master
  db.get('SELECT COUNT(*) as count FROM usuarios WHERE is_master = 1', [], (err, result) => {
    if (err) return res.status(500).json({ erro: 'Erro ao verificar usuários master' });
    
    db.get('SELECT is_master FROM usuarios WHERE id = ?', [id], (err, usuario) => {
      if (err) return res.status(500).json({ erro: 'Erro ao buscar usuário' });
      if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
      
      // Não permitir excluir se for o último master
      if (usuario.is_master && result.count <= 1) {
        return res.status(400).json({ erro: 'Não é possível excluir o último usuário master' });
      }
      
      db.run('DELETE FROM usuarios WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ erro: 'Erro ao excluir usuário' });
        res.json({ mensagem: 'Usuário excluído com sucesso!' });
      });
    });
  });
});

// Rota para redefinir senha de usuário (apenas para master)
app.post('/api/usuarios/:id/redefinir-senha', autenticarMaster, (req, res) => {
  const { id } = req.params;
  const novaSenha = Math.random().toString(36).slice(-8);
  const senha_hash = bcrypt.hashSync(novaSenha, 10);
  
  db.run('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [senha_hash, id], function (err) {
    if (err) return res.status(500).json({ erro: 'Erro ao redefinir senha' });
    
    // Buscar email do usuário para enviar nova senha
    db.get('SELECT email FROM usuarios WHERE id = ?', [id], (err, usuario) => {
      if (err || !usuario) {
        return res.status(500).json({ erro: 'Erro ao buscar dados do usuário' });
      }
      
      // Enviar nova senha por email
      const assunto = 'Redefinição de Senha - Sistema de Ouvidoria';
      const corpo = `
        <h2>Redefinição de Senha</h2>
        <p>Sua nova senha de acesso ao sistema de Ouvidoria Municipal é:</p>
        <h3 style="color: #ff6b35; font-size: 18px;">${novaSenha}</h3>
        <p><strong>IMPORTANTE:</strong> Altere esta senha no primeiro login por questões de segurança.</p>
        <p>Atenciosamente,<br>Equipe de Ouvidoria Municipal de Venturosa</p>
      `;
      
      enviarEmail(usuario.email, assunto, corpo);
      
      res.json({ 
        mensagem: 'Senha redefinida com sucesso! Nova senha enviada por email.',
        senha_gerada: novaSenha 
      });
    });
  });
});

// Rota para listar secretarias disponíveis
app.get('/api/secretarias', autenticarUsuario, (req, res) => {
  const todasSecretarias = [
    'Secretaria de Desenvolvimento Rural e Meio Ambiente',
    'Secretaria de Assistência Social',
    'Secretaria de Educação e Esporte',
    'Secretaria de Infraestrutura e Segurança Pública',
    'Secretaria de Saúde e Direitos da Mulher',
    'Hospital e Maternidade Justa Maria Bezerra',
    'Programa Mulher Segura',
    'Secretaria de Finanças - Setor de Tributos',
    'Secretaria de Administração - Servidores Municipais',
    'Ouvidoria Geral'
  ];
  
  // Master pode ver todas as secretarias
  if (req.usuario.is_master) {
    return res.json(todasSecretarias);
  }
  
  // Usuário comum só vê sua própria secretaria
  res.json([req.usuario.secretaria]);
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend rodando em http://0.0.0.0:${PORT}`);
  console.log(`Para acesso externo, use o IP da máquina`);
}); 

// Endpoint para visão geral das demandas
app.get('/api/demandas/visao-geral', (req, res) => {
  const query = `
    SELECT status, COUNT(*) as total
    FROM solicitacoes
    GROUP BY status
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao consultar o banco de dados.' });
    }
    // Monta objeto de resposta
    const resposta = {
      total: 0,
      pendentes: 0,
      andamento: 0,
      resolvidas: 0
    };
    rows.forEach(row => {
      resposta.total += row.total;
      if (row.status === 'Em aberto') resposta.pendentes = row.total;
      if (row.status === 'respondida') resposta.andamento = row.total;
      if (row.status === 'resolvida') resposta.resolvidas = row.total;
    });
    res.json(resposta);
  });
}); 

app.get('/api/demandas/por-categoria', (req, res) => {
  db.all('SELECT categoria, COUNT(*) as total FROM solicitacoes GROUP BY categoria', [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao consultar.' });
    res.json(rows);
  });
});

app.get('/api/demandas/tempo-medio-resposta', (req, res) => {
  db.get(
    'SELECT AVG(julianday(data) - julianday(data_criacao)) as tempo_medio FROM solicitacoes WHERE data IS NOT NULL',
    [],
    (err, row) => {
      if (err) return res.status(500).json({ erro: 'Erro ao consultar.' });
      res.json({ tempo_medio: row.tempo_medio });
    }
  );
});

app.get('/api/demandas', (req, res) => {
  let query = 'SELECT * FROM solicitacoes WHERE 1=1';
  let params = [];
  if (req.query.status) { query += ' AND status = ?'; params.push(req.query.status); }
  if (req.query.prioridade) { query += ' AND prioridade = ?'; params.push(req.query.prioridade); }
  if (req.query.categoria) { query += ' AND categoria = ?'; params.push(req.query.categoria); }
  if (req.query.dataInicial) { query += ' AND data >= ?'; params.push(req.query.dataInicial); }
  if (req.query.dataFinal) { query += ' AND data <= ?'; params.push(req.query.dataFinal); }
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao consultar.' });
    res.json(rows);
  });
}); 

// =============================================
// ENDPOINTS PARA LISTA DE DEMANDAS DAS SECRETARIAS
// =============================================

// Endpoint para listar todas as demandas com filtros e ordenação
app.get('/api/demandas/lista', autenticarUsuario, (req, res) => {
  const { 
    secretaria, 
    status, 
    prioridade, 
    categoria, 
    dataInicial, 
    dataFinal,
    ordenarPor = 'data_criacao',
    ordem = 'DESC',
    pagina = 1,
    limite = 50
  } = req.query;

  let query = `
    SELECT 
      d.id,
      d.protocolo,
      d.secretaria,
      d.categoria,
      d.status,
      d.prioridade,
      d.usuario_anonimizado,
      d.data_criacao,
      d.data_atualizacao,
      d.resumo_mensagem,
      u.nome as responsavel_nome
    FROM demandas d
    LEFT JOIN usuarios u ON d.responsavel_id = u.id
    WHERE 1=1
  `;
  
  let params = [];
  
  // Controle de acesso por secretaria
  if (!req.usuario.is_master) {
    query += ' AND d.secretaria = ?';
    params.push(req.usuario.secretaria);
  }
  
  if (secretaria) { 
    query += ' AND d.secretaria = ?'; 
    params.push(secretaria); 
  }
  if (status) { 
    query += ' AND d.status = ?'; 
    params.push(status); 
  }
  if (prioridade) { 
    query += ' AND d.prioridade = ?'; 
    params.push(prioridade); 
  }
  if (categoria) { 
    query += ' AND d.categoria = ?'; 
    params.push(categoria); 
  }
  if (dataInicial) { 
    query += ' AND d.data_criacao >= ?'; 
    params.push(dataInicial); 
  }
  if (dataFinal) { 
    query += ' AND d.data_criacao <= ?'; 
    params.push(dataFinal); 
  }

  // Adicionar ordenação
  query += ` ORDER BY d.${ordenarPor} ${ordem}`;
  
  // Adicionar paginação
  const offset = (pagina - 1) * limite;
  query += ` LIMIT ? OFFSET ?`;
  params.push(limite, offset);

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro ao consultar demandas:', err);
      return res.status(500).json({ erro: 'Erro ao consultar demandas.' });
    }
    
    // Contar total de registros para paginação
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM demandas d 
      WHERE 1=1
    `;
    let countParams = [];
    
    // Controle de acesso por secretaria na contagem
    if (!req.usuario.is_master) {
      countQuery += ' AND d.secretaria = ?';
      countParams.push(req.usuario.secretaria);
    }
    
    if (secretaria) { 
      countQuery += ' AND d.secretaria = ?'; 
      countParams.push(secretaria); 
    }
    if (status) { 
      countQuery += ' AND d.status = ?'; 
      countParams.push(status); 
    }
    if (prioridade) { 
      countQuery += ' AND d.prioridade = ?'; 
      countParams.push(prioridade); 
    }
    if (categoria) { 
      countQuery += ' AND d.categoria = ?'; 
      countParams.push(categoria); 
    }
    if (dataInicial) { 
      countQuery += ' AND d.data_criacao >= ?'; 
      countParams.push(dataInicial); 
    }
    if (dataFinal) { 
      countQuery += ' AND d.data_criacao <= ?'; 
      countParams.push(dataFinal); 
    }

    db.get(countQuery, countParams, (err, countRow) => {
      if (err) {
        console.error('Erro ao contar demandas:', err);
        return res.status(500).json({ erro: 'Erro ao contar demandas.' });
      }
      
      res.json({
        demandas: rows,
        paginacao: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total: countRow.total,
          totalPaginas: Math.ceil(countRow.total / limite)
        }
      });
    });
  });
});

// Endpoint para obter detalhes de uma demanda específica
app.get('/api/demandas/:id', autenticarUsuario, (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      d.*,
      u.nome as responsavel_nome,
      u.email as responsavel_email
    FROM demandas d
    LEFT JOIN usuarios u ON d.responsavel_id = u.id
    WHERE d.id = ?
  `;
  
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Erro ao consultar demanda:', err);
      return res.status(500).json({ erro: 'Erro ao consultar demanda.' });
    }
    
    if (!row) {
      return res.status(404).json({ erro: 'Demanda não encontrada.' });
    }
    
    res.json(row);
  });
});

// Endpoint para responder a uma demanda
app.post('/api/demandas/:id/responder', autenticarUsuario, autorizarAcessoDemanda, (req, res) => {
  const { id } = req.params;
  const { resposta, anexo } = req.body;
  const responsavelId = req.usuario.id;
  
  if (!resposta) {
    return res.status(400).json({ erro: 'Resposta é obrigatória.' });
  }
  
  const dataAtualizacao = new Date().toISOString();
  
  db.run(`
    UPDATE demandas 
    SET status = 'respondida', 
        data_atualizacao = ?, 
        responsavel_id = ?
    WHERE id = ?
  `, [dataAtualizacao, responsavelId, id], function(err) {
    if (err) {
      console.error('Erro ao atualizar demanda:', err);
      return res.status(500).json({ erro: 'Erro ao atualizar demanda.' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Demanda não encontrada.' });
    }
    
    // Registrar no histórico
    db.run(`
      INSERT INTO historico_status (solicitacao_id, status, data, responsavel_id, descricao, anexo)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, 'respondida', dataAtualizacao, responsavelId, resposta, anexo || null], function(err) {
      if (err) {
        console.error('Erro ao registrar histórico:', err);
      }
      
      res.json({ 
        mensagem: 'Demanda respondida com sucesso!',
        demanda_id: id 
      });
    });
  });
});

// Endpoint para arquivar uma demanda
app.post('/api/demandas/:id/arquivar', autenticarUsuario, autorizarAcessoDemanda, (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  const responsavelId = req.usuario.id;
  
  const dataAtualizacao = new Date().toISOString();
  
  db.run(`
    UPDATE demandas 
    SET status = 'arquivada', 
        data_atualizacao = ?, 
        responsavel_id = ?
    WHERE id = ?
  `, [dataAtualizacao, responsavelId, id], function(err) {
    if (err) {
      console.error('Erro ao arquivar demanda:', err);
      return res.status(500).json({ erro: 'Erro ao arquivar demanda.' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Demanda não encontrada.' });
    }
    
    // Registrar no histórico
    const descricao = motivo ? `Arquivada: ${motivo}` : 'Demanda arquivada';
    db.run(`
      INSERT INTO historico_status (solicitacao_id, status, data, responsavel_id, descricao)
      VALUES (?, ?, ?, ?, ?)
    `, [id, 'arquivada', dataAtualizacao, responsavelId, descricao], function(err) {
      if (err) {
        console.error('Erro ao registrar histórico:', err);
      }
      
      res.json({ 
        mensagem: 'Demanda arquivada com sucesso!',
        demanda_id: id 
      });
    });
  });
});

// Endpoint para reclassificar uma demanda
app.post('/api/demandas/:id/reclassificar', autenticarUsuario, autorizarAcessoDemanda, (req, res) => {
  const { id } = req.params;
  const { novaCategoria, novaPrioridade, novaSecretaria, motivo } = req.body;
  const responsavelId = req.usuario.id;
  
  const dataAtualizacao = new Date().toISOString();
  const updates = [];
  const params = [];
  
  if (novaCategoria) {
    updates.push('categoria = ?');
    params.push(novaCategoria);
  }
  if (novaPrioridade) {
    updates.push('prioridade = ?');
    params.push(novaPrioridade);
  }
  if (novaSecretaria) {
    updates.push('secretaria = ?');
    params.push(novaSecretaria);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ erro: 'Pelo menos um campo deve ser alterado.' });
  }
  
  updates.push('data_atualizacao = ?');
  updates.push('responsavel_id = ?');
  params.push(dataAtualizacao, responsavelId, id);
  
  const query = `UPDATE demandas SET ${updates.join(', ')} WHERE id = ?`;
  
  db.run(query, params, function(err) {
    if (err) {
      console.error('Erro ao reclassificar demanda:', err);
      return res.status(500).json({ erro: 'Erro ao reclassificar demanda.' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Demanda não encontrada.' });
    }
    
    // Registrar no histórico
    const descricao = `Reclassificada: ${motivo || 'Reclassificação realizada'}`;
    db.run(`
      INSERT INTO historico_status (solicitacao_id, status, data, responsavel_id, descricao)
      VALUES (?, ?, ?, ?, ?)
    `, [id, 'reclassificada', dataAtualizacao, responsavelId, descricao], function(err) {
      if (err) {
        console.error('Erro ao registrar histórico:', err);
      }
      
      res.json({ 
        mensagem: 'Demanda reclassificada com sucesso!',
        demanda_id: id 
      });
    });
  });
});

// Endpoint para obter opções de filtro
app.get('/api/demandas/filtros', autenticarUsuario, (req, res) => {
  const { secretaria } = req.query;
  
  let query = 'SELECT DISTINCT categoria FROM demandas WHERE 1=1';
  let params = [];
  
  // Controle de acesso por secretaria
  if (!req.usuario.is_master) {
    query += ' AND secretaria = ?';
    params.push(req.usuario.secretaria);
  }
  
  if (secretaria) {
    query += ' AND secretaria = ?';
    params.push(secretaria);
  }
  
  db.all(query, params, (err, categorias) => {
    if (err) {
      console.error('Erro ao consultar categorias:', err);
      return res.status(500).json({ erro: 'Erro ao consultar categorias.' });
    }
    
    const opcoes = {
      status: ['pendente', 'em_andamento', 'respondida', 'resolvida', 'arquivada'],
      prioridade: ['baixa', 'normal', 'alta', 'urgente'],
      categorias: categorias.map(c => c.categoria)
    };
    
    res.json(opcoes);
  });
});

// =============================================
// FUNÇÕES CENTRALIZADAS PARA PROTOCOLOS
// =============================================

// Função centralizada para gerar protocolo
function generateProtocolNumber() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `OUV${month}${day}${year}/${randomNum}`;
}

// Função para verificar se protocolo já existe
function protocoloExiste(protocolo) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM demandas WHERE protocolo = ?', [protocolo], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(!!row);
      }
    });
  });
}

// Função para gerar protocolo único
async function generateUniqueProtocolNumber() {
  let protocolo;
  let tentativas = 0;
  const maxTentativas = 10;
  let existe = false;
  
  do {
    protocolo = generateProtocolNumber();
    console.log(`Tentativa ${tentativas + 1}: Gerando protocolo ${protocolo}`);
    
    try {
      existe = await protocoloExiste(protocolo);
      console.log(`Protocolo ${protocolo} existe: ${existe}`);
      tentativas++;
      
      if (tentativas > maxTentativas) {
        throw new Error('Não foi possível gerar um protocolo único após várias tentativas');
      }
    } catch (error) {
      console.error('Erro ao verificar se protocolo existe:', error);
      throw error;
    }
  } while (existe);
  
  console.log(`Protocolo único gerado: ${protocolo}`);
  return protocolo;
}

// Endpoint para gerar protocolo (usado pelo chatbot)
app.post('/api/protocolos/gerar', (req, res) => {
  generateUniqueProtocolNumber()
    .then(protocolo => {
      res.json({ 
        protocolo: protocolo,
        timestamp: new Date().toISOString()
      });
    })
    .catch(err => {
      console.error('Erro ao gerar protocolo:', err);
      res.status(500).json({ erro: 'Erro ao gerar protocolo' });
    });
});

// Endpoint para verificar se protocolo existe
app.get('/api/protocolos/:protocolo/verificar', (req, res) => {
  const { protocolo } = req.params;
  
  db.get('SELECT id FROM demandas WHERE protocolo = ?', [protocolo], (err, row) => {
    if (err) {
      console.error('Erro ao verificar protocolo:', err);
      return res.status(500).json({ erro: 'Erro ao verificar protocolo' });
    }
    
    res.json({ 
      existe: !!row,
      protocolo: protocolo
    });
  });
});

// Endpoint para buscar demanda por protocolo
app.get('/api/demandas/protocolo/:protocolo', autenticarUsuario, (req, res) => {
  const { protocolo } = req.params;
  
  const query = `
    SELECT 
      d.*,
      u.nome as responsavel_nome,
      u.email as responsavel_email
    FROM demandas d
    LEFT JOIN usuarios u ON d.responsavel_id = u.id
    WHERE d.protocolo = ?
  `;
  
  db.get(query, [protocolo], (err, row) => {
    if (err) {
      console.error('Erro ao buscar demanda por protocolo:', err);
      return res.status(500).json({ erro: 'Erro ao buscar demanda' });
    }
    
    if (!row) {
      return res.status(404).json({ erro: 'Demanda não encontrada' });
    }
    
    res.json(row);
  });
});

// Endpoint para salvar demanda do chatbot
app.post('/api/demandas/salvar-chatbot', (req, res) => {
  const {
    protocolo,
    secretaria,
    categoria,
    status,
    prioridade,
    usuario_anonimizado,
    data_criacao,
    resumo_mensagem,
    descricao_completa,
    sender_id
  } = req.body;
  
  if (!protocolo) {
    return res.status(400).json({ erro: 'Protocolo é obrigatório' });
  }
  
  const data_atualizacao = new Date().toISOString();
  
  db.run(`
    INSERT INTO demandas (
      protocolo, secretaria, categoria, status, prioridade,
      usuario_anonimizado, data_criacao, data_atualizacao,
      resumo_mensagem, descricao_completa
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    protocolo, secretaria, categoria, status, prioridade,
    usuario_anonimizado, data_criacao, data_atualizacao,
    resumo_mensagem, descricao_completa
  ], function(err) {
    if (err) {
      console.error('Erro ao salvar demanda do chatbot:', err);
      return res.status(500).json({ erro: 'Erro ao salvar demanda' });
    }
    
    // Salvar histórico de interações se disponível
    // Nota: conversationHistory não está disponível no backend
    // Esta funcionalidade pode ser implementada posteriormente se necessário
    console.log('Demanda salva com sucesso. Histórico de interações não disponível no backend.');
    
    res.json({ 
      mensagem: 'Demanda salva com sucesso',
      demanda_id: this.lastID,
      protocolo: protocolo
    });
  });
});

// Endpoint para popular dados de exemplo (apenas para desenvolvimento)
app.post('/api/demandas/popular-exemplo', autenticarMaster, (req, res) => {
  const dadosExemplo = [
    {
      protocolo: '2024-001',
      secretaria: 'Secretaria de Infraestrutura e Segurança Pública',
      categoria: 'Iluminação Pública',
      status: 'pendente',
      prioridade: 'alta',
      usuario_anonimizado: 'Usuário 001',
      data_criacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      resumo_mensagem: 'Poste de luz quebrado na Rua das Flores'
    },
    {
      protocolo: '2024-002',
      secretaria: 'Secretaria de Saúde e Direitos da Mulher',
      categoria: 'Atendimento Médico',
      status: 'em_andamento',
      prioridade: 'urgente',
      usuario_anonimizado: 'Usuário 002',
      data_criacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      resumo_mensagem: 'Solicitação de consulta médica urgente'
    },
    {
      protocolo: '2024-003',
      secretaria: 'Secretaria de Educação e Esporte',
      categoria: 'Matrícula Escolar',
      status: 'respondida',
      prioridade: 'normal',
      usuario_anonimizado: 'Usuário 003',
      data_criacao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      resumo_mensagem: 'Dúvida sobre processo de matrícula'
    },
    {
      protocolo: '2024-004',
      secretaria: 'Secretaria de Assistência Social',
      categoria: 'Bolsa Família',
      status: 'resolvida',
      prioridade: 'alta',
      usuario_anonimizado: 'Usuário 004',
      data_criacao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      resumo_mensagem: 'Atualização de dados do programa'
    },
    {
      protocolo: '2024-005',
      secretaria: 'Secretaria de Finanças - Setor de Tributos',
      categoria: 'IPTU',
      status: 'arquivada',
      prioridade: 'baixa',
      usuario_anonimizado: 'Usuário 005',
      data_criacao: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      resumo_mensagem: 'Consulta sobre desconto no IPTU'
    }
  ];

  const interacoesExemplo = {
    '2024-001': [
      { mensagem: 'Olá! Preciso de ajuda com um poste de luz quebrado na Rua das Flores.', origem: 'usuário', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { mensagem: 'Olá! Vou ajudá-lo com essa questão. Qual é o número da casa ou ponto de referência?', origem: 'bot', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60000).toISOString() },
      { mensagem: 'É próximo ao número 123, em frente à padaria.', origem: 'usuário', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 120000).toISOString() },
      { mensagem: 'Entendi! Vou encaminhar sua solicitação para a Secretaria de Infraestrutura. Seu protocolo é 2024-001.', origem: 'bot', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 180000).toISOString() }
    ],
    '2024-002': [
      { mensagem: 'Preciso marcar uma consulta médica urgente.', origem: 'usuário', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { mensagem: 'Vou ajudá-lo com isso. Qual é o tipo de consulta que você precisa?', origem: 'bot', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 60000).toISOString() },
      { mensagem: 'Consulta com cardiologista, tenho pressão alta.', origem: 'usuário', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 120000).toISOString() },
      { mensagem: 'Entendi a urgência. Vou encaminhar para a Secretaria de Saúde. Protocolo: 2024-002', origem: 'bot', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 180000).toISOString() },
      { mensagem: 'Sua consulta foi agendada para amanhã às 14h. Procure a UBS mais próxima.', origem: 'atendente', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() }
    ],
    '2024-003': [
      { mensagem: 'Como faço para matricular meu filho na escola?', origem: 'usuário', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { mensagem: 'Vou te ajudar com o processo de matrícula. Qual a idade do seu filho?', origem: 'bot', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60000).toISOString() },
      { mensagem: 'Ele tem 6 anos, vai para o 1º ano.', origem: 'usuário', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 120000).toISOString() },
      { mensagem: 'Perfeito! Vou encaminhar para a Secretaria de Educação. Protocolo: 2024-003', origem: 'bot', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 180000).toISOString() },
      { mensagem: 'A matrícula pode ser feita online ou presencialmente. Documentos necessários: RG, CPF, comprovante de residência e certidão de nascimento.', origem: 'atendente', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  };

  const stmt = db.prepare(`
    INSERT INTO demandas (
      protocolo, secretaria, categoria, status, prioridade, 
      usuario_anonimizado, data_criacao, resumo_mensagem
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let inseridos = 0;
  dadosExemplo.forEach(demanda => {
    stmt.run([
      demanda.protocolo,
      demanda.secretaria,
      demanda.categoria,
      demanda.status,
      demanda.prioridade,
      demanda.usuario_anonimizado,
      demanda.data_criacao,
      demanda.resumo_mensagem
    ], function(err) {
      if (!err) inseridos++;
    });
  });

  stmt.finalize((err) => {
    if (err) {
      console.error('Erro ao inserir dados de exemplo:', err);
      return res.status(500).json({ erro: 'Erro ao inserir dados de exemplo.' });
    }
    
    // Inserir interações de exemplo
    const interacaoStmt = db.prepare(`
      INSERT INTO historico_interacoes (
        demanda_id, protocolo, usuario_id, mensagem, origem, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    let interacoesInseridas = 0;
    
    // Buscar IDs das demandas inseridas e adicionar interações
    dadosExemplo.forEach((demanda, index) => {
      db.get('SELECT id FROM demandas WHERE protocolo = ?', [demanda.protocolo], (err, row) => {
        if (!err && row && interacoesExemplo[demanda.protocolo]) {
          interacoesExemplo[demanda.protocolo].forEach(interacao => {
            interacaoStmt.run([
              row.id,
              demanda.protocolo,
              req.usuario.id,
              interacao.mensagem,
              interacao.origem,
              interacao.timestamp
            ], function(err) {
              if (!err) interacoesInseridas++;
            });
          });
        }
      });
    });
    
    interacaoStmt.finalize((err) => {
      if (err) {
        console.error('Erro ao inserir interações de exemplo:', err);
      }
      
      res.json({ 
        mensagem: `${inseridos} demandas e ${interacoesInseridas} interações de exemplo inseridas com sucesso!`,
        demandas: inseridos,
        interacoes: interacoesInseridas
      });
    });
  });
});

// =============================================
// ENDPOINTS PARA HISTÓRICO DE INTERAÇÕES
// =============================================

// Endpoint para registrar uma interação
app.post('/api/demandas/:id/interacao', autenticarUsuario, autorizarAcessoDemanda, (req, res) => {
  const { id } = req.params;
  const { mensagem, origem, tipo_midia, caminho_arquivo } = req.body;
  
  if (!mensagem) {
    return res.status(400).json({ erro: 'Mensagem é obrigatória.' });
  }
  
  const timestamp = new Date().toISOString();
  
  // Primeiro, buscar o protocolo da demanda
  db.get('SELECT protocolo FROM demandas WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Erro ao buscar protocolo:', err);
      return res.status(500).json({ erro: 'Erro ao buscar protocolo.' });
    }
    
    if (!row) {
      return res.status(404).json({ erro: 'Demanda não encontrada.' });
    }
    
    // Inserir a interação
    db.run(`
      INSERT INTO historico_interacoes (
        demanda_id, protocolo, usuario_id, mensagem, origem, 
        timestamp, tipo_midia, caminho_arquivo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, row.protocolo, req.usuario.id, mensagem, origem, 
      timestamp, tipo_midia || null, caminho_arquivo || null
    ], function(err) {
      if (err) {
        console.error('Erro ao registrar interação:', err);
        return res.status(500).json({ erro: 'Erro ao registrar interação.' });
      }
      
      res.json({ 
        mensagem: 'Interação registrada com sucesso!',
        interacao_id: this.lastID 
      });
    });
  });
});

// Endpoint para obter histórico completo de uma demanda
app.get('/api/demandas/:id/historico', autenticarUsuario, autorizarAcessoDemanda, (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      hi.*,
      u.nome as responsavel_nome
    FROM historico_interacoes hi
    LEFT JOIN usuarios u ON hi.usuario_id = u.id
    WHERE hi.demanda_id = ?
    ORDER BY hi.timestamp ASC
  `;
  
  db.all(query, [id], (err, rows) => {
    if (err) {
      console.error('Erro ao consultar histórico:', err);
      return res.status(500).json({ erro: 'Erro ao consultar histórico.' });
    }
    
    // Formatar as interações
    const historico = rows.map(row => ({
      id: row.id,
      mensagem: row.mensagem,
      origem: row.origem,
      timestamp: row.timestamp,
      tipo_midia: row.tipo_midia,
      caminho_arquivo: row.caminho_arquivo,
      responsavel: row.responsavel_nome || 'Sistema'
    }));
    
    res.json({
      demanda_id: id,
      total_interacoes: historico.length,
      historico: historico
    });
  });
});

// Endpoint para obter detalhes completos de uma demanda com histórico
app.get('/api/demandas/:id/detalhes-completos', autenticarUsuario, autorizarAcessoDemanda, (req, res) => {
  const { id } = req.params;
  
  // Buscar dados da demanda
  const demandaQuery = `
    SELECT 
      d.*,
      u.nome as responsavel_nome,
      u.email as responsavel_email
    FROM demandas d
    LEFT JOIN usuarios u ON d.responsavel_id = u.id
    WHERE d.id = ?
  `;

// Endpoint para enviar resposta via editor
app.post('/api/demandas/:id/responder', autenticarUsuario, autorizarAcessoDemanda, (req, res) => {
  const { id } = req.params;
  const { resposta, modoEnvio, emailDestinatario, assuntoEmail, telefoneDestinatario } = req.body;
  
  if (!resposta || !resposta.trim()) {
    return res.status(400).json({ erro: 'Resposta é obrigatória.' });
  }
  
  const timestamp = new Date().toISOString();
  
  // Buscar dados da demanda
  db.get('SELECT * FROM demandas WHERE id = ?', [id], (err, demanda) => {
    if (err) {
      console.error('Erro ao buscar demanda:', err);
      return res.status(500).json({ erro: 'Erro ao buscar demanda.' });
    }
    
    if (!demanda) {
      return res.status(404).json({ erro: 'Demanda não encontrada.' });
    }
    
    // Atualizar a demanda com a resposta
    db.run(`
      UPDATE demandas 
      SET resposta = ?, data_resposta = ?, status = 'Finalizado'
      WHERE id = ?
    `, [resposta, timestamp, id], function(err) {
      if (err) {
        console.error('Erro ao atualizar demanda:', err);
        return res.status(500).json({ erro: 'Erro ao atualizar demanda.' });
      }
      
      // Registrar a resposta no histórico
      db.run(`
        INSERT INTO historico_interacoes (
          demanda_id, protocolo, usuario_id, mensagem, origem, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [id, demanda.protocolo, req.usuario.id, resposta, 'resposta', timestamp], function(err) {
        if (err) {
          console.error('Erro ao registrar resposta no histórico:', err);
        }
        
        // Enviar resposta baseado no modo de envio
        const enviarResposta = async () => {
          try {
            switch (modoEnvio) {
              case 'chatbot':
                // Enviar via WhatsApp (implementar integração)
                console.log('Enviando resposta via chatbot para:', demanda.telefone);
                break;
                
              case 'email':
                if (emailDestinatario) {
                  const assunto = assuntoEmail || `Resposta - Protocolo ${demanda.protocolo}`;
                  await enviarEmailNotificacao(emailDestinatario, assunto, resposta);
                }
                break;
                
              case 'sms':
                if (telefoneDestinatario) {
                  // Implementar envio de SMS
                  console.log('Enviando SMS para:', telefoneDestinatario);
                }
                break;
            }
          } catch (error) {
            console.error('Erro ao enviar resposta:', error);
          }
        };
        
        enviarResposta();
        
        res.json({ 
          mensagem: 'Resposta enviada com sucesso!',
          protocolo: demanda.protocolo,
          modo_envio: modoEnvio
        });
      });
    });
  });
});
  
  db.get(demandaQuery, [id], (err, demanda) => {
    if (err) {
      console.error('Erro ao consultar demanda:', err);
      return res.status(500).json({ erro: 'Erro ao consultar demanda.' });
    }
    
    if (!demanda) {
      return res.status(404).json({ erro: 'Demanda não encontrada.' });
    }
    
    // Buscar histórico de interações
    const historicoQuery = `
      SELECT 
        hi.*,
        u.nome as responsavel_nome
      FROM historico_interacoes hi
      LEFT JOIN usuarios u ON hi.usuario_id = u.id
      WHERE hi.demanda_id = ?
      ORDER BY hi.timestamp ASC
    `;
    
    db.all(historicoQuery, [id], (err, historico) => {
      if (err) {
        console.error('Erro ao consultar histórico:', err);
        return res.status(500).json({ erro: 'Erro ao consultar histórico.' });
      }
      
      // Formatar o histórico
      const historicoFormatado = historico.map(row => ({
        id: row.id,
        mensagem: row.mensagem,
        origem: row.origem,
        timestamp: row.timestamp,
        tipo_midia: row.tipo_midia,
        caminho_arquivo: row.caminho_arquivo,
        responsavel: row.responsavel_nome || 'Sistema'
      }));
      
      res.json({
        demanda: {
          id: demanda.id,
          protocolo: demanda.protocolo,
          secretaria: demanda.secretaria,
          categoria: demanda.categoria,
          status: demanda.status,
          prioridade: demanda.prioridade,
          usuario_anonimizado: demanda.usuario_anonimizado,
          data_criacao: demanda.data_criacao,
          data_atualizacao: demanda.data_atualizacao,
          resumo_mensagem: demanda.resumo_mensagem,
          descricao_completa: demanda.descricao_completa,
          responsavel: demanda.responsavel_nome,
          responsavel_email: demanda.responsavel_email
        },
        historico: {
          total_interacoes: historicoFormatado.length,
          interacoes: historicoFormatado
        }
      });
    });
  });
});

// Endpoint para exportar histórico em formato de transcript
app.get('/api/demandas/:id/transcript', autenticarUsuario, autorizarAcessoDemanda, (req, res) => {
  const { id } = req.params;
  const { formato = 'txt' } = req.query;
  
  // Buscar dados da demanda e histórico
  const query = `
    SELECT 
      d.protocolo,
      d.secretaria,
      d.categoria,
      d.usuario_anonimizado,
      d.data_criacao,
      hi.mensagem,
      hi.origem,
      hi.timestamp,
      hi.tipo_midia,
      u.nome as responsavel_nome
    FROM demandas d
    LEFT JOIN historico_interacoes hi ON d.id = hi.demanda_id
    LEFT JOIN usuarios u ON hi.usuario_id = u.id
    WHERE d.id = ?
    ORDER BY hi.timestamp ASC
  `;
  
  db.all(query, [id], (err, rows) => {
    if (err) {
      console.error('Erro ao gerar transcript:', err);
      return res.status(500).json({ erro: 'Erro ao gerar transcript.' });
    }
    
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Demanda não encontrada.' });
    }
    
    const demanda = {
      protocolo: rows[0].protocolo,
      secretaria: rows[0].secretaria,
      categoria: rows[0].categoria,
      usuario: rows[0].usuario_anonimizado,
      data_criacao: rows[0].data_criacao
    };
    
    const interacoes = rows.filter(row => row.mensagem).map(row => ({
      mensagem: row.mensagem,
      origem: row.origem,
      timestamp: row.timestamp,
      tipo_midia: row.tipo_midia,
      responsavel: row.responsavel_nome || 'Sistema'
    }));
    
    let transcript = '';
    
    if (formato === 'txt') {
      transcript = `TRANSCRIPT - PROTOCOLO ${demanda.protocolo}\n`;
      transcript += `Secretaria: ${demanda.secretaria}\n`;
      transcript += `Categoria: ${demanda.categoria}\n`;
      transcript += `Usuário: ${demanda.usuario}\n`;
      transcript += `Data de Criação: ${new Date(demanda.data_criacao).toLocaleString('pt-BR')}\n`;
      transcript += `Total de Interações: ${interacoes.length}\n`;
      transcript += `\n${'='.repeat(50)}\n\n`;
      
      interacoes.forEach((interacao, index) => {
        const data = new Date(interacao.timestamp).toLocaleString('pt-BR');
        const origem = interacao.origem === 'usuário' ? 'USUÁRIO' : 'ATENDENTE';
        transcript += `[${data}] ${origem}: ${interacao.mensagem}\n`;
        
        if (interacao.tipo_midia) {
          transcript += `[${data}] ${origem}: [${interacao.tipo_midia.toUpperCase()}]\n`;
        }
        transcript += '\n';
      });
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="transcript_${demanda.protocolo}.txt"`);
      res.send(transcript);
      
    } else if (formato === 'json') {
      res.json({
        demanda: demanda,
        interacoes: interacoes
      });
    } else {
      res.status(400).json({ erro: 'Formato não suportado. Use "txt" ou "json".' });
    }
  });
});

// Rota para reenviar email com credenciais
app.post('/api/reenviar-email-credenciais', autenticarMaster, async (req, res) => {
  const { email, cpf, secretaria, senha } = req.body;
  
  try {
    const urlSistema = process.env.REACT_APP_URL || 'http://localhost:3000';
    const assunto = '🔐 Acesso ao Sistema da Ouvidoria - Credenciais de Login';
    const corpo = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #003366; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">🏛️ Sistema da Ouvidoria</h1>
          <p style="margin: 10px 0 0 0;">Prefeitura Municipal de Venturosa</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #003366; margin-top: 0;">🔐 Suas Credenciais de Acesso</h2>
          
          <p>Olá! Suas credenciais de acesso para a <strong>${secretaria}</strong> no Sistema da Ouvidoria foram reenviadas.</p>
          
          <div style="background-color: #f0f8ff; border-left: 4px solid #003366; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #003366;">📋 Informações de Acesso:</h3>
            <p><strong>URL do Sistema:</strong> <a href="${urlSistema}" style="color: #003366;">${urlSistema}</a></p>
            <p><strong>CPF:</strong> ${cpf}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Senha:</strong> <span style="background-color: #ffffcc; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${senha}</span></p>
            <p><strong>Secretaria:</strong> ${secretaria}</p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #856404;">⚠️ Importante:</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Guarde essas informações em local seguro</li>
              <li>Altere sua senha no primeiro acesso</li>
              <li>Em caso de dúvidas, entre em contato com o administrador</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${urlSistema}" style="background-color: #003366; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              🚀 Acessar Sistema
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="text-align: center; color: #666; font-size: 12px;">
            Este é um email automático do Sistema da Ouvidoria.<br>
            Não responda a este email.
          </p>
        </div>
      </div>
    `;
    
    await enviarEmail(email, assunto, corpo);
    console.log(`Email reenviado com sucesso para: ${email}`);
    
    res.json({ mensagem: 'Email reenviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao reenviar email:', error);
    res.status(500).json({ erro: 'Erro ao reenviar email' });
  }
});