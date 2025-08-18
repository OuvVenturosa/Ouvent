/**
 * Inicialização do banco de dados SQLite
 * Cria as tabelas necessárias para o funcionamento do chatbot
 */

const { db, execute } = require('./dbConnection');

/**
 * Inicializa o banco de dados criando as tabelas necessárias
 * @returns {Promise<void>}
 */
async function initDatabase() {
  try {
    console.log('🔄 Inicializando banco de dados...');
    
    // Verifica se as tabelas já existem antes de criar
    await execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cpf TEXT UNIQUE,
        telefone TEXT,
        email TEXT UNIQUE,
        senha_hash TEXT,
        secretaria TEXT,
        is_master INTEGER DEFAULT 0
      )
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS solicitacoes (
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
      )
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS historico_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        solicitacao_id INTEGER,
        status TEXT,
        data TEXT,
        responsavel_id INTEGER,
        descricao TEXT,
        anexo TEXT,
        FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes(id),
        FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
      )
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS demandas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        protocolo TEXT UNIQUE,
        nome TEXT,
        telefone TEXT,
        servico TEXT,
        descricao TEXT,
        secretaria_responsavel TEXT,
        status TEXT DEFAULT 'pendente',
        data_criacao TEXT,
        data_atualizacao TEXT,
        prazo_resposta TEXT
      )
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS historico_interacoes (
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
      )
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS estados_usuario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telefone TEXT UNIQUE,
        estado TEXT,
        dados TEXT,
        ultima_atualizacao TEXT
      )
    `);

    console.log('✅ Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

module.exports = {
  initDatabase
};