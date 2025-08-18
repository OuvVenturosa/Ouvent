/**
 * Controlador de mensagens
 * Gerencia o processamento de mensagens recebidas
 */

// Importação do cliente será feita dinamicamente para evitar dependência circular
const { ADMINS } = require('../config/config');
const { sendMessage, getUserState, setUserState, registerMenuOption } = require('../services/messageService');
const { createAtendimento, getAtendimento, updateAtendimento } = require('../models/atendimentoModel');
const { notificarSecretariaWhatsApp } = require('../services/messageService');
const { notificarSecretariaEmail } = require('../services/emailService');
const { registerAtendimento } = require('../services/reportService');

/**
 * Inicializa o controlador de mensagens
 * @param {Object} client - O cliente WhatsApp inicializado
 */
function initializeMessageController(client) {
    // Configura o evento de mensagem
    client.on('message', handleMessage);
    console.log('✅ Controlador de mensagens inicializado');
}

/**
 * Processa uma mensagem recebida
 * @param {Message} message Mensagem recebida
 */
async function handleMessage(message) {
    try {
        const from = message.from;
        const body = message.body;
        
        console.log(`📩 Mensagem recebida de ${from}: ${body}`);
        
        // Registra a mensagem no banco de dados para fins de log
        const { registrarInteracao } = require('../models/atendimentoModel');
        const userState = await getUserState(from);
        
        // Se houver um protocolo associado, registra a interação
        if (userState && userState.protocolNumber) {
            await registrarInteracao(userState.protocolNumber, {
                telefone: from,
                mensagem: body,
                origem: 'usuario',
                timestamp: new Date()
            });
        }
        
        // Verifica se é uma mensagem de administrador
        if (ADMINS.includes(from)) {
            await handleAdminMessage(message);
            return;
        }
        
        // Processa a mensagem do usuário
        await handleUserMessage(message);
    } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
    }
}

/**
 * Processa uma mensagem de administrador
 * @param {Message} message Mensagem recebida
 */
async function handleAdminMessage(message) {
    const from = message.from;
    const body = message.body;
    
    try {
        // Implementar lógica para comandos de administrador
        if (body.startsWith('/status')) {
            // Comando para verificar o status do sistema
            // Busca estatísticas do banco de dados
            const { query } = require('../database/dbConnection');
            
            // Total de atendimentos
            const totalAtendimentos = await query('SELECT COUNT(*) as total FROM demandas');
            
            // Atendimentos pendentes
            const atendimentosPendentes = await query("SELECT COUNT(*) as total FROM demandas WHERE status = 'pendente' OR status = 'em_analise' OR status = 'em_atendimento'");
            
            // Atendimentos concluídos
            const atendimentosConcluidos = await query("SELECT COUNT(*) as total FROM demandas WHERE status = 'concluido'");
            
            // Usuários únicos
            const usuariosUnicos = await query('SELECT COUNT(DISTINCT telefone) as total FROM demandas');
            
            const status = `🤖 *Status do Sistema*\n\n` +
                          `📊 Total de atendimentos: ${totalAtendimentos[0].total}\n` +
                          `⏳ Atendimentos pendentes: ${atendimentosPendentes[0].total}\n` +
                          `✅ Atendimentos concluídos: ${atendimentosConcluidos[0].total}\n` +
                          `👥 Usuários únicos: ${usuariosUnicos[0].total}\n` +
                          `⏱️ Uptime: ${formatUptime(process.uptime())}\n`;
            
            await sendMessage(from, status);
        } else if (body.startsWith('/relatorio')) {
            // Comando para gerar relatório
            const { query } = require('../database/dbConnection');
            
            // Busca estatísticas por secretaria
            const estatisticasSecretarias = await query(`
                SELECT 
                    secretaria_responsavel, 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) as concluidos,
                    SUM(CASE WHEN status = 'pendente' OR status = 'em_analise' OR status = 'em_atendimento' THEN 1 ELSE 0 END) as pendentes
                FROM demandas 
                GROUP BY secretaria_responsavel
            `);
            
            let relatorio = `📊 *Relatório por Secretaria*\n\n`;
            
            estatisticasSecretarias.forEach(sec => {
                relatorio += `🏛️ *${sec.secretaria_responsavel}*\n` +
                             `   Total: ${sec.total}\n` +
                             `   Concluídos: ${sec.concluidos}\n` +
                             `   Pendentes: ${sec.pendentes}\n\n`;
            });
            
            await sendMessage(from, relatorio);
        } else {
            // Mensagem de ajuda para administrador
            const help = `🤖 *Comandos de Administrador*\n\n` +
                        `/status - Verificar status do sistema\n` +
                        `/relatorio - Gerar relatório por secretaria\n`;
            
            await sendMessage(from, help);
        }
    } catch (error) {
        console.error('❌ Erro ao processar comando de administrador:', error);
        await sendMessage(from, '❌ Ocorreu um erro ao processar seu comando. Por favor, tente novamente mais tarde.');
    }
}

/**
 * Processa uma mensagem de usuário
 * @param {Message} message Mensagem recebida
 */
async function handleUserMessage(message) {
    const from = message.from;
    const body = message.body;
    
    try {
        // Obtém o estado atual do usuário do banco de dados
        const userState = await getUserState(from);
        const currentState = userState.estado || 'inicial';
        const stateData = userState.dados || {};
        
        console.log(`🔄 Estado atual do usuário ${from}: ${currentState}`);
        
        // Se o usuário tem um protocolo associado, registra a interação
        if (stateData.protocolNumber) {
            await registrarInteracao(stateData.protocolNumber, {
                telefone: from,
                mensagem: body,
                origem: 'usuario',
                timestamp: new Date().toISOString()
            });
        }
        
        // Processa a mensagem com base no estado atual
        switch (currentState) {
            case 'inicial':
                // Envia mensagem de boas-vindas
                await sendWelcomeMessage(from);
                await setUserState(from, 'menu_principal', {});
                break;
                
            case 'menu_principal':
                // Processa a seleção do menu principal
                await processarMenuPrincipal(from, body);
                break;
                
            case 'aguardando_tipo':
                // Processa a seleção do tipo de solicitação
                await processarTipoSolicitacao(from, body, stateData);
                break;
                
            case 'aguardando_secretaria':
                // Processa a seleção da secretaria
                await processarSelecaoSecretaria(from, body, stateData);
                break;
                
            case 'aguardando_descricao':
                // Processa a descrição da solicitação
                await processarDescricaoSolicitacao(from, body, stateData);
                break;
                
            case 'aguardando_confirmacao':
                // Processa a confirmação da solicitação
                await processarConfirmacaoSolicitacao(from, body, stateData);
                break;
                
            case 'aguardando_protocolo':
                // Processa a consulta de protocolo
                await processarConsultaProtocolo(from, body);
                break;
                
            default:
                // Estado desconhecido, volta para o menu principal
                await sendMessage(from, "Desculpe, não entendi. Vamos recomeçar.");
                await setUserState(from, 'menu_principal', {});
                break;
        }
        
    } catch (error) {
        console.error(`❌ Erro ao processar mensagem do usuário ${from}:`, error);
        await sendMessage(from, "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.");
    }
}

/**
 * Processa a seleção do menu principal
 * @param {string} from Número do telefone do usuário
 * @param {string} body Texto da mensagem
 */
async function processarMenuPrincipal(from, body) {
    // Implementação do processamento do menu principal
    switch (body) {
        case '1': // Nova solicitação
            await sendMessage(from, "Qual o tipo de solicitação deseja fazer?\n1 - Reclamação\n2 - Denúncia\n3 - Elogio\n4 - Sugestão\n5 - Informação");
            await setUserState(from, 'aguardando_tipo', {});
            break;
        case '2': // Consultar solicitação
            await sendMessage(from, "Por favor, informe o número do protocolo da sua solicitação:");
            await setUserState(from, 'aguardando_protocolo', {});
            break;
        case '3': // Informações
            await sendMessage(from, "📋 *Informações da Ouvidoria*\n\nHorário de funcionamento: Segunda a Sexta, 8h às 17h\nTelefone: (XX) XXXX-XXXX\nE-mail: ouvidoria@venturosa.pe.gov.br");
            await setUserState(from, 'menu_principal', {});
            break;
        default:
            await sendMessage(from, "Opção inválida. Por favor, escolha uma opção válida:\n1 - Nova solicitação\n2 - Consultar solicitação\n3 - Informações");
            break;
    }
}

/**
 * Processa a seleção do tipo de solicitação
 * @param {string} from Número do telefone do usuário
 * @param {string} body Texto da mensagem
 * @param {Object} stateData Dados do estado atual do usuário
 */
async function processarTipoSolicitacao(from, body, stateData) {
    const tiposSolicitacao = {
        '1': 'Reclamação',
        '2': 'Denúncia',
        '3': 'Elogio',
        '4': 'Sugestão',
        '5': 'Informação'
    };
    
    const tipoSelecionado = tiposSolicitacao[body];
    
    if (tipoSelecionado) {
        // Registra a opção selecionada
        await registerMenuOption(from, `Tipo: ${tipoSelecionado}`);
        
        // Atualiza o estado com o tipo selecionado
        const newStateData = { ...stateData, tipoSolicitacao: tipoSelecionado };
        
        // Solicita a secretaria responsável
        await sendMessage(from, "Por favor, digite a opção da Secretaria que deseja atendimento:\n\n" +
            "*1*: 🏞️ Sec. Desenv. Rural e Meio Ambiente\n" +
            "*2*: 👨‍👩‍👧‍👦 Sec. Assistência Social\n" +
            "*3*: 📚 Sec. Educação\n" +
            "*4*: 👷 Sec. Infraest. e Seg. Pública\n" +
            "*5*: 🆘 Sec. Saúde e Direitos da Mulher\n" +
            "*6*: 🏥 Hosp. e Matern. Justa Maria Bezerra\n" +
            "*7*: 👩🏻‍⚕️ Programa Mulher Segura\n" +
            "*8*: 📈 Sec. Finança (Setor de Tributos)\n" +
            "*9*: 🤵 Sec. Administração (Servidores Municipais)");
        
        await setUserState(from, 'aguardando_secretaria', newStateData);
    } else {
        await sendMessage(from, "Opção inválida. Por favor, escolha uma opção válida:\n" +
            "1 - Reclamação\n" +
            "2 - Denúncia\n" +
            "3 - Elogio\n" +
            "4 - Sugestão\n" +
            "5 - Informação");
    }
}

/**
 * Processa a seleção da secretaria
 * @param {string} from Número do telefone do usuário
 * @param {string} body Texto da mensagem
 * @param {Object} stateData Dados do estado atual do usuário
 */
async function processarSelecaoSecretaria(from, body, stateData) {
    const secretarias = {
        '1': 'Secretaria de Desenvolvimento Rural e Meio Ambiente',
        '2': 'Secretaria de Assistência Social',
        '3': 'Secretaria de Educação e Esporte',
        '4': 'Secretaria de Infraestrutura e Segurança Pública',
        '5': 'Secretaria de Saúde e Direitos da Mulher',
        '6': 'Hospital e Maternidade Justa Maria Bezerra',
        '7': 'Programa Mulher Segura (Coordenadora da Mulher)',
        '8': 'Secretaria de Finanças - Setor de Tributos',
        '9': 'Secretaria de Administração - Servidores Municipais'
    };
    
    const secretariaSelecionada = secretarias[body];
    
    if (secretariaSelecionada) {
        // Registra a opção selecionada
        await registerMenuOption(from, `Secretaria: ${secretariaSelecionada}`);
        
        // Atualiza o estado com id e nome da secretaria selecionada
        const newStateData = { ...stateData, secretariaId: parseInt(body, 10), secretaria: secretariaSelecionada };
        
        // Solicita a descrição da solicitação
        await sendMessage(from, `Por favor, descreva detalhadamente sua ${stateData.tipoSolicitacao.toLowerCase()} para a Secretaria de ${secretariaSelecionada}:`);
        
        await setUserState(from, 'aguardando_descricao', newStateData);
    } else {
        await sendMessage(from, "Opção inválida. Por favor, escolha uma secretaria válida:");
    }
}

/**
 * Processa a descrição da solicitação
 * @param {string} from Número do telefone do usuário
 * @param {string} body Texto da mensagem
 * @param {Object} stateData Dados do estado atual do usuário
 */
async function processarDescricaoSolicitacao(from, body, stateData) {
    // Verifica se a descrição tem pelo menos 10 caracteres
    if (body.length < 10) {
        await sendMessage(from, "Por favor, forneça uma descrição mais detalhada (mínimo de 10 caracteres).");
        return;
    }
    
    // Atualiza o estado com a descrição
    const newStateData = { ...stateData, descricao: body };
    
    // Solicita confirmação
    const mensagemConfirmacao = `📋 *Resumo da solicitação*\n\n` +
        `*Tipo:* ${stateData.tipoSolicitacao}\n` +
        `*Secretaria:* ${stateData.secretaria}\n` +
        `*Descrição:* ${body}\n\n` +
        `Confirma o envio desta solicitação?\n` +
        `1 - Sim, enviar\n` +
        `2 - Não, cancelar`;
    
    await sendMessage(from, mensagemConfirmacao);
    await setUserState(from, 'aguardando_confirmacao', newStateData);
}

/**
 * Processa a confirmação da solicitação
 * @param {string} from Número do telefone do usuário
 * @param {string} body Texto da mensagem
 * @param {Object} stateData Dados do estado atual do usuário
 */
async function processarConfirmacaoSolicitacao(from, body, stateData) {
    if (body === '1') {
        try {
            // Cria a solicitação no banco de dados
            const { createAtendimento } = require('../models/atendimentoModel');
            const protocolo = await createAtendimento({
                telefone: from,
                nome: 'Solicitante WhatsApp',
                servico: stateData.tipoSolicitacao,
                mensagem: stateData.descricao,
                secretaria: stateData.secretaria,
                status: 'Aberto'
            });
            
            // Envia mensagem de confirmação com o número do protocolo
            await sendMessage(from, `✅ Solicitação registrada com sucesso!\n\n*Protocolo:* ${protocolo}\n\nGuarde este número para consultas futuras. Você receberá atualizações sobre o andamento da sua solicitação.`);
            
            // Notifica a secretaria responsável
            await notificarSecretariaWhatsApp(stateData.secretariaId || 0, protocolo, {
                nome: 'Solicitante WhatsApp',
                telefone: from,
                email: null,
                tipoNome: stateData.tipoSolicitacao,
                descricao: stateData.descricao,
                status: 'Aberto'
            });
            
            // Limpa o estado do usuário
            await setUserState(from, 'menu_principal', { protocolNumber: protocolo });
            
            // Envia o menu principal novamente após 2 segundos
            setTimeout(async () => {
                await sendMessage(from, "O que deseja fazer agora?\n1 - Nova solicitação\n2 - Consultar solicitação");
            }, 2000);
            
        } catch (error) {
            console.error('Erro ao criar solicitação:', error);
            await sendMessage(from, "❌ Ocorreu um erro ao registrar sua solicitação. Por favor, tente novamente mais tarde.");
            await setUserState(from, 'menu_principal', {});
        }
    } else if (body === '2') {
        // Cancela a solicitação
        await sendMessage(from, "Solicitação cancelada. O que deseja fazer agora?\n1 - Nova solicitação\n2 - Consultar solicitação");
        await setUserState(from, 'menu_principal', {});
    } else {
        await sendMessage(from, "Opção inválida. Por favor, confirme sua solicitação:\n1 - Sim, enviar\n2 - Não, cancelar");
    }
}

/**
 * Processa a consulta de protocolo
 * @param {string} from Número do telefone do usuário
 * @param {string} body Texto da mensagem
 */
async function processarConsultaProtocolo(from, body) {
    try {
        // Verifica se o protocolo é válido
        const { getSolicitacaoByProtocolo } = require('../models/solicitacaoModel');
        const solicitacao = await getSolicitacaoByProtocolo(body.trim());
        
        if (solicitacao) {
            // Formata a data de criação
            const dataCriacao = new Date(solicitacao.data_criacao);
            const dataFormatada = `${dataCriacao.getDate().toString().padStart(2, '0')}/${(dataCriacao.getMonth() + 1).toString().padStart(2, '0')}/${dataCriacao.getFullYear()}`;
            
            // Envia os detalhes da solicitação
            const mensagemDetalhes = `📋 *Detalhes da Solicitação*\n\n` +
                `*Protocolo:* ${solicitacao.protocolo}\n` +
                `*Tipo:* ${solicitacao.servico}\n` +
                `*Secretaria:* ${solicitacao.secretaria_responsavel}\n` +
                `*Status:* ${solicitacao.status}\n` +
                `*Data:* ${dataFormatada}\n` +
                `*Descrição:* ${solicitacao.descricao}\n\n` +
                `O que deseja fazer agora?\n` +
                `1 - Nova solicitação\n` +
                `2 - Consultar outra solicitação`;
            
            await sendMessage(from, mensagemDetalhes);
            await setUserState(from, 'menu_principal', { protocolNumber: solicitacao.protocolo });
        } else {
            await sendMessage(from, "❌ Protocolo não encontrado. Verifique se o número está correto e tente novamente.\n\nO que deseja fazer agora?\n1 - Nova solicitação\n2 - Consultar solicitação");
            await setUserState(from, 'menu_principal', {});
        }
    } catch (error) {
        console.error('Erro ao consultar protocolo:', error);
        await sendMessage(from, "❌ Ocorreu um erro ao consultar o protocolo. Por favor, tente novamente mais tarde.\n\nO que deseja fazer agora?\n1 - Nova solicitação\n2 - Consultar solicitação");
        await setUserState(from, 'menu_principal', {});
    }
}

// As funções de exportação serão mantidas no final do arquivo

// Função antiga mantida para compatibilidade
/**
 * Envia a mensagem de boas-vindas para o usuário
 * @param {string} to Número do telefone do destinatário
 */
async function sendWelcomeMessage(to) {
    const welcome = `🤖 *Bem-vindo à Ouvidoria Municipal*\n\n` +
                   `Olá! Sou o assistente virtual da Ouvidoria Municipal. Como posso ajudar?\n\n` +
                   `1️⃣ - Nova Solicitação\n` +
                   `2️⃣ - Consultar Protocolo\n` +
                   `3️⃣ - Informações\n`;
    
    await sendMessage(to, welcome);
    
    // Define o estado do usuário
    await setUserState(to, 'menu_principal', {});
}

/**
 * Processa a seleção do menu principal
 * @param {string} from Número de origem
 * @param {string} body Corpo da mensagem
 */
async function handleMainMenu(from, body) {
    // Registra a opção selecionada
    registerMenuOption(from, body);
    
    switch (body) {
        case '1':
            // Nova solicitação
            await startNewRequest(from);
            break;
        case '2':
            // Consultar protocolo
            await startProtocolQuery(from);
            break;
        case '3':
            // Informações
            await sendInformation(from);
            break;
        default:
            // Opção inválida
            await sendMessage(from, '❌ Opção inválida. Por favor, escolha uma opção válida.');
            break;
    }
}

/**
 * Inicia o fluxo de nova solicitação
 * @param {string} to Número de destino
 */
async function startNewRequest(to) {
    const message = `📝 *Nova Solicitação*\n\n` +
                   `Por favor, selecione o tipo de solicitação:\n\n` +
                   `1️⃣ - Reclamação\n` +
                   `2️⃣ - Denúncia\n` +
                   `3️⃣ - Sugestão\n` +
                   `4️⃣ - Elogio\n` +
                   `5️⃣ - Informação\n` +
                   `0️⃣ - Voltar ao menu principal\n`;
    
    await sendMessage(to, message);
    
    // Define o estado do usuário
    setUserState(to, 'NOVA_SOLICITACAO', { step: 'TIPO' });
}

/**
 * Processa uma nova solicitação
 * @param {string} from Número de origem
 * @param {string} body Corpo da mensagem
 * @param {Object} userState Estado do usuário
 */
async function handleNewRequest(from, body, userState) {
    // Verifica se o usuário quer voltar ao menu principal
    if (body === '0') {
        await sendWelcomeMessage(from);
        return;
    }
    
    // Processa a mensagem de acordo com o passo atual
    switch (userState.step) {
        case 'TIPO':
            await handleRequestType(from, body);
            break;
        case 'SECRETARIA':
            await handleRequestSecretaria(from, body, userState);
            break;
        case 'DESCRICAO':
            await handleRequestDescricao(from, body, userState);
            break;
        case 'NOME':
            await handleRequestNome(from, body, userState);
            break;
        case 'TELEFONE':
            await handleRequestTelefone(from, body, userState);
            break;
        case 'EMAIL':
            await handleRequestEmail(from, body, userState);
            break;
        case 'CONFIRMACAO':
            await handleRequestConfirmacao(from, body, userState);
            break;
        default:
            // Passo desconhecido, reinicia o fluxo
            await startNewRequest(from);
            break;
    }
}

/**
 * Inicia o fluxo de consulta de protocolo
 * @param {string} to Número de destino
 */
async function startProtocolQuery(to) {
    const message = `🔍 *Consulta de Protocolo*\n\n` +
                   `Por favor, digite o número do protocolo que deseja consultar:\n\n` +
                   `0️⃣ - Voltar ao menu principal\n`;
    
    await sendMessage(to, message);
    
    // Define o estado do usuário
    setUserState(to, 'CONSULTAR_PROTOCOLO');
}

/**
 * Processa uma consulta de protocolo
 * @param {string} from Número de origem
 * @param {string} body Corpo da mensagem
 */
async function handleProtocolQuery(from, body) {
    // Verifica se o usuário quer voltar ao menu principal
    if (body === '0') {
        await sendWelcomeMessage(from);
        return;
    }
    
    // Consulta o protocolo
    const atendimento = getAtendimento(body);
    
    if (!atendimento) {
        // Protocolo não encontrado
        await sendMessage(from, '❌ Protocolo não encontrado. Por favor, verifique o número e tente novamente.');
        return;
    }
    
    // Formata a mensagem com os dados do atendimento
    const message = `🔍 *Protocolo ${atendimento.protocolNumber}*\n\n` +
                   `📌 Tipo: ${['Reclamação','Denúncia','Sugestão','Elogio','Informação'][atendimento.tipo-1]}\n` +
                   `🏛️ Secretaria: ${atendimento.secretaria}\n` +
                   `📝 Descrição: ${atendimento.descricao}\n` +
                   `⚙️ Status: ${atendimento.status}\n` +
                   `📅 Data: ${atendimento.createdAt.toLocaleDateString()}\n\n` +
                   `0️⃣ - Voltar ao menu principal\n`;
    
    await sendMessage(from, message);
}

/**
 * Envia informações sobre a ouvidoria
 * @param {string} to Número de destino
 */
async function sendInformation(to) {
    const info = `ℹ️ *Informações sobre a Ouvidoria Municipal*\n\n` +
               `A Ouvidoria Municipal é um canal de comunicação entre o cidadão e a Prefeitura Municipal.\n\n` +
               `🏢 *Endereço*\n` +
               `Prefeitura Municipal\n` +
               `Rua Principal, 123\n` +
               `Centro - CEP: 12345-678\n\n` +
               `📞 *Telefone*\n` +
               `(87) 3743-1156\n\n` +
               `📧 *E-mail*\n` +
               `ouvidoria.venturosa@gmail.com\n\n` +
               `⏱️ *Horário de Atendimento*\n` +
               `Segunda a Sexta: 08h às 14h\n\n` +
               `0️⃣ - Voltar ao menu principal\n`;
    
    await sendMessage(to, info);
    
    // Aguarda o usuário voltar ao menu principal
    setUserState(to, 'INFORMACOES');
}

/**
 * Formata o tempo de atividade
 * @param {number} seconds Tempo em segundos
 * @returns {string} Tempo formatado
 */
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Processa a seleção do tipo de solicitação
 * @param {string} from Número de origem
 * @param {string} body Corpo da mensagem
 */
async function handleRequestType(from, body) {
    // Verifica se a opção é válida
    const tipoOptions = ['1', '2', '3', '4', '5'];
    if (!tipoOptions.includes(body)) {
        await sendMessage(from, '❌ Opção inválida. Por favor, escolha uma opção válida.');
        return;
    }
    
    // Mapeia as opções para os tipos de solicitação
    const tipoMap = {
        '1': 'Reclamação',
        '2': 'Denúncia',
        '3': 'Sugestão',
        '4': 'Elogio',
        '5': 'Informação'
    };
    
    // Atualiza o estado do usuário com o tipo selecionado
    const userState = getUserState(from);
    userState.tipo = parseInt(body);
    userState.tipoNome = tipoMap[body];
    userState.step = 'SECRETARIA';
    setUserState(from, 'NOVA_SOLICITACAO', userState);
    
    // Envia a mensagem para seleção da secretaria
    const message = `📝 *Nova ${tipoMap[body]}*\n\n` +
                   `Por favor, selecione a secretaria responsável:\n\n` +
                   `1️⃣ - Secretaria de Desenvolvimento Rural e Meio Ambiente\n` +
                   `2️⃣ - Secretaria de Assistência Social\n` +
                   `3️⃣ - Secretaria de Educação e Esporte\n` +
                   `4️⃣ - Secretaria de Infraestrutura e Segurança Pública\n` +
                   `5️⃣ - Secretaria de Saúde e Direitos da Mulher\n` +
                   `6️⃣ - Hospital e Maternidade Justa Maria Bezerra\n` +
                   `7️⃣ - Programa Mulher Segura (Coordenadora da Mulher)\n` +
                   `8️⃣ - Secretaria de Finanças - Setor de Tributos\n` +
                   `9️⃣ - Secretaria de Administração - Servidores Municipais\n` +
                   `0️⃣ - Voltar ao menu principal\n`;
    
    await sendMessage(from, message);
}

/**
 * Processa a seleção da secretaria
 * @param {string} from Número de origem
 * @param {string} body Corpo da mensagem
 * @param {Object} userState Estado do usuário
 */
async function handleRequestSecretaria(from, body, userState) {
    // Verifica se a opção é válida
    const secretariaOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    if (!secretariaOptions.includes(body)) {
        await sendMessage(from, '❌ Opção inválida. Por favor, escolha uma opção válida.');
        return;
    }
    
    // Mapeia as opções para as secretarias
    const secretariaMap = {
        '1': 'Secretaria de Desenvolvimento Rural e Meio Ambiente',
        '2': 'Secretaria de Assistência Social',
        '3': 'Secretaria de Educação e Esporte',
        '4': 'Secretaria de Infraestrutura e Segurança Pública',
        '5': 'Secretaria de Saúde e Direitos da Mulher',
        '6': 'Hospital e Maternidade Justa Maria Bezerra',
        '7': 'Programa Mulher Segura (Coordenadora da Mulher)',
        '8': 'Secretaria de Finanças - Setor de Tributos',
        '9': 'Secretaria de Administração - Servidores Municipais'
    };
    
    // Atualiza o estado do usuário com a secretaria selecionada
    userState.secretaria = parseInt(body);
    userState.secretariaNome = secretariaMap[body];
    userState.step = 'DESCRICAO';
    setUserState(from, 'NOVA_SOLICITACAO', userState);
    
    // Envia a mensagem para inserção da descrição
    const message = `📝 *Nova ${userState.tipoNome} - ${secretariaMap[body]}*\n\n` +
                   `Por favor, descreva detalhadamente sua ${userState.tipoNome.toLowerCase()}:\n\n` +
                   `0️⃣ - Voltar ao menu principal\n`;
    
    await sendMessage(from, message);
}

// Exporta as funções diretamente para evitar dependência circular
module.exports.initializeMessageController = initializeMessageController;
module.exports.handleMessage = handleMessage;