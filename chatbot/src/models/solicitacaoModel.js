/**
 * Modelo de solicitação
 * Gerencia os dados de solicitações no banco de dados SQLite
 */

const { query, queryOne, execute } = require('../database/dbConnection');

/**
 * Cria uma nova solicitação no banco de dados
 * @param {Object} data Dados da solicitação
 * @returns {Promise<Object>} Solicitação criada
 */
async function createSolicitacao(data) {
  try {
    const {
      protocolo,
      nome,
      telefone,
      servico,
      descricao,
      secretaria_responsavel,
      status = 'pendente'
    } = data;

    const data_criacao = new Date().toISOString();

    const sql = `
      INSERT INTO demandas (
        protocolo,
        nome,
        telefone,
        servico,
        descricao,
        secretaria_responsavel,
        status,
        data_criacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      protocolo,
      nome,
      telefone,
      servico,
      descricao,
      secretaria_responsavel,
      status,
      data_criacao
    ];

    const result = await execute(sql, params);
    
    console.log(`✅ Solicitação criada no banco de dados: ${protocolo}`);
    
    return {
      id: result.lastID,
      protocolo,
      nome,
      telefone,
      servico,
      descricao,
      secretaria_responsavel,
      status,
      data_criacao
    };
  } catch (error) {
    console.error('❌ Erro ao criar solicitação:', error);
    throw error;
  }
}

/**
 * Busca uma solicitação pelo protocolo
 * @param {string} protocolo Número do protocolo
 * @returns {Promise<Object>} Solicitação encontrada
 */
async function getSolicitacaoByProtocolo(protocolo) {
  try {
    const sql = `
      SELECT * FROM demandas
      WHERE protocolo = ?
    `;

    const solicitacao = await queryOne(sql, [protocolo]);
    
    return solicitacao;
  } catch (error) {
    console.error(`❌ Erro ao buscar solicitação com protocolo ${protocolo}:`, error);
    throw error;
  }
}

/**
 * Busca solicitações pelo número de telefone
 * @param {string} telefone Número de telefone
 * @returns {Promise<Array>} Lista de solicitações
 */
async function getSolicitacoesByTelefone(telefone) {
  try {
    const sql = `
      SELECT * FROM demandas
      WHERE telefone = ?
      ORDER BY data_criacao DESC
    `;

    const solicitacoes = await query(sql, [telefone]);
    
    return solicitacoes;
  } catch (error) {
    console.error(`❌ Erro ao buscar solicitações para o telefone ${telefone}:`, error);
    throw error;
  }
}

/**
 * Atualiza o status de uma solicitação
 * @param {string} protocolo Número do protocolo
 * @param {string} status Novo status
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function updateSolicitacaoStatus(protocolo, status) {
  try {
    const data_atualizacao = new Date().toISOString();

    const sql = `
      UPDATE demandas
      SET status = ?, data_atualizacao = ?
      WHERE protocolo = ?
    `;

    const result = await execute(sql, [status, data_atualizacao, protocolo]);
    
    console.log(`✅ Status da solicitação ${protocolo} atualizado para ${status}`);
    
    return result.changes > 0;
  } catch (error) {
    console.error(`❌ Erro ao atualizar status da solicitação ${protocolo}:`, error);
    throw error;
  }
}

/**
 * Registra uma interação na solicitação
 * @param {Object} data Dados da interação
 * @returns {Promise<Object>} Interação registrada
 */
async function registrarInteracao(data) {
  try {
    const {
      demanda_id,
      protocolo,
      usuario_id,
      mensagem,
      origem,
      tipo_midia = null,
      caminho_arquivo = null
    } = data;

    const timestamp = new Date().toISOString();

    const sql = `
      INSERT INTO historico_interacoes (
        demanda_id,
        protocolo,
        usuario_id,
        mensagem,
        origem,
        timestamp,
        tipo_midia,
        caminho_arquivo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      demanda_id,
      protocolo,
      usuario_id,
      mensagem,
      origem,
      timestamp,
      tipo_midia,
      caminho_arquivo
    ];

    const result = await execute(sql, params);
    
    console.log(`✅ Interação registrada para a solicitação ${protocolo}`);
    
    return {
      id: result.lastID,
      demanda_id,
      protocolo,
      usuario_id,
      mensagem,
      origem,
      timestamp,
      tipo_midia,
      caminho_arquivo
    };
  } catch (error) {
    console.error('❌ Erro ao registrar interação:', error);
    throw error;
  }
}

/**
 * Busca o histórico de interações de uma solicitação
 * @param {string} protocolo Número do protocolo
 * @returns {Promise<Array>} Lista de interações
 */
async function getHistoricoInteracoes(protocolo) {
  try {
    const sql = `
      SELECT * FROM historico_interacoes
      WHERE protocolo = ?
      ORDER BY timestamp ASC
    `;

    const interacoes = await query(sql, [protocolo]);
    
    return interacoes;
  } catch (error) {
    console.error(`❌ Erro ao buscar histórico de interações para o protocolo ${protocolo}:`, error);
    throw error;
  }
}

/**
 * Gera um número de protocolo único
 * @returns {string} Número de protocolo
 */
async function generateProtocolNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Busca o último protocolo do dia
  const prefixo = `${year}${month}${day}`;
  
  const sql = `
    SELECT protocolo FROM demandas
    WHERE protocolo LIKE ?
    ORDER BY protocolo DESC
    LIMIT 1
  `;
  
  const ultimoProtocolo = await queryOne(sql, [`${prefixo}%`]);
  
  let sequencial = 1;
  
  if (ultimoProtocolo) {
    // Extrai o número sequencial do último protocolo
    const ultimoSequencial = parseInt(ultimoProtocolo.protocolo.slice(-4));
    sequencial = ultimoSequencial + 1;
  }
  
  // Formata o número sequencial com zeros à esquerda
  const sequencialFormatado = String(sequencial).padStart(4, '0');
  
  return `${prefixo}${sequencialFormatado}`;
}

module.exports = {
  createSolicitacao,
  getSolicitacaoByProtocolo,
  getSolicitacoesByTelefone,
  updateSolicitacaoStatus,
  registrarInteracao,
  getHistoricoInteracoes,
  generateProtocolNumber
};