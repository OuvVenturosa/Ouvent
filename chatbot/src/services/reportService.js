/**
 * Serviço de relatórios
 * Gerencia a geração e agendamento de relatórios
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Armazenamento de dados para relatórios
const atendimentosMensais = {};

/**
 * Agenda a geração de relatórios mensais
 */
function scheduleMonthlyReport() {
    console.log('📊 Agendando geração de relatório mensal...');
    
    // Calcula a data do próximo mês
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    // Calcula o tempo até o próximo mês em milissegundos
    const timeUntilNextMonth = nextMonth.getTime() - now.getTime();
    
    // Agenda a geração do relatório para o próximo mês
    setTimeout(() => {
        generateMonthlyReport();
        // Reagenda para o próximo mês
        scheduleMonthlyReport();
    }, timeUntilNextMonth);
    
    console.log(`📅 Próximo relatório agendado para: ${nextMonth.toLocaleDateString()}`);
}

/**
 * Gera um relatório mensal de atendimentos
 */
function generateMonthlyReport() {
    console.log('📊 Gerando relatório mensal...');
    
    // Obtém o mês e ano atual
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    // Nome do arquivo
    const fileName = `relatorio_${year}_${month + 1}.pdf`;
    const filePath = path.join(__dirname, '../../relatorios_mensais', fileName);
    
    // Cria o documento PDF
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    
    doc.pipe(stream);
    
    // Adiciona o título
    doc.fontSize(20).text('Relatório Mensal de Atendimentos', {
        align: 'center'
    });
    
    doc.moveDown();
    doc.fontSize(14).text(`Período: ${month + 1}/${year}`, {
        align: 'center'
    });
    
    doc.moveDown();
    
    // Adiciona os dados do relatório
    // Aqui você pode adicionar os dados específicos do seu relatório
    
    // Finaliza o documento
    doc.end();
    
    console.log(`✅ Relatório mensal gerado: ${filePath}`);
}

/**
 * Registra um atendimento para o relatório mensal
 * @param {Object} atendimento Dados do atendimento
 */
function registerAtendimento(atendimento) {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    const key = `${year}_${month + 1}`;
    
    if (!atendimentosMensais[key]) {
        atendimentosMensais[key] = [];
    }
    
    atendimentosMensais[key].push(atendimento);
    
    console.log(`✅ Atendimento registrado para relatório de ${month + 1}/${year}`);
}

module.exports = {
    scheduleMonthlyReport,
    generateMonthlyReport,
    registerAtendimento
};