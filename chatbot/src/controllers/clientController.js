/**
 * Controlador do cliente WhatsApp
 * Gerencia a inicialização e eventos do cliente WhatsApp
 */

const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
let QRCode;
try {
    QRCode = require('qrcode');
} catch (e) {
    QRCode = null;
}
// Importação opcional do serviço de relatórios
let scheduleMonthlyReport;
try {
    const reportService = require('../services/reportService');
    scheduleMonthlyReport = reportService.scheduleMonthlyReport;
} catch (error) {
    console.log('⚠️ Serviço de relatórios não disponível, continuando sem agendamento');
    scheduleMonthlyReport = () => console.log('📊 Relatórios não disponíveis');
}
// Importação opcional do banco de dados
let db;
try {
    const dbConnection = require('../database/dbConnection');
    db = dbConnection.db;
} catch (error) {
    console.log('⚠️ Banco de dados não disponível, continuando sem persistência');
    db = null;
}
const path = require('path');
const fs = require('fs');

// Cliente global para ser acessado por outros módulos
let client;

/**
 * Inicializa o cliente do WhatsApp com as configurações necessárias
 * @returns {Client} Cliente WhatsApp inicializado
 */
function initializeClient() {
    // Inicializa o cliente do WhatsApp
    client = new Client({
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
            // Também salva em arquivo PNG para facilitar o scan no ambiente integrado
            if (QRCode) {
                const outDir = path.join(process.cwd(), 'assets');
                if (!fs.existsSync(outDir)) { fs.mkdirSync(outDir, { recursive: true }); }
                const outFile = path.join(outDir, 'whatsapp_qr.png');
                QRCode.toFile(outFile, qr, { width: 320 }, (err) => {
                    if (!err) {
                        console.log(`🖼️ QR salvo em: ${outFile}`);
                    }
                });
            }
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
    initializeClient,
    client
};