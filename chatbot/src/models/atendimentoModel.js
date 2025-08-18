/**
 * Modelo de atendimento
 * Gerencia os dados de atendimento no banco de dados SQLite
 */

const { query, queryOne, execute } = require('../database/dbConnection');
const { generateProtocolNumber } = require('./solicitacaoModel');

/**
 * Cria um novo atendimento
 * @param {Object} data Dados do atendimento
 * @returns {Promise<string>} Número do protocolo
 */
async function createAtendimento(data) {
    try {
        // Gera um número de protocolo único
        const protocolNumber = await generateProtocolNumber();
        
        const createdAt = new Date().toISOString();
        
        // Prepara os dados para inserção
        // Mapeado para o esquema do backend (demandas: secretaria, categoria, resumo_mensagem, descricao_completa)
        const solicitacaoData = {
            protocolo: protocolNumber,
            secretaria: data.secretaria || 'Ouvidoria Geral',
            categoria: data.servico || 'Atendimento WhatsApp',
            status: 'pendente',
            prioridade: 'normal',
            usuario_id: data.telefone,
            usuario_anonimizado: data.nome || 'Solicitante WhatsApp',
            resumo_mensagem: (data.mensagem || '').substring(0, 140),
            descricao_completa: data.mensagem || ''
        };
        
        // Insere no banco de dados
        const sql = `
            INSERT INTO demandas (
                protocolo,
                secretaria,
                categoria,
                status,
                prioridade,
                usuario_id,
                usuario_anonimizado,
                data_criacao,
                data_atualizacao,
                resumo_mensagem,
                descricao_completa
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            solicitacaoData.protocolo,
            solicitacaoData.secretaria,
            solicitacaoData.categoria,
            solicitacaoData.status,
            solicitacaoData.prioridade,
            solicitacaoData.usuario_id,
            solicitacaoData.usuario_anonimizado,
            createdAt,
            createdAt,
            solicitacaoData.resumo_mensagem,
            solicitacaoData.descricao_completa
        ];
        
        await execute(sql, params);
        
        // Registra a primeira interação
        if (data.mensagem) {
            const interacaoSql = `
                INSERT INTO historico_interacoes (
                    protocolo,
                    usuario_id,
                    mensagem,
                    origem,
                    timestamp
                ) VALUES (?, ?, ?, ?, ?)
            `;
            
            await execute(interacaoSql, [
                protocolNumber,
                data.telefone,
                data.mensagem,
                'usuario',
                createdAt
            ]);
        }
        
        console.log(`✅ Atendimento criado no banco de dados: ${protocolNumber}`);
        
        return protocolNumber;
    } catch (error) {
        console.error('❌ Erro ao criar atendimento:', error);
        throw error;
    }
}

/**
 * Atualiza um atendimento existente
 * @param {string} protocolNumber Número do protocolo
 * @param {Object} data Dados do atendimento
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function updateAtendimento(protocolNumber, data) {
    try {
        // Verifica se o atendimento existe
        const atendimento = await getAtendimento(protocolNumber);
        
        if (!atendimento) {
            console.error(`❌ Atendimento não encontrado: ${protocolNumber}`);
            return false;
        }
        
        const updatedAt = new Date().toISOString();
        
        // Prepara os campos a serem atualizados
        const updateFields = [];
        const updateParams = [];
        
        if (data.status) {
            updateFields.push('status = ?');
            updateParams.push(data.status);
        }
        if (data.secretaria) {
            updateFields.push('secretaria = ?');
            updateParams.push(data.secretaria);
        }
        if (data.descricao) {
            updateFields.push('descricao_completa = ?');
            updateParams.push(data.descricao);
        }
        
        // Sempre atualiza a data de atualização
        updateFields.push('data_atualizacao = ?');
        updateParams.push(updatedAt);
        
        // Adiciona o protocolo ao final dos parâmetros
        updateParams.push(protocolNumber);
        
        // Atualiza no banco de dados
        const sql = `
            UPDATE demandas
            SET ${updateFields.join(', ')}
            WHERE protocolo = ?
        `;
        
        const result = await execute(sql, updateParams);
        
        // Registra a interação se houver mensagem
        if (data.mensagem) {
            const interacaoSql = `
                INSERT INTO historico_interacoes (
                    protocolo,
                    usuario_id,
                    mensagem,
                    origem,
                    timestamp
                ) VALUES (?, ?, ?, ?, ?)
            `;
            
            await execute(interacaoSql, [
                protocolNumber,
                data.origem === 'usuario' ? data.telefone : 'sistema',
                data.mensagem,
                data.origem || 'sistema',
                updatedAt
            ]);
        }
        
        console.log(`✅ Atendimento atualizado no banco de dados: ${protocolNumber}`);
        
        return result.changes > 0;
    } catch (error) {
        console.error(`❌ Erro ao atualizar atendimento ${protocolNumber}:`, error);
        throw error;
    }
}

/**
 * Obtém um atendimento pelo número do protocolo
 * @param {string} protocolNumber Número do protocolo
 * @returns {Promise<Object|null>} Dados do atendimento ou null se não encontrado
 */
async function getAtendimento(protocolNumber) {
    try {
        const sql = `
            SELECT * FROM demandas
            WHERE protocolo = ?
        `;
        
        const atendimento = await queryOne(sql, [protocolNumber]);
        
        if (!atendimento) {
            return null;
        }
        
        // Busca o histórico de interações
        const interacoesSql = `
            SELECT * FROM historico_interacoes
            WHERE protocolo = ?
            ORDER BY timestamp ASC
        `;
        
        const interacoes = await query(interacoesSql, [protocolNumber]);
        
        return {
            ...atendimento,
            interacoes
        };
    } catch (error) {
        console.error(`❌ Erro ao buscar atendimento ${protocolNumber}:`, error);
        throw error;
    }
}

/**
 * Obtém todos os atendimentos
 * @returns {Promise<Array>} Todos os atendimentos
 */
async function getAllAtendimentos() {
    try {
        const sql = `
            SELECT * FROM demandas
            ORDER BY data_criacao DESC
        `;
        
        const atendimentos = await query(sql);
        
        return atendimentos;
    } catch (error) {
        console.error('❌ Erro ao buscar todos os atendimentos:', error);
        throw error;
    }
}

/**
 * Obtém atendimentos por número de telefone
 * @param {string} telefone Número de telefone
 * @returns {Promise<Array>} Lista de atendimentos
 */
async function getAtendimentosByTelefone(telefone) {
    try {
        const sql = `
            SELECT * FROM demandas
            WHERE telefone = ?
            ORDER BY data_criacao DESC
        `;
        
        const atendimentos = await query(sql, [telefone]);
        
        return atendimentos;
    } catch (error) {
        console.error(`❌ Erro ao buscar atendimentos para o telefone ${telefone}:`, error);
        throw error;
    }
}

/**
 * Registra uma nova interação no atendimento
 * @param {string} protocolNumber Número do protocolo
 * @param {Object} data Dados da interação
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function registrarInteracao(protocolNumber, data) {
    try {
        const timestamp = new Date().toISOString();
        
        const sql = `
            INSERT INTO historico_interacoes (
                protocolo,
                usuario_id,
                mensagem,
                origem,
                timestamp,
                tipo_midia,
                caminho_arquivo
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            protocolNumber,
            data.usuario_id || data.telefone || 'sistema',
            data.mensagem,
            data.origem || 'sistema',
            timestamp,
            data.tipo_midia || null,
            data.caminho_arquivo || null
        ];
        
        const result = await execute(sql, params);
        
        console.log(`✅ Interação registrada para o atendimento ${protocolNumber}`);
        
        return result.lastID > 0;
    } catch (error) {
        console.error(`❌ Erro ao registrar interação para o atendimento ${protocolNumber}:`, error);
        throw error;
    }
}

module.exports = {
    createAtendimento,
    updateAtendimento,
    getAtendimento,
    getAllAtendimentos,
    getAtendimentosByTelefone,
    registrarInteracao
};