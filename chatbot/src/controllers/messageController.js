/**
 * Controlador de mensagens
 * Gerencia o processamento de mensagens recebidas
 */

const { client } = require('../index');
const { ADMINS } = require('../config/config');
const { sendMessage, getUserState, setUserState, registerMenuOption } = require('../services/messageService');
const { createAtendimento, getAtendimento, updateAtendimento } = require('../models/atendimentoModel');
const { notificarSecretariaWhatsApp } = require('../services/messageService');
const { notificarSecretariaEmail } = require('../services/emailService');
const { registerAtendimento } = require('../services/reportService');

/**
 * Inicializa o controlador de mensagens
 */
function initializeMessageController() {
    // Configura o evento de mensagem
    client.on('message', handleIncomingMessage);
    console.log('✅ Controlador de mensagens inicializado');
}

/**
 * Processa uma mensagem recebida
 * @param {Message} message Mensagem recebida
 */
async function handleIncomingMessage(message) {
    try {
        const from = message.from;
        const body = message.body;
        
        console.log(`📩 Mensagem recebida de ${from}: ${body}`);
        
        // Verifica se é uma mensagem de administrador
        if (ADMINS.includes(from)) {
            await handleAdminMessage(message);
            return;
        }
        
        // Processa a mensagem do usuário
        await handleUserMessage(message);
    } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
    }
}

/**
 * Processa uma mensagem de administrador
 * @param {Message} message Mensagem recebida
 */
async function handleAdminMessage(message) {
    const from = message.from;
    const body = message.body;
    
    // Implementar lógica para comandos de administrador
    if (body.startsWith('/status')) {
        // Comando para verificar o status do sistema
        const status = `🤖 *Status do Sistema*\n\n` +
                      `📊 Total de atendimentos: ${Object.keys(require('../models/atendimentoModel').atendimentos).length}\n` +
                      `👥 Usuários ativos: ${Object.keys(require('../services/messageService').userStates).length}\n` +
                      `⏱️ Uptime: ${formatUptime(process.uptime())}\n`;
        
        await sendMessage(from, status);
    } else {
        // Mensagem de ajuda para administrador
        const help = `🤖 *Comandos de Administrador*\n\n` +
                    `/status - Verificar status do sistema\n`;
        
        await sendMessage(from, help);
    }
}

/**
 * Processa uma mensagem de usuário
 * @param {Message} message Mensagem recebida
 */
async function handleUserMessage(message) {
    const from = message.from;
    const body = message.body;
    
    // Obtém o estado atual do usuário
    const userState = getUserState(from);
    
    // Se o usuário não tem estado, envia a mensagem de boas-vindas
    if (!userState.state) {
        await sendWelcomeMessage(from);
        return;
    }
    
    // Processa a mensagem de acordo com o estado do usuário
    switch (userState.state) {
        case 'MENU_PRINCIPAL':
            await handleMainMenu(from, body);
            break;
        case 'NOVA_SOLICITACAO':
            await handleNewRequest(from, body, userState);
            break;
        case 'CONSULTAR_PROTOCOLO':
            await handleProtocolQuery(from, body);
            break;
        default:
            // Estado desconhecido, reinicia o fluxo
            await sendWelcomeMessage(from);
            break;
    }
}

/**
 * Envia a mensagem de boas-vindas
 * @param {string} to Número de destino
 */
async function sendWelcomeMessage(to) {
    const welcome = `🤖 *Bem-vindo à Ouvidoria Municipal*\n\n` +
                   `Olá! Sou o assistente virtual da Ouvidoria Municipal. Como posso ajudar?\n\n` +
                   `1️⃣ - Nova Solicitação\n` +
                   `2️⃣ - Consultar Protocolo\n` +
                   `3️⃣ - Informações\n`;
    
    await sendMessage(to, welcome);
    
    // Define o estado do usuário
    setUserState(to, 'MENU_PRINCIPAL');
}

/**
 * Processa a seleção do menu principal
 * @param {string} from Número de origem
 * @param {string} body Corpo da mensagem
 */
async function handleMainMenu(from, body) {
    // Registra a opção selecionada
    registerMenuOption(from, body);
    
    switch (body) {
        case '1':
            // Nova solicitação
            await startNewRequest(from);
            break;
        case '2':
            // Consultar protocolo
            await startProtocolQuery(from);
            break;
        case '3':
            // Informações
            await sendInformation(from);
            break;
        default:
            // Opção inválida
            await sendMessage(from, '❌ Opção inválida. Por favor, escolha uma opção válida.');
            break;
    }
}

/**
 * Inicia o fluxo de nova solicitação
 * @param {string} to Número de destino
 */
async function startNewRequest(to) {
    const message = `📝 *Nova Solicitação*\n\n` +
                   `Por favor, selecione o tipo de solicitação:\n\n` +
                   `1️⃣ - Reclamação\n` +
                   `2️⃣ - Denúncia\n` +
                   `3️⃣ - Sugestão\n` +
                   `4️⃣ - Elogio\n` +
                   `5️⃣ - Informação\n` +
                   `0️⃣ - Voltar ao menu principal\n`;
    
    await sendMessage(to, message);
    
    // Define o estado do usuário
    setUserState(to, 'NOVA_SOLICITACAO', { step: 'TIPO' });
}

/**
 * Processa uma nova solicitação
 * @param {string} from Número de origem
 * @param {string} body Corpo da mensagem
 * @param {Object} userState Estado do usuário
 */
async function handleNewRequest(from, body, userState) {
    // Verifica se o usuário quer voltar ao menu principal
    if (body === '0') {
        await sendWelcomeMessage(from);
        return;
    }
    
    // Processa a mensagem de acordo com o passo atual
    switch (userState.step) {
        case 'TIPO':
            await handleRequestType(from, body);
            break;
        case 'SECRETARIA':
            await handleRequestSecretaria(from, body, userState);
            break;
        case 'DESCRICAO':
            await handleRequestDescricao(from, body, userState);
            break;
        case 'NOME':
            await handleRequestNome(from, body, userState);
            break;
        case 'TELEFONE':
            await handleRequestTelefone(from, body, userState);
            break;
        case 'EMAIL':
            await handleRequestEmail(from, body, userState);
            break;
        case 'CONFIRMACAO':
            await handleRequestConfirmacao(from, body, userState);
            break;
        default:
            // Passo desconhecido, reinicia o fluxo
            await startNewRequest(from);
            break;
    }
}

/**
 * Inicia o fluxo de consulta de protocolo
 * @param {string} to Número de destino
 */
async function startProtocolQuery(to) {
    const message = `🔍 *Consulta de Protocolo*\n\n` +
                   `Por favor, digite o número do protocolo que deseja consultar:\n\n` +
                   `0️⃣ - Voltar ao menu principal\n`;
    
    await sendMessage(to, message);
    
    // Define o estado do usuário
    setUserState(to, 'CONSULTAR_PROTOCOLO');
}

/**
 * Processa uma consulta de protocolo
 * @param {string} from Número de origem
 * @param {string} body Corpo da mensagem
 */
async function handleProtocolQuery(from, body) {
    // Verifica se o usuário quer voltar ao menu principal
    if (body === '0') {
        await sendWelcomeMessage(from);
        return;
    }
    
    // Consulta o protocolo
    const atendimento = getAtendimento(body);
    
    if (!atendimento) {
        // Protocolo não encontrado
        await sendMessage(from, '❌ Protocolo não encontrado. Por favor, verifique o número e tente novamente.');
        return;
    }
    
    // Formata a mensagem com os dados do atendimento
    const message = `🔍 *Protocolo ${atendimento.protocolNumber}*\n\n` +
                   `📌 Tipo: ${['Reclamação','Denúncia','Sugestão','Elogio','Informação'][atendimento.tipo-1]}\n` +
                   `🏛️ Secretaria: ${atendimento.secretaria}\n` +
                   `📝 Descrição: ${atendimento.descricao}\n` +
                   `⚙️ Status: ${atendimento.status}\n` +
                   `📅 Data: ${atendimento.createdAt.toLocaleDateString()}\n\n` +
                   `0️⃣ - Voltar ao menu principal\n`;
    
    await sendMessage(from, message);
}

/**
 * Envia informações sobre a ouvidoria
 * @param {string} to Número de destino
 */
async function sendInformation(to) {
    const info = `ℹ️ *Informações sobre a Ouvidoria Municipal*\n\n` +
               `A Ouvidoria Municipal é um canal de comunicação entre o cidadão e a Prefeitura Municipal.\n\n` +
               `🏢 *Endereço*\n` +
               `Prefeitura Municipal\n` +
               `Rua Principal, 123\n` +
               `Centro - CEP: 12345-678\n\n` +
               `📞 *Telefone*\n` +
               `(87) 3743-1156\n\n` +
               `📧 *E-mail*\n` +
               `ouvidoria.venturosa@gmail.com\n\n` +
               `⏱️ *Horário de Atendimento*\n` +
               `Segunda a Sexta: 08h às 14h\n\n` +
               `0️⃣ - Voltar ao menu principal\n`;
    
    await sendMessage(to, info);
    
    // Aguarda o usuário voltar ao menu principal
    setUserState(to, 'INFORMACOES');
}

/**
 * Formata o tempo de atividade
 * @param {number} seconds Tempo em segundos
 * @returns {string} Tempo formatado
 */
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

module.exports = {
    initializeMessageController,
    handleIncomingMessage
};