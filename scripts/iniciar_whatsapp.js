// =============================================
// INICIADOR DO WHATSAPP WEB
// =============================================

console.log('🚀 Iniciando cliente WhatsApp...');

// Importa o chat.js que contém toda a lógica do chatbot
const chatBot = require('../chat.js');

// O chat.js já possui sua própria inicialização do cliente WhatsApp
// e toda a lógica de processamento de mensagens
console.log('✅ Chatbot carregado com sucesso!');
console.log('📱 Aguardando conexão com WhatsApp...');

// Tratamento de erros global
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Erro não tratado:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Exceção não capturada:', error);
});

console.log('🎯 Sistema pronto! O chatbot está ativo.'); 