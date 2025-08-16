/**
 * Arquivo principal do Chatbot de WhatsApp para Ouvidoria Municipal
 * Este arquivo inicializa o cliente e carrega os módulos necessários
 */

console.log("Iniciando chatbot...");

// Importação dos módulos
const { initializeClient } = require('./controllers/clientController');
const { setupDirectories } = require('./utils/fileUtils');

// Configuração inicial
setupDirectories();

// Inicializa o cliente do WhatsApp
const client = initializeClient();

// Exporta o cliente para uso em outros módulos
module.exports = { client };