/**
 * Serviço de mensagens
 * Gerencia o envio de mensagens pelo WhatsApp
 */

const { client } = require('../index');
const { SECRETARIAS_WHATSAPP } = require('../config/config');

// Objetos para armazenamento de dados
const conversationHistory = {};
const userStates = {};
const userTimers = {};
const menuOptionsHistory = {};

/**
 * Envia uma mensagem para um número
 * @param {string} to Número de destino
 * @param {string} message Mensagem a ser enviada
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function sendMessage(to, message) {
    try {
        // Verifica se o número está registrado no WhatsApp
        const isRegistered = await client.isRegisteredUser(to);
        if (!isRegistered) {
            console.error('Número não registrado no WhatsApp:', to);
            return false;
        }

        const chat = await client.getChatById(to);
        
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
        // Verifica se o número está registrado no WhatsApp
        const isRegistered = await client.isRegisteredUser(secretariaNumero);
        if (!isRegistered) {
            console.error('Número não registrado no WhatsApp:', secretariaNumero);
            return false;
        }

        const chat = await client.getChatById(secretariaNumero);
        
        // Adiciona delay para evitar flood
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Formata a mensagem com emojis e estrutura clara
        const mensagem = `📢 *NOVA SOLICITAÇÃO - Protocolo ${protocolNumber}*\n\n` +
                        `🏛️ *Secretaria:* ${Object.keys(SECRETARIAS_WHATSAPP).find(key => SECRETARIAS_WHATSAPP[key] === SECRETARIAS_WHATSAPP[atendimento.secretaria])}\n` +
                        `👤 *Solicitante:* ${atendimento.anonimo ? 'Anônimo' : atendimento.nome}\n` +
                        `📞 *Contato:* ${atendimento.telefone || 'Não informado'}\n` +
                        `📧 *E-mail:* ${atendimento.email || 'Não informado'}\n` +
                        `📌 *Tipo:* ${['Reclamação','Denúncia','Sugestão','Elogio','Informação'][atendimento.tipo-1]}\n\n` +
                        `📝 *DESCRIÇÃO*\n` +
                        `${atendimento.descricao || "Não informado"}\n` +
                        `🔧 *Serviço Selecionado:* ${atendimento.servicoSelecionado || "Não informado"}\n` +
                        `🔍 *Detalhes do Serviço:*\n` +
                        `${atendimento.detalhesServico || "Não informado"}\n` +
                        `⚙️ *Status:* ${atendimento.status || "Não informado"}\n` +
                        `🔒 *Confidencialidade:* ${atendimento.confidencialidade || "Não informado"}\n` +
                        `📎 *Anexos:* ${atendimento.anexos && atendimento.anexos.length > 0 ? atendimento.anexos.map(a => a.nomeOriginal).join(", ") : "Nenhum anexo"}\n\n` +
                        `⚠️ *Atenção:* Por favor, dê andamento em até 5 dias úteis`;
        // Envia a mensagem para a secretaria
        await chat.sendMessage(mensagem);
        // Envia a mensagem de acusar recebimento
        const msgAcuse = `Deseja acusar recebimento da solicitação?\n1 - Sim\n2 - Não`;
        await chat.sendMessage(msgAcuse);
        // Marca o estado aguardando resposta de acuse de recebimento
        if (!userStates[secretariaNumero]) userStates[secretariaNumero] = {};
        userStates[secretariaNumero].aguardandoAcuseRecebimento = true;
        userStates[secretariaNumero].protocoloAcuse = protocolNumber;
        console.log(`✅ Mensagem de acuse enviada para: ${secretariaNumero}`);
        return true;
    } catch (error) {
        console.error(`❌ Falha ao notificar ${secretariaNumero}:`, error);
        return false;
    }
}

/**
 * Registra uma opção selecionada pelo usuário
 * @param {string} userId ID do usuário
 * @param {string} option Opção selecionada
 */
function registerMenuOption(userId, option) {
    if (!menuOptionsHistory[userId]) {
        menuOptionsHistory[userId] = [];
    }
    
    menuOptionsHistory[userId].push({
        option,
        timestamp: new Date()
    });
}

/**
 * Obtém o histórico de opções de um usuário
 * @param {string} userId ID do usuário
 * @returns {Array} Histórico de opções
 */
function getMenuOptionsHistory(userId) {
    return menuOptionsHistory[userId] || [];
}

/**
 * Define o estado de um usuário
 * @param {string} userId ID do usuário
 * @param {string} state Estado do usuário
 * @param {Object} data Dados adicionais (opcional)
 */
function setUserState(userId, state, data = {}) {
    if (!userStates[userId]) {
        userStates[userId] = {};
    }
    
    userStates[userId] = {
        ...userStates[userId],
        state,
        ...data
    };
}

/**
 * Obtém o estado de um usuário
 * @param {string} userId ID do usuário
 * @returns {Object} Estado do usuário
 */
function getUserState(userId) {
    return userStates[userId] || {};
}

module.exports = {
    sendMessage,
    notificarSecretariaWhatsApp,
    registerMenuOption,
    getMenuOptionsHistory,
    setUserState,
    getUserState,
    conversationHistory,
    userStates,
    userTimers,
    menuOptionsHistory
};