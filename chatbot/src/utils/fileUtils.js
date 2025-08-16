/**
 * Utilitários para manipulação de arquivos
 */

const fs = require('fs');
const path = require('path');

/**
 * Configura os diretórios necessários para o funcionamento do chatbot
 */
function setupDirectories() {
    // Configuração de diretórios
    const directories = [
        path.join(__dirname, '../../relatorios'), 
        path.join(__dirname, '../../relatorios_mensais'), 
        path.join(__dirname, '../../anexos'), 
        path.join(__dirname, '../../logs')
    ];
    
    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Diretório criado: ${dir}`);
        }
    });
}

/**
 * Salva um arquivo no sistema
 * @param {string} filePath Caminho do arquivo
 * @param {Buffer|string} content Conteúdo do arquivo
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function saveFile(filePath, content) {
    try {
        await fs.promises.writeFile(filePath, content);
        return true;
    } catch (error) {
        console.error(`Erro ao salvar arquivo ${filePath}:`, error);
        return false;
    }
}

/**
 * Lê um arquivo do sistema
 * @param {string} filePath Caminho do arquivo
 * @returns {Promise<Buffer|null>} Conteúdo do arquivo ou null em caso de erro
 */
async function readFile(filePath) {
    try {
        return await fs.promises.readFile(filePath);
    } catch (error) {
        console.error(`Erro ao ler arquivo ${filePath}:`, error);
        return null;
    }
}

module.exports = {
    setupDirectories,
    saveFile,
    readFile
};