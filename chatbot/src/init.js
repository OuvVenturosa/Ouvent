/**
 * Arquivo de inicialização do sistema
 * Este arquivo é responsável por inicializar todos os componentes do sistema
 * sem criar dependências circulares
 */

// Cliente global para ser acessado por outros módulos
let globalClient = null;

// Exporta uma função que inicializa o sistema
module.exports.initializeSystem = async (client) => {
    // Configura o cliente global
    globalClient = client;
    
    // Importa o controlador de mensagens
    const messageController = require('./controllers/messageController');
    
    // Inicializa o controlador de mensagens
    messageController.initializeMessageController(client);
    
    console.log("✅ Sistema inicializado com sucesso!");
};

// Exporta o cliente global
module.exports.getClient = () => globalClient;