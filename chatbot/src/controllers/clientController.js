/**
 * Controlador do cliente WhatsApp
 * Gerencia a inicialização e eventos do cliente WhatsApp
 */

const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { scheduleMonthlyReport } = require('../services/reportService');

/**
 * Inicializa o cliente do WhatsApp com as configurações necessárias
 * @returns {Client} Cliente WhatsApp inicializado
 */
function initializeClient() {
    // Inicializa o cliente do WhatsApp
    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-features=TranslateUI',
                '--disable-ipc-flooding-protection'
            ]
        }
    });

    // Configuração de eventos
    setupClientEvents(client);

    // Inicializa o cliente
    client.initialize();

    return client;
}

/**
 * Configura os eventos do cliente WhatsApp
 * @param {Client} client Cliente WhatsApp
 */
function setupClientEvents(client) {
    client.on("qr", (qr) => {
        console.log('🔐 QR Code recebido, gerando...');
        try {
            qrcode.generate(qr, { small: true });
            console.log('✅ QR Code gerado com sucesso!');
            console.log('📱 Escaneie o QR Code acima com seu WhatsApp');
        } catch (error) {
            console.error('❌ Erro ao gerar QR Code:', error);
        }
    });

    client.on("authenticated", () => {
        console.log("✅ Cliente autenticado com sucesso!");
    });

    client.on("auth_failure", (msg) => {
        console.error("❌ Falha na autenticação:", msg);
    });

    client.on("disconnected", (reason) => {
        console.log("🔌 Cliente desconectado:", reason);
    });

    client.on("loading_screen", (percent, message) => {
        console.log(`📊 Carregando: ${percent}% - ${message}`);
    });

    client.on("ready", () => {
        console.log("🚀 Cliente WhatsApp pronto!");
        console.log("📱 Sessão ativa para:", client.info.wid._serialized);
        scheduleMonthlyReport();
    });
}

module.exports = {
    initializeClient
};