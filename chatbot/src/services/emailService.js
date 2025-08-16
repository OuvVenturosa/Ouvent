/**
 * Serviço de email
 * Gerencia o envio de emails para as secretarias
 */

const nodemailer = require('nodemailer');
const { EMAIL_CONFIG } = require('../config/config');

// Cria o transportador de email
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

/**
 * Envia um email
 * @param {string} to Destinatário
 * @param {string} subject Assunto
 * @param {string} html Conteúdo HTML
 * @param {Array} attachments Anexos (opcional)
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function sendEmail(to, subject, html, attachments = []) {
    try {
        const mailOptions = {
            from: EMAIL_CONFIG.auth.user,
            to,
            subject,
            html,
            attachments
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email enviado para: ${to}`);
        return true;
    } catch (error) {
        console.error(`❌ Erro ao enviar email para ${to}:`, error);
        return false;
    }
}

/**
 * Envia uma notificação por email para uma secretaria
 * @param {number} secretariaId ID da secretaria
 * @param {string} protocolNumber Número do protocolo
 * @param {Object} atendimento Dados do atendimento
 * @param {Array} anexos Anexos (opcional)
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function notificarSecretariaEmail(secretariaId, protocolNumber, atendimento, anexos = []) {
    const { SECRETARIAS_EMAILS } = require('../config/config');
    
    const emailSecretaria = SECRETARIAS_EMAILS[secretariaId];
    
    if (!emailSecretaria) {
        console.error(`❌ Email da secretaria ${secretariaId} não encontrado`);
        return false;
    }
    
    const subject = `Nova Solicitação - Protocolo ${protocolNumber}`;
    
    const html = `
        <h2>Nova Solicitação - Protocolo ${protocolNumber}</h2>
        <p><strong>Secretaria:</strong> ${Object.keys(SECRETARIAS_EMAILS).find(key => SECRETARIAS_EMAILS[key] === SECRETARIAS_EMAILS[atendimento.secretaria])}</p>
        <p><strong>Solicitante:</strong> ${atendimento.anonimo ? 'Anônimo' : atendimento.nome}</p>
        <p><strong>Contato:</strong> ${atendimento.telefone || 'Não informado'}</p>
        <p><strong>E-mail:</strong> ${atendimento.email || 'Não informado'}</p>
        <p><strong>Tipo:</strong> ${['Reclamação','Denúncia','Sugestão','Elogio','Informação'][atendimento.tipo-1]}</p>
        <h3>Descrição</h3>
        <p>${atendimento.descricao || "Não informado"}</p>
        <p><strong>Serviço Selecionado:</strong> ${atendimento.servicoSelecionado || "Não informado"}</p>
        <p><strong>Detalhes do Serviço:</strong></p>
        <p>${atendimento.detalhesServico || "Não informado"}</p>
        <p><strong>Status:</strong> ${atendimento.status || "Não informado"}</p>
        <p><strong>Confidencialidade:</strong> ${atendimento.confidencialidade || "Não informado"}</p>
        <p><strong>Anexos:</strong> ${atendimento.anexos && atendimento.anexos.length > 0 ? atendimento.anexos.map(a => a.nomeOriginal).join(", ") : "Nenhum anexo"}</p>
        <p><strong>Atenção:</strong> Por favor, dê andamento em até 5 dias úteis</p>
    `;
    
    return await sendEmail(emailSecretaria, subject, html, anexos);
}

module.exports = {
    sendEmail,
    notificarSecretariaEmail
};