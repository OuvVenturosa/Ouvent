/**
 * Serviço de mensagens
 * Gerencia o envio de mensagens pelo WhatsApp e integração com o banco de dados
 */

// Importação do client global
let client = null;

// Função para obter o client quando necessário
function getClient() {
    if (!client) {
        try {
            const init = require('../init');
            client = init.getClient();
        } catch (error) {
            console.log('⚠️ Client não disponível, continuando sem envio de mensagens');
            return null;
        }
    }
    return client;
}
const { SECRETARIAS_WHATSAPP } = require('../config/config');
const { query, execute, queryOne } = require('../database/dbConnection');

// Objetos para cache temporário de dados
const userStatesCache = {};
const userTimers = {};
const menuOptionsHistory = {};
const conversationHistory = {};

/**
 * Obtém o estado atual do usuário do banco de dados
 * @param {string} telefone Número de telefone do usuário
 * @returns {Promise<Object>} Estado do usuário
 */
async function getUserState(telefone) {
  try {
    if (userStatesCache[telefone]) {
      return userStatesCache[telefone];
    }
    const sql = `
      SELECT * FROM estados_usuario
      WHERE telefone = ?
    `;
    const estado = await queryOne(sql, [telefone]);
    if (estado) {
      const estadoObj = {
        ...estado,
        dados: estado.dados ? JSON.parse(estado.dados) : {}
      };
      userStatesCache[telefone] = estadoObj;
      return estadoObj;
    }
    return { estado: 'inicial', dados: {} };
  } catch (error) {
    console.error(`❌ Erro ao buscar estado do usuário ${telefone}:`, error);
    return { estado: 'inicial', dados: {} };
  }
}

/**
 * Define o estado atual do usuário no banco de dados
 * @param {string} telefone Número de telefone do usuário
 * @param {string} estado Estado do usuário
 * @param {Object} dados Dados adicionais do estado
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function setUserState(telefone, estado, dados = {}) {
  try {
    const agora = new Date().toISOString();
    const dadosJSON = JSON.stringify(dados);
    
    // UPSERT por telefone para evitar erros de UNIQUE
    const sql = `
      INSERT INTO estados_usuario (telefone, estado, dados, ultima_atualizacao)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(telefone) DO UPDATE SET
        estado = excluded.estado,
        dados = excluded.dados,
        ultima_atualizacao = excluded.ultima_atualizacao
    `;
    const params = [telefone, estado, dadosJSON, agora];
    await execute(sql, params);
    
    // Atualiza o cache
    userStatesCache[telefone] = {
      telefone,
      estado,
      dados,
      ultima_atualizacao: agora
    };
    
    // Se temos um protocolo, atualiza o status da demanda
    if (dados.protocolNumber) {
      await execute(`
        UPDATE demandas
        SET status = ?, data_atualizacao = ?
        WHERE protocolo = ?
      `, [estado, agora, dados.protocolNumber]);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao definir estado do usuário ${telefone}:`, error);
    return false;
  }
}

/**
 * Registra uma opção de menu selecionada pelo usuário
 * @param {string} telefone Número de telefone do usuário
 * @param {string} opcao Opção selecionada
 * @param {string} protocolNumber Número do protocolo (opcional)
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function registerMenuOption(telefone, opcao, protocolNumber = null) {
  try {
    // Registra no histórico temporário
    if (!menuOptionsHistory[telefone]) {
      menuOptionsHistory[telefone] = [];
    }
    
    menuOptionsHistory[telefone].push({
      opcao,
      timestamp: new Date().toISOString()
    });
    
    // Se temos um protocolo, registra a interação no banco
    if (protocolNumber) {
      const sql = `
        INSERT INTO historico_interacoes (
          protocolo,
          usuario_id,
          mensagem,
          origem,
          timestamp
        ) VALUES (?, ?, ?, ?, ?)
      `;
      
      const params = [
        protocolNumber,
        telefone,
        `Opção selecionada: ${opcao}`,
        'usuario',
        new Date().toISOString()
      ];
      
      await execute(sql, params);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao registrar opção de menu para ${telefone}:`, error);
    return false;
  }
}

/**
 * Envia uma mensagem para um número
 * @param {string} to Número de destino
 * @param {string} message Mensagem a ser enviada
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function sendMessage(to, message) {
    try {
        // Modo de teste: apenas loga a mensagem e considera como enviada
        if (process.env.CHATBOT_TEST === '1') {
            console.log(`[TEST MODE] -> ${to}:`);
            console.log(message);
            return true;
        }
        // Obtém o client
        const currentClient = getClient();
        if (!currentClient) {
            console.error('❌ Client não disponível para envio de mensagem');
            return false;
        }
        
        // Verifica se o número está registrado no WhatsApp
        const isRegistered = await currentClient.isRegisteredUser(to);
        if (!isRegistered) {
            console.error('Número não registrado no WhatsApp:', to);
            return false;
        }

        const chat = await currentClient.getChatById(to);
        
        // Adiciona delay para evitar flood
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Envia a mensagem
        await chat.sendMessage(message);
        console.log(`✅ Mensagem enviada para: ${to}`);
        return true;
    } catch (error) {
        console.error(`❌ Falha ao enviar mensagem para ${to}:`, error);
        return false;
    }
}

/**
 * Notifica uma secretaria pelo WhatsApp
 * @param {number} secretariaId ID da secretaria
 * @param {string} protocolNumber Número do protocolo
 * @param {Object} atendimento Dados do atendimento
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function notificarSecretariaWhatsApp(secretariaId, protocolNumber, atendimento) {
    const secretariaNumero = SECRETARIAS_WHATSAPP[secretariaId];
    
    if (!secretariaNumero) {
        console.error(`❌ Número da secretaria ${secretariaId} não encontrado`);
        return false;
    }
    
    try {
        // Obtém o client
        const currentClient = getClient();
        if (!currentClient) {
            console.error('❌ Client não disponível para notificação');
            return false;
        }
        
        // Verifica se o número está registrado no WhatsApp
        const isRegistered = await currentClient.isRegisteredUser(secretariaNumero);
        if (!isRegistered) {
            console.error('Número não registrado no WhatsApp:', secretariaNumero);
            return false;
        }

        const chat = await currentClient.getChatById(secretariaNumero);
        
        // Adiciona delay para evitar flood
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Formata a mensagem com emojis e estrutura clara
        const secretariaNomeMap = {
            1: 'Secretaria de Desenvolvimento Rural e Meio Ambiente',
            2: 'Secretaria de Assistência Social',
            3: 'Secretaria de Educação e Esporte',
            4: 'Secretaria de Infraestrutura e Segurança Pública',
            5: 'Secretaria de Saúde e Direitos da Mulher',
            6: 'Hospital e Maternidade Justa Maria Bezerra',
            7: 'Programa Mulher Segura (Coordenadora da Mulher)',
            8: 'Secretaria de Finanças - Setor de Tributos',
            9: 'Secretaria de Administração - Servidores Municipais'
        };
        const mensagem = `📢 *NOVA SOLICITAÇÃO - Protocolo ${protocolNumber}*\n\n` +
                        `🏛️ *Secretaria:* ${secretariaNomeMap[secretariaId] || 'Não informado'}\n` +
                        `👤 *Solicitante:* ${atendimento.anonimo ? 'Anônimo' : (atendimento.nome || 'Não informado')}\n` +
                        `📞 *Contato:* ${atendimento.telefone || 'Não informado'}\n` +
                        `📧 *E-mail:* ${atendimento.email || 'Não informado'}\n` +
                        `📌 *Tipo:* ${atendimento.tipoNome || 'Não informado'}\n\n` +
                        `📝 *DESCRIÇÃO*\n` +
                        `${atendimento.descricao || 'Não informado'}\n` +
                        `⚙️ *Status:* ${atendimento.status || 'Aberto'}\n` +
                        `📎 *Anexos:* ${atendimento.anexos && atendimento.anexos.length > 0 ? atendimento.anexos.map(a => a.nomeOriginal).join(', ') : 'Nenhum anexo'}\n\n` +
                        `⚠️ *Atenção:* Por favor, dê andamento em até 5 dias úteis`;
        // Envia a mensagem para a secretaria
        await chat.sendMessage(mensagem);
        // Envia a mensagem de acusar recebimento
        const msgAcuse = `Deseja acusar recebimento da solicitação?\n1 - Sim\n2 - Não`;
        await chat.sendMessage(msgAcuse);
        // Marca o estado aguardando resposta de acuse de recebimento
        await setUserState(secretariaNumero, 'aguardando_acuse', {
            aguardandoAcuseRecebimento: true,
            protocoloAcuse: protocolNumber
        });
        console.log(`✅ Mensagem de acuse enviada para: ${secretariaNumero}`);
        return true;
    } catch (error) {
        console.error(`❌ Falha ao notificar ${secretariaNumero}:`, error);
        return false;
    }
}

// (Removida a segunda definição duplicada de registerMenuOption)

/**
 * Obtém o histórico de opções de um usuário
 * @param {string} userId ID do usuário
 * @returns {Array} Histórico de opções
 */
function getMenuOptionsHistory(userId) {
    return menuOptionsHistory[userId] || [];
}



// (Removida a segunda definição duplicada de getUserState baseada em 'demandas')

module.exports = {
    sendMessage,
    notificarSecretariaWhatsApp,
    registerMenuOption,
    getMenuOptionsHistory,
    setUserState,
    getUserState,
    conversationHistory,
    userStatesCache,
    userTimers,
    menuOptionsHistory
};