/**
 * Script para iniciar o chatbot
 */

console.log('Iniciando chatbot...');

// Importa o módulo principal
const { client } = require('./src/index');
const { initializeMessageController } = require('./src/controllers/messageController');

// Inicializa o controlador de mensagens
initializeMessageController();

console.log('Chatbot iniciado com sucesso!');