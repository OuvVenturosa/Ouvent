/**
 * Modelo de atendimento
 * Gerencia os dados de atendimento
 */

// Armazenamento de dados
const atendimentos = {};

/**
 * Cria um novo atendimento
 * @param {Object} data Dados do atendimento
 * @returns {string} Número do protocolo
 */
function createAtendimento(data) {
    // Gera um número de protocolo único
    const protocolNumber = generateProtocolNumber();
    
    // Cria o atendimento
    atendimentos[protocolNumber] = {
        ...data,
        protocolNumber,
        createdAt: new Date(),
        status: 'Aberto'
    };
    
    console.log(`✅ Atendimento criado: ${protocolNumber}`);
    
    return protocolNumber;
}

/**
 * Atualiza um atendimento existente
 * @param {string} protocolNumber Número do protocolo
 * @param {Object} data Dados do atendimento
 * @returns {boolean} Sucesso da operação
 */
function updateAtendimento(protocolNumber, data) {
    if (!atendimentos[protocolNumber]) {
        console.error(`❌ Atendimento não encontrado: ${protocolNumber}`);
        return false;
    }
    
    // Atualiza o atendimento
    atendimentos[protocolNumber] = {
        ...atendimentos[protocolNumber],
        ...data,
        updatedAt: new Date()
    };
    
    console.log(`✅ Atendimento atualizado: ${protocolNumber}`);
    
    return true;
}

/**
 * Obtém um atendimento pelo número do protocolo
 * @param {string} protocolNumber Número do protocolo
 * @returns {Object|null} Dados do atendimento ou null se não encontrado
 */
function getAtendimento(protocolNumber) {
    return atendimentos[protocolNumber] || null;
}

/**
 * Obtém todos os atendimentos
 * @returns {Object} Todos os atendimentos
 */
function getAllAtendimentos() {
    return atendimentos;
}

/**
 * Gera um número de protocolo único
 * @returns {string} Número do protocolo
 */
function generateProtocolNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `${year}${month}${day}${random}`;
}

module.exports = {
    createAtendimento,
    updateAtendimento,
    getAtendimento,
    getAllAtendimentos,
    atendimentos
};