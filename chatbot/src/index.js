/**
 * Arquivo principal do Chatbot de WhatsApp para Ouvidoria Municipal
 * Este arquivo inicializa o cliente e carrega os módulos necessários
 */

console.log("Iniciando chatbot...");

// Importação dos módulos
const { initializeClient } = require('./controllers/clientController');
const { setupDirectories } = require('./utils/fileUtils');
const { initDatabase } = require('./database/initDatabase');
const { initializeSystem } = require('./init');

// Configuração inicial
async function iniciarSistema() {
  try {
    // Configura diretórios necessários
    setupDirectories();
    
    // Inicializa o banco de dados
    await initDatabase();
    
    // Inicializa o cliente do WhatsApp
    const client = initializeClient();
    
    // Inicializa o sistema com o cliente
    await initializeSystem(client);
    
    return client;
  } catch (error) {
    console.error("❌ Erro ao iniciar o sistema:", error);
    process.exit(1);
  }
}

// Inicializa o sistema
const client = iniciarSistema();

// Exporta o cliente para uso em outros módulos
module.exports = { client };