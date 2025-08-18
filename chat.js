console.log("Iniciando chatbot...");

// =============================================
// IMPORTAÇÃO DE BIBLIOTECAS
// =============================================
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');
const { exec } = require('child_process');
const mime = require('mime-types');
const nodemailer = require('nodemailer');
const https = require('https');
const http = require('http');

// =============================================
// IMPORTAÇÃO DO BANCO DE DADOS
// =============================================
// Importação do banco de dados movida para linha 35

// =============================================
// IMPORTAÇÃO DO BANCO DE DADOS
// =============================================
const {
  salvarConversa,
  salvarMensagem,
  salvarOpcaoMenu,
  salvarAnexo,
  finalizarConversa,
  buscarConversaPorProtocolo,
  salvarRespostaResponsavel,
  salvarConsultaProtocolo,
  salvarAlteracaoStatus,
  salvarInteracaoAdicional,
  gerarRelatorioConversa
} = require('./database');

// =============================================
// CONFIGURAÇÃO INICIAL
// =============================================

// Configuração de diretórios
const directories = ['./relatorios', './relatorios_mensais', './anexos', './assets'];
directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// =============================================
// EVENTOS DO CLIENTE
// =============================================

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
});

// =============================================
// VARIÁVEIS GLOBAIS
// =============================================

// Objetos para armazenamento de dados
const conversationHistory = {};
const userStates = {};
const userTimers = {};
const atendimentos = {};
const atendimentosMensais = {};
const menuOptionsHistory = {};

// =============================================
// CONSTANTES E CONFIGURAÇÕES
// =============================================

// Lista de administradores (substitua pelos números reais com @c.us)
const ADMINS = ['558788290579@c.us', '558700000000@c.us'];

// Constantes
const SECRETARIAS_EMAILS = {
    1: "aaa2306@gmail.com",
    2: "aaa2306@gmail.com",
    3: "educacao.esporte@venturosa.pe.gov.br",
    4: "infraestrutura.seguranca@venturosa.pe.gov.br",
    5: "saude.mulher@venturosa.pe.gov.br",
    6: "hospital@venturosa.pe.gov.br",
    7: "mulhersegura@venturosa.pe.gov.br",
    8: "tributos@venturosa.pe.gov.br",
    9: "Administração@venturosa.pe.gov.br"
};

// Adicionar esta nova constante para WhatsApp das secretárias
const SECRETARIAS_WHATSAPP = {
        1: "558781825296@c.us", // Secretaria de Desenvolvimento Rural e Meio Ambiente
        2: "558701117150@c.us", // Secretaria de Assistência Social
        3: "558708414768@c.us", // Secretaria de Educação e Esporte
        4: "558708414768@c.us", // Secretaria de Infraestrutura e Segurança Pública
        5: "558708414768@c.us", // Secretaria de Saúde e Direitos da Mulher
        6: "558708414768@c.us", // Hospital e Maternidade Justa Maria Bezerra
        7: "558708414768@c.us", // Programa Mulher Segura
        8: "558708414768@c.us", // Secretaria de Finanças - Setor de Tributos
        9: "558708414768@c.us"  // Secretaria de Administração - Servidores Municipais
    
};

const transporter = nodemailer.createTransport({
    host: 'SMTP.gmail.com', // Servidor real
    port: 465,
    secure: true,
    auth: {
        user: 'ouvidoria.venturosa@gmail.com',
        pass: 'kbng efuw gfwr uywd'
    },
    tls: {
        rejectUnauthorized: false 
    }
});

// Confirmação de que o cliente está pronto
client.on("ready", () => {
    console.log("🚀 Cliente WhatsApp pronto!");
    console.log("📱 Sessão ativa para:", client.info.wid._serialized);
    scheduleMonthlyReport();
});

async function notificarSecretariaWhatsApp(secretariaNumero, protocolNumber, atendimento) {
    try {
        // Verifica se o número está registrado no WhatsApp
        const isRegistered = await client.isRegisteredUser(secretariaNumero);
        if (!isRegistered) {
            console.error('Número não registrado no WhatsApp:', secretariaNumero);
            return false;
        }

        const chat = await client.getChatById(secretariaNumero);
        
        // Adiciona delay para evitar flood
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Formata a mensagem com emojis e estrutura clara
        const mensagem = `📢 *NOVA SOLICITAÇÃO - Protocolo ${protocolNumber}*\n\n` +
                        `🏛️ *Secretaria:* ${Object.keys(SECRETARIAS_EMAILS).find(key => SECRETARIAS_EMAILS[key] === SECRETARIAS_EMAILS[atendimento.secretaria])}\n` +
                        `👤 *Solicitante:* ${atendimento.anonimo ? 'Anônimo' : atendimento.nome}\n` +
                        `📞 *Contato:* ${atendimento.telefone || 'Não informado'}\n` +
                        `📧 *E-mail:* ${atendimento.email || 'Não informado'}\n` +
                        `📌 *Tipo:* ${['Reclamação','Denúncia','Sugestão','Elogio','Informação'][atendimento.tipo-1]}\n\n` +
                        `📝 *DESCRIÇÃO*\n` +
                        `${atendimento.descricao || "Não informado"}\n` +
                        `🔧 *Serviço Selecionado:* ${atendimento.servicoSelecionado || "Não informado"}\n` +
                        `🔍 *Detalhes do Serviço:*\n` +
                        `${atendimento.detalhesServico || "Não informado"}\n` +
                        `⚙️ *Status:* ${atendimento.status || "Não informado"}\n` +
                        `🔒 *Confidencialidade:* ${atendimento.confidencialidade || "Não informado"}\n` +
                        `📎 *Anexos:* ${atendimento.anexos && atendimento.anexos.length > 0 ? atendimento.anexos.map(a => a.nomeOriginal).join(", ") : "Nenhum anexo"}\n\n` +
                        `⚠️ *Atenção:* Por favor, dê andamento em até 5 dias úteis`;
        // Envia a mensagem para a secretaria
        await chat.sendMessage(mensagem);
        // Envia a mensagem de acusar recebimento
        const msgAcuse = `Deseja acusar recebimento da solicitação?\n1 - Sim\n2 - Não`;
        await chat.sendMessage(msgAcuse);
        // Marca o estado aguardando resposta de acuse de recebimento
        if (!userStates[secretariaNumero]) userStates[secretariaNumero] = {};
        userStates[secretariaNumero].aguardandoAcuseRecebimento = true;
        userStates[secretariaNumero].protocoloAcuse = protocolNumber;
        console.log(`Mensagem de acuse enviada para: ${secretariaNumero}`);
        return true;
    } catch (error) {
        console.error(`Falha ao notificar ${secretariaNumero}:`, error);
        return false;
    }
}

// =============================================
// FUNÇÕES REGISTRO DE OPÇÃO
// =============================================  

// Função para registrar as opções selecionadas
async function registrarOpcao(senderId, menu, opcao, titulo, protocolo = null) {
  // Salvar na memória local (mantém compatibilidade)
  if (!menuOptionsHistory[senderId]) {
    menuOptionsHistory[senderId] = [];
  }
  
  const opcaoData = {
    menu,
    opcao,
    titulo,
    timestamp: new Date().toISOString()
  };
  
  menuOptionsHistory[senderId].push(opcaoData);
  
  // Salvar no banco de dados se houver protocolo
  if (protocolo) {
    try {
      const conversa = await buscarConversaPorProtocolo(protocolo);
      if (conversa) {
        await salvarOpcaoMenu({
          conversa_id: conversa.id,
          protocolo: protocolo,
          sender_id: senderId,
          menu: menu,
          opcao: opcao,
          titulo: titulo,
          timestamp: opcaoData.timestamp
        });
      }
    } catch (error) {
      console.error('❌ Erro ao salvar opção de menu no banco:', error);
    }
  }
}

// Função para agendar o relatório mensal
function scheduleMonthlyReport() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const targetDate = new Date(
    lastDay.getFullYear(),
    lastDay.getMonth(),
    lastDay.getDate(),
    23, 30, 0
  );

  const timeUntilReport = targetDate.getTime() - now.getTime();

  if (timeUntilReport > 0) {
    setTimeout(async () => {
      const mes = now.getMonth() + 1;
      const ano = now.getFullYear();
      await gerarRelatorioMensal(mes, ano);
      
      // Reagenda para o próximo mês
      scheduleMonthlyReport();
    }, timeUntilReport);
  }
}

// =============================================
// FUNÇÕES UTILITÁRIAS
// =============================================

function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
}

// Função generateProtocolNumber movida para linha 566

async function registrarInteracao(senderId, mensagem, origem, protocolo = null) {
    // Salvar na memória local (mantém compatibilidade)
    if (!conversationHistory[senderId]) {
        conversationHistory[senderId] = {
            messages: [],
            timestamps: [],
            origem: []
        };
    }
    conversationHistory[senderId].messages.push(mensagem);
    conversationHistory[senderId].timestamps.push(new Date().toISOString());
    conversationHistory[senderId].origem.push(origem);

    // Salvar no banco de dados se houver protocolo
    if (protocolo) {
        try {
            // Buscar conversa existente
            const conversa = await buscarConversaPorProtocolo(protocolo);
            if (conversa) {
                // Salvar mensagem no banco
                await salvarMensagem({
                    conversa_id: conversa.id,
                    protocolo: protocolo,
                    sender_id: senderId,
                    mensagem: mensagem,
                    origem: origem,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('❌ Erro ao salvar interação no banco:', error);
        }
    }
}


function resetInactivityTimer(senderId) {
    if (userTimers[senderId]) {
        clearTimeout(userTimers[senderId]);
    }

    userTimers[senderId] = setTimeout(async () => {
        const protocolNumber = generateProtocolNumber();
        const chat = await client.getChatById(senderId);
        await chat.sendMessage(`⏰ *Atendimento encerrado por inatividade*\n\nSeu protocolo é: *${protocolNumber}*\n\nCaso precise de mais informações, entre em contato novamente.`);

        delete userStates[senderId];
        delete userTimers[senderId];
    }, 300000); // 5 minutos
}

// FUNÇÃO NOTIFICAÇÃO DE EMAIL

async function enviarEmailNotificacao(destinatario, assunto, corpo, anexo = null) {
    try {
        const mailOptions = {
            from: 'ouvidoria.venturosa@gmail.com',
            to: destinatario,
            subject: assunto,
            html: corpo,
            attachments: anexo ? [{
                filename: anexo.filename,
                path: anexo.path
            }] : []
        };

        await transporter.sendMail(mailOptions);
        console.log(`E-mail enviado para ${destinatario}`);
        return true;
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        return false;
    }
}

async function notificarFalhaNoEnvio(senderId, protocolNumber) {
    try {
        const chat = await client.getChatById(senderId);
        await chat.sendMessage(
            `⚠️ *Problema no envio do protocolo*\n\n` +
            `Seu protocolo ${protocolNumber} foi gerado, mas houve um problema ao enviar para a secretaria.\n\n` +
            `Por favor, entre em contato diretamente com o setor responsável.`
        );
        
        // Notificar administradores sobre a falha
        await notificarAdmins(
            `Falha no envio do protocolo ${protocolNumber}\n` +
            `Usuário: ${atendimentos[senderId]?.nome || 'Não informado'}\n` +
            `Secretaria: ${SECRETARIAS_EMAILS[atendimentos[senderId]?.secretaria] || 'Não informada'}`
        );
    } catch (error) {
        console.error('Erro ao notificar falha no envio:', error);
    }
}

// =============================================
// FUNÇÕES PARA MANIPULAÇÃO DE ARQUIVOS E MIDIA
// =============================================

async function handleMediaMessage(msg, senderId) {
    const chat = await msg.getChat();
    
    try {
        const media = await msg.downloadMedia();
        
        // Determina o tipo de mídia e extensão
        let mediaType, fileExtension;
        switch(msg.type) {
            case 'image':
                mediaType = "foto";
                fileExtension = mime.extension(media.mimetype) || '.jpg';
                break;
            case 'video':
                mediaType = "vídeo";
                fileExtension = mime.extension(media.mimetype) || '.mp4';
                break;
            case 'document':
                mediaType = "documento";
                const fileName = msg.body || 'documento';
                fileExtension = fileName.includes('.') ? 
                    fileName.substring(fileName.lastIndexOf('.')) : 
                    (mime.extension(media.mimetype) || '.pdf');
                break;
            default:
                mediaType = "arquivo";
                fileExtension = mime.extension(media.mimetype) || '.bin';
        }
        
        // Cria nome de arquivo único
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `anexo_${senderId.replace('@c.us', '')}_${timestamp}${fileExtension}`;
        const filePath = path.join(__dirname, 'anexos', fileName);
        
        // Salva o arquivo
        fs.writeFileSync(filePath, media.data, 'base64');
        
        // Registra no atendimento
        if (atendimentos[senderId]) {
            if (!atendimentos[senderId].anexos) {
                atendimentos[senderId].anexos = [];
            }
            
            const anexoData = {
                tipo: mediaType,
                caminho: filePath,
                nomeOriginal: msg.body || fileName,
                data: new Date().toISOString(),
                mimeType: media.mimetype
            };
            
            atendimentos[senderId].anexos.push(anexoData);
            
            // Salvar anexo no banco de dados se houver protocolo
            if (atendimentos[senderId].protocolo) {
                try {
                    const conversa = await buscarConversaPorProtocolo(atendimentos[senderId].protocolo);
                    if (conversa) {
                        await salvarAnexo({
                            conversa_id: conversa.id,
                            protocolo: atendimentos[senderId].protocolo,
                            sender_id: senderId,
                            tipo: mediaType,
                            caminho: filePath,
                            nome_original: msg.body || fileName,
                            mime_type: media.mimetype,
                            data_envio: anexoData.data
                        });
                    }
                } catch (error) {
                    console.error('❌ Erro ao salvar anexo no banco:', error);
                }
            }
            
            await chat.sendMessage(`✅ ${mediaType.toUpperCase()} recebida com sucesso e anexada ao seu atendimento!\nDigite '77' para voltar ao menu anterior ou 'cancelar' para cancelar a operação.`);
            
            // Se estiver esperando por uma descrição, solicita novamente
            if (userStates[senderId]?.aguardandoDescricao) {
                await chat.sendMessage("Por favor, continue com sua descrição ou digite *00* para finalizar.");
            }
        } else {
            await chat.sendMessage(`✅ ${mediaType.toUpperCase()} recebida, mas não há um atendimento em andamento. Por favor, inicie um novo atendimento com "menu".`);
        }
        
    } catch (error) {
        console.error('Erro ao processar mídia:', error);
        await chat.sendMessage("❌ Ocorreu um erro ao processar seu arquivo. Por favor, tente novamente ou descreva o problema em texto.");
    }
}

// Função para fazer requisições HTTP
function makeHttpRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.port === 443 ? https : http;
    
    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (error) {
          resolve({ body: body });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Erro na requisição HTTP:', error);
      reject(error);
    });
    
    // Adiciona timeout se especificado
    if (options.timeout) {
      req.setTimeout(options.timeout, () => {
        req.destroy();
        reject(new Error('Timeout na requisição HTTP'));
      });
    }
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Função para verificar se o backend está disponível
async function verificarBackendDisponivel() {
  try {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET',
      timeout: 2000
    };
    
    await makeHttpRequest(options);
    return true;
  } catch (error) {
    console.log('⚠️ Backend não disponível:', error.message);
    return false;
  }
}

// Função para gerar protocolo via API centralizada
async function generateProtocolNumber() {
  try {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/protocolos/gerar',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 3000 // Timeout reduzido para 3 segundos
    };
    
    const response = await makeHttpRequest(options);
    return response.protocolo;
  } catch (error) {
    console.error('Erro ao gerar protocolo via API:', error);
    console.log('⚠️ Usando geração local de protocolo...');
    // Fallback para geração local
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `OUV${month}${day}${year}/${randomNum}`;
  }
}

// Função para salvar demanda no banco de dados
async function salvarDemandaNoBanco(protocolo, atendimento) {
  try {
    // Verifica se o atendimento é válido
    if (!atendimento) {
      console.error('Atendimento inválido para salvar no banco');
      return null;
    }

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/demandas/salvar-chatbot',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 3000 // Timeout reduzido para 3 segundos
    };
    
    const data = {
      protocolo: String(protocolo),
      secretaria: atendimento.secretaria || 1,
      categoria: atendimento.servicoSelecionado || 'Geral',
      status: 'pendente',
      prioridade: 'normal',
      usuario_anonimizado: atendimento.anonimo ? 'Anônimo' : atendimento.nome || 'Anônimo',
      data_criacao: new Date().toISOString(),
      resumo_mensagem: atendimento.descricao || 'Demanda via WhatsApp',
      descricao_completa: atendimento.descricao || '',
      sender_id: atendimento.senderId
    };
    
    const response = await makeHttpRequest(options, data);
    console.log('Demanda salva no banco:', response);
    return response;
  } catch (error) {
    console.error('Erro ao salvar demanda no banco:', error);
    return null;
  }
}
// Função para formatar a resposta do protocolo
async function formatarRespostaProtocolo(atendimento, protocolNumber) {
  const secretariaMap = {
    1: "Secretaria de Desenvolvimento Rural e Meio Ambiente",
    2: "Secretaria de Assistência Social",
    3: "Secretaria de Educação e Esporte",
    4: "Secretaria de Infraestrutura e Segurança Pública",
    5: "Secretaria de Saúde e Direitos da Mulher",
    6: "Hospital e Maternidade Justa Maria Bezerra",
    7: "Programa Mulher Segura",
    8: "Secretaria de Finanças - Setor de Tributos",
    9: "Secretaria de Administração - Servidores Municipais"
  };

  const tipoMap = {
    1: "Reclamação",
    2: "Denúncia",
    3: "Sugestão",
    4: "Elogio",
    5: "Solicitação de Informação/Serviço"
  };

  const statusMap = {
    'aberto': '🟡 Em análise',
    'em_andamento': '🟠 Em andamento',
    'resolvido': '🟢 Resolvido',
    'cancelado': '🔴 Cancelado'
  };

  const secretaria = secretariaMap[atendimento.secretaria] || "Não informada";
  const tipo = tipoMap[atendimento.tipo] || "Não informado";
  const status = statusMap[atendimento.status] || "🟡 Em análise";
  
  let resposta = `*🔍 CONSULTA DE PROTOCOLO*\n\n`;
  resposta += `📋 *Protocolo:* ${atendimento.protocolo}\n`;
  resposta += `📅 *Data do Registro:* ${new Date(atendimento.data).toLocaleString()}\n`;
  resposta += `📌 *Status:* ${status}\n`;
  resposta += `👤 *Solicitante:* ${atendimento.anonimo ? 'Anônimo' : atendimento.nome}\n`;
  
  if (atendimento.telefone) {
    resposta += `📞 *Contato:* ${atendimento.telefone}\n`;
  }
  
  if (atendimento.email) {
    resposta += `📧 *E-mail:* ${atendimento.email}\n`;
  }
  
  resposta += `\n🏛️ *Secretaria Responsável:* ${secretaria}\n`;
  resposta += `📌 *Tipo de Atendimento:* ${tipo}\n`;
  
  if (atendimento.descricao) {
    resposta += `\n📝 *Descrição:*\n${atendimento.descricao}\n`;
  }
  
  if (atendimento.dataOcorrido) {
    resposta += `\n🕒 *Data/Hora do Ocorrido:* ${atendimento.dataOcorrido}\n`;
  }
  
  if (atendimento.localOcorrido) {
    resposta += `📍 *Local do Ocorrido:* ${atendimento.localOcorrido}\n`;
  }
  
  if (atendimento.servicoSelecionado) {
    resposta += `\n🛠️ *Serviço Selecionado:* ${atendimento.servicoSelecionado}\n`;
  }
  
  if (atendimento.servicoDetalhado) {
    resposta += `📄 *Detalhes do Serviço:* ${atendimento.servicoDetalhado}\n`;
  }
  
  if (atendimento.resposta) {
    resposta += `\n💬 *Resposta da Secretaria:*\n${atendimento.resposta}\n`;
    resposta += `📅 *Data da Resposta:* ${new Date(atendimento.dataResposta).toLocaleString()}\n`;
  }
  
  return resposta;
}

// =============================================
// FUNÇÕES DE GERENCIAMENTO DE ATENDIMENTOS
// =============================================

// Função para buscar atendimento por protocolo (melhorada)
function buscarAtendimentoPorProtocolo(protocolNumber) {
  // Verifica em atendimentos ativos
  for (const senderId in atendimentos) {
    if (atendimentos[senderId].protocolo === protocolNumber) {
      return {
        ...atendimentos[senderId],
        senderId: senderId
      };
    }
  }
  
  // Verifica em atendimentos mensais (histórico)
  for (const mesAno in atendimentosMensais) {
    const atendimento = atendimentosMensais[mesAno].atendimentos.find(
      a => a.protocolo === protocolNumber
    );
    
    if (atendimento) {
      return atendimento;
    }
  }
  
  // Verifica em arquivos de relatórios (se aplicável)
  const relatoriosDir = path.join(__dirname, 'relatorios');
  if (fs.existsSync(relatoriosDir)) {
    const arquivos = fs.readdirSync(relatoriosDir);
    const arquivoRelatorio = arquivos.find(arq => arq.includes(protocolNumber.replace(/\//g, '_')));
    
    if (arquivoRelatorio) {
      // Extrair informações básicas do nome do arquivo
      const partes = arquivoRelatorio.split('_');
      return {
        protocolo: protocolNumber,
        nome: "Informação disponível no relatório",
        data: partes[1] ? new Date(partes[1]) : new Date(),
        status: 'arquivado',
        arquivo: path.join(relatoriosDir, arquivoRelatorio)
      };
    }
  }
  
  return null;
}

// Função para adicionar atualização a um protocolo
function adicionarAtualizacaoProtocolo(protocolNumber, responsavel, descricao, anexo = null) {
  // Tenta encontrar em atendimentos ativos
  for (const senderId in atendimentos) {
    if (atendimentos[senderId].protocolo === protocolNumber) {
      if (!atendimentos[senderId].atualizacoes) {
        atendimentos[senderId].atualizacoes = [];
      }
      
      atendimentos[senderId].atualizacoes.push({
        data: new Date().toISOString(),
        responsavel,
        descricao,
        anexo
      });
      
      return true;
    }
  }
  
  // Tenta encontrar em atendimentos mensais
  for (const mesAno in atendimentosMensais) {
    const atendimento = atendimentosMensais[mesAno].atendimentos.find(
      a => a.protocolo === protocolNumber
    );
    
    if (atendimento) {
      if (!atendimento.atualizacoes) {
        atendimento.atualizacoes = [];
      }
      
      atendimento.atualizacoes.push({
        data: new Date().toISOString(),
        responsavel,
        descricao,
        anexo
      });
      
      return true;
    }
  }
  
  return false;
}

// =============================================
// FUNÇÕES DE COMUNICAÇÃO
// =============================================

// Função para verificar se um usuário é admin
function isAdmin(senderId) {
  return ADMINS.includes(senderId);
}

// Função para notificar administradores
async function notificarAdmins(mensagem) {
  for (const admin of ADMINS) {
    try {
      const chat = await client.getChatById(admin);
      await chat.sendMessage(`🔔 *Notificação:*\n\n${mensagem}`);
    } catch (error) {
      console.error(`Erro ao notificar admin ${admin}:`, error);
    }
  }
}

// Função para registrar uma resposta oficial a um protocolo
async function registrarRespostaProtocolo(protocolNumber, resposta, responsavel, anexo = null) {
  try {
    const atendimento = buscarAtendimentoPorProtocolo(protocolNumber);
    
    if (!atendimento) {
      throw new Error('Protocolo não encontrado');
    }
    
    // Atualiza o atendimento com a resposta
    atendimento.resposta = resposta;
    atendimento.dataResposta = new Date().toISOString();
    atendimento.responsavelResposta = responsavel;
    atendimento.status = 'resolvido';
    
    // Buscar conversa no banco de dados
    const conversa = await buscarConversaPorProtocolo(protocolNumber);
    if (conversa) {
      // Salvar resposta no banco de dados
      const respostaData = {
        conversa_id: conversa.id,
        protocolo: protocolNumber,
        responsavel_id: responsavel,
        responsavel_nome: responsavel,
        responsavel_tipo: 'secretaria', // Pode ser 'secretaria' ou 'ouvidor'
        secretaria: atendimento.secretaria,
        resposta: resposta,
        anexo_caminho: anexo,
        anexo_nome: anexo ? path.basename(anexo) : null,
        anexo_mime: anexo ? mime.lookup(anexo) : null,
        data_resposta: new Date().toISOString(),
        status_anterior: atendimento.status,
        status_novo: 'resolvido',
        observacoes: 'Resposta oficial registrada via WhatsApp'
      };
      
      await salvarRespostaResponsavel(respostaData);
      console.log('✅ Resposta salva no banco de dados:', protocolNumber);
      
      // Salvar alteração de status no banco
      const statusData = {
        protocolo: protocolNumber,
        status_anterior: atendimento.status,
        status_novo: 'resolvido',
        responsavel_id: responsavel,
        responsavel_nome: responsavel,
        responsavel_tipo: 'secretaria',
        data_alteracao: new Date().toISOString(),
        motivo: 'Resposta oficial registrada',
        observacoes: `Resposta: ${resposta}`
      };
      
      await salvarAlteracaoStatus(statusData);
      console.log('✅ Alteração de status salva no banco:', protocolNumber);
    }
    
    // Registra a atualização no histórico
    adicionarAtualizacaoProtocolo(
      protocolNumber,
      responsavel,
      "Resposta oficial registrada",
      anexo
    );
    
    // Se o atendimento estiver ativo, notifica o solicitante
    if (atendimento.senderId) {
      const chat = await client.getChatById(atendimento.senderId);
      const mensagem = `📢 *Atualização no Protocolo ${protocolNumber}*\n\n` +
                       `Sua solicitação recebeu uma resposta:\n\n` +
                       `${resposta}\n\n` +
                       `Responsável: ${responsavel}\n` +
                       `Data: ${new Date().toLocaleString()}\n\n` +
                       `Digite *99* para consultar seu protocolo novamente.`;
      
      await chat.sendMessage(mensagem);
      
      if (anexo) {
        const media = MessageMedia.fromFilePath(anexo);
        await chat.sendMessage(media, {
          caption: `Anexo da resposta - Protocolo ${protocolNumber}`
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao registrar resposta:', error);
    return false;
  }
}

// Função para adicionar comentário ao protocolo
async function adicionarComentarioProtocolo(protocolNumber, senderId, comentario, notifyName) {
  const atendimento = buscarAtendimentoPorProtocolo(protocolNumber);
  
  if (!atendimento) {
    return false;
  }
  
  // Verifica se o remetente é o solicitante original ou um admin
  if (atendimento.senderId !== senderId && !isAdmin(senderId)) {
    return false;
  }
  
  const responsavel = isAdmin(senderId) ? 'Administrador' : notifyName;
  
  // Salvar interação adicional no banco de dados
  try {
    const interacaoData = {
      protocolo: protocolNumber,
      sender_id: senderId,
      nome_usuario: notifyName,
      tipo_interacao: 'comentario',
      mensagem: comentario,
      anexo_caminho: null,
      anexo_nome: null,
      anexo_mime: null,
      data_interacao: new Date().toISOString(),
      origem: isAdmin(senderId) ? 'admin' : 'usuario'
    };
    
    await salvarInteracaoAdicional(interacaoData);
    console.log('✅ Comentário salvo no banco de dados:', protocolNumber);
  } catch (error) {
    console.error('❌ Erro ao salvar comentário no banco:', error);
  }
  
  adicionarAtualizacaoProtocolo(
    protocolNumber,
    responsavel,
    `Comentário adicionado: ${comentario}`
  );
  
  // Notifica o outro lado
  if (isAdmin(senderId)) {
    // Admin comentando - notifica usuário
    const chat = await client.getChatById(atendimento.senderId);
    await chat.sendMessage(`📝 *Novo comentário no protocolo ${protocolNumber}*\n\n${comentario}`);
  } else {
    // Usuário comentando - notifica admins
    notificarAdmins(`Novo comentário no protocolo ${protocolNumber} por ${notifyName}:\n\n${comentario}`);

    // NOVO: Notificar secretaria por email e WhatsApp
    const secretariaEmail = SECRETARIAS_EMAILS[atendimento.secretaria];
    const secretariaWhatsapp = SECRETARIAS_WHATSAPP[atendimento.secretaria];
    const assunto = `[Ouvidoria] Novo comentário do solicitante no protocolo ${protocolNumber}`;
    const corpo = `
      <h1>Novo comentário do solicitante</h1>
      <p><strong>Protocolo:</strong> ${protocolNumber}</p>
      <p><strong>Solicitante:</strong> ${atendimento.anonimo ? 'Anônimo' : atendimento.nome}</p>
      <p><strong>Mensagem:</strong> ${comentario}</p>
      <hr>
      <p>Por favor, acesse o sistema para responder.</p>
    `;
    if (secretariaEmail) {
      await enviarEmailNotificacao(secretariaEmail, assunto, corpo);
    }
    if (secretariaWhatsapp) {
      await notificarSecretariaWhatsApp(secretariaWhatsapp, protocolNumber, {
        ...atendimento,
        descricao: `Novo comentário do solicitante: ${comentario}`
      });
    }
  }

  return true;
}

// Função melhorada para consulta de protocolo
async function consultarProtocolo(protocolNumber, senderId = null) {
  const atendimento = buscarAtendimentoPorProtocolo(protocolNumber);
  
  // Salvar consulta no banco de dados
  try {
    const consultaData = {
      protocolo: protocolNumber,
      sender_id: senderId,
      nome_usuario: senderId ? (atendimento?.nome || 'Usuário') : 'Consulta Externa',
      tipo_consulta: 'whatsapp',
      mensagem_consulta: `Consulta de protocolo ${protocolNumber}`,
      resposta_sistema: atendimento ? 'Protocolo encontrado' : 'Protocolo não encontrado',
      data_consulta: new Date().toISOString(),
      ip_origem: null,
      user_agent: 'WhatsApp Bot'
    };
    
    await salvarConsultaProtocolo(consultaData);
    console.log('✅ Consulta de protocolo salva no banco:', protocolNumber);
  } catch (error) {
    console.error('❌ Erro ao salvar consulta no banco:', error);
  }
  
  if (!atendimento) {
    return {
      success: false,
      message: `Protocolo ${protocolNumber} não encontrado. Verifique o número e tente novamente.`
    };
  }
  
  // Formata a resposta
  let resposta = await formatarRespostaProtocolo(atendimento, protocolNumber);
  
  // Adiciona histórico de atualizações
  if (atendimento.atualizacoes && atendimento.atualizacoes.length > 0) {
    resposta += "\n\n🔄 *Histórico de Atualizações:*";
    atendimento.atualizacoes.forEach((atualizacao, index) => {
      resposta += `\n${index + 1}. [${new Date(atualizacao.data).toLocaleString()}] ${atualizacao.responsavel}: ${atualizacao.descricao}`;
      if (atualizacao.anexo) {
        resposta += ` (Anexo disponível)`;
      }
    });
  }
  
  // Adiciona opções de ação para o solicitante original
  if (senderId && atendimento.senderId === senderId) {
    if (atendimento.status === 'aberto' || atendimento.status === 'em_andamento') {
      resposta += `\n\n🔹 Digite *R#${protocolNumber}#sua_mensagem* para adicionar informações ao protocolo.`;
    }
    
    resposta += `\n🔹 Digite *AVALIAR#${protocolNumber}* para avaliar este atendimento.`;
  }
  
  // Adiciona opções para administradores
  if (senderId && isAdmin(senderId)) {
    resposta += `\n\n👨‍💼 *Opções administrativas:*\n` +
                `🔹 Responder: *RESP#${protocolNumber}#sua_resposta*\n` +
                `🔹 Alterar status: *STATUS#${protocolNumber}#novo_status*\n` +
                `🔹 Encaminhar: *ENC#${protocolNumber}#setor_destino*`;
  }
  
  return {
    success: true,
    message: resposta,
    protocolo: atendimento
  };
}

// Função para registrar atendimento mensal
function registrarAtendimentoMensal(atendimento) {
  const now = new Date();
  const mes = now.getMonth() + 1;
  const ano = now.getFullYear();
  const chave = `${mes}_${ano}`;
  
  if (!atendimentosMensais[chave]) {
    atendimentosMensais[chave] = {
      total: 0,
      porTipo: {
        reclamacoes: 0,
        denuncias: 0,
        sugestoes: 0,
        elogios: 0,
        informacoes: 0
      },
      porSecretaria: {
        rural: 0,
        social: 0,
        educacao: 0,
        infra: 0,
        saude: 0,
        hospital: 0,
        mulher: 0
      },
      atendimentos: []
    };
  }
  
  // Incrementa contadores
  atendimentosMensais[chave].total++;
  
  // Contabiliza por tipo
  switch(atendimento.tipo) {
    case 1: atendimentosMensais[chave].porTipo.reclamacoes++; break;
    case 2: atendimentosMensais[chave].porTipo.denuncias++; break;
    case 3: atendimentosMensais[chave].porTipo.sugestoes++; break;
    case 4: atendimentosMensais[chave].porTipo.elogios++; break;
    case 5: atendimentosMensais[chave].porTipo.informacoes++; break;
  }
  
  // Contabiliza por secretaria
  switch(atendimento.secretaria) {
    case 1: atendimentosMensais[chave].porSecretaria.rural++; break;
    case 2: atendimentosMensais[chave].porSecretaria.social++; break;
    case 3: atendimentosMensais[chave].porSecretaria.educacao++; break;
    case 4: atendimentosMensais[chave].porSecretaria.infra++; break;
    case 5: atendimentosMensais[chave].porSecretaria.saude++; break;
    case 6: atendimentosMensais[chave].porSecretaria.hospital++; break;
    case 7: atendimentosMensais[chave].porSecretaria.mulher++; break;
    case 8: atendimentosMensais[chave].porSecretaria.tributos++; break;
    case 9: atendimentosMensais[chave].porSecretaria.admin++; break;
  }
  
  // Armazena o atendimento completo
  atendimentosMensais[chave].atendimentos.push(atendimento);
}

// =============================================
// FUNÇÕES DE RELATÓRIO MENSAL
// =============================================

// Função utilitária para registrar meses já processados
function registrarRelatorioEnviado(mes, ano) {
    const registroPath = path.join(__dirname, 'relatorios_mensais', 'relatorios_enviados.json');
    let enviados = {};
    if (fs.existsSync(registroPath)) {
        try {
            enviados = JSON.parse(fs.readFileSync(registroPath, 'utf8'));
        } catch (e) {
            enviados = {};
        }
    }
    enviados[`${mes}_${ano}`] = true;
    fs.writeFileSync(registroPath, JSON.stringify(enviados, null, 2));
}

function relatorioJaEnviado(mes, ano) {
    const registroPath = path.join(__dirname, 'relatorios_mensais', 'relatorios_enviados.json');
    if (!fs.existsSync(registroPath)) return false;
    try {
        const enviados = JSON.parse(fs.readFileSync(registroPath, 'utf8'));
        return !!enviados[`${mes}_${ano}`];
    } catch (e) {
        return false;
    }
}
// Função para gerar relatório mensal
async function gerarRelatorioMensal(mes, ano) {
  try {
    // NOVO: Verifica se já foi enviado
    if (relatorioJaEnviado(mes, ano)) {
      console.log(`Relatório mensal de ${mes}/${ano} já foi gerado e enviado.`);
      return null;
    }
    const chave = `${mes}_${ano}`;
    const dados = atendimentosMensais[chave] || {
      total: 0,
      porTipo: {
        reclamacoes: 0,
        denuncias: 0,
        sugestoes: 0,
        elogios: 0,
        informacoes: 0
      },
      porSecretaria: {
        rural: 0,
        social: 0,
        educacao: 0,
        infra: 0,
        saude: 0,
        hospital: 0,
        mulher: 0,
        tributosl: 0,
        admin: 0
      },
      atendimentos: []
    };

    // Cria o documento PDF
    const doc = new PDFDocument();
    const fileName = `Relatorio_Mensal_${mes}_${ano}.pdf`;
    const filePath = path.join(__dirname, 'relatorios_mensais', fileName);
    
    // Pipe para salvar o arquivo
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Adicionar logo
    const logoPath = path.join(__dirname, 'assets', 'logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, {
        fit: [150, 150],
        align: 'center',
        valign: 'top'
      });
      doc.moveDown();
    }

    // Cabeçalho do relatório
    doc.fontSize(18).text('RELATÓRIO MENSAL DE ATENDIMENTO - OUVIDORIA MUNICIPAL DE VENTUROSA', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Período: ${mes}/${ano}`, { align: 'center' });
    doc.moveDown(2);

    // Seção de estatísticas gerais
    doc.fontSize(14).text('1. ESTATÍSTICAS GERAIS', { underline: true });
    doc.moveDown();

    // Total de atendimentos
    doc.fontSize(12).text(`Total de Atendimentos: ${dados.total}`, { bold: true });
    doc.moveDown();

    // Contagem de atendimentos por tipo
    doc.fontSize(12).text('1.1. Distribuição por Tipo de Atendimento:', { underline: true });
    doc.moveDown(0.5);
    
    doc.text(`• Reclamações: ${dados.porTipo.reclamacoes} atendimentos (${(dados.total > 0 ? (dados.porTipo.reclamacoes/dados.total*100).toFixed(1) : 0)}%)`);
    doc.text(`• Denúncias: ${dados.porTipo.denuncias} atendimentos (${(dados.total > 0 ? (dados.porTipo.denuncias/dados.total*100).toFixed(1) : 0)}%)`);
    doc.text(`• Sugestões: ${dados.porTipo.sugestoes} atendimentos (${(dados.total > 0 ? (dados.porTipo.sugestoes/dados.total*100).toFixed(1) : 0)}%)`);
    doc.text(`• Elogios: ${dados.porTipo.elogios} atendimentos (${(dados.total > 0 ? (dados.porTipo.elogios/dados.total*100).toFixed(1) : 0)}%)`);
    doc.text(`• Solicitações de Informação/Serviço: ${dados.porTipo.informacoes} atendimentos (${(dados.total > 0 ? (dados.porTipo.informacoes/dados.total*100).toFixed(1) : 0)}%)`);
    doc.moveDown();

    // Contagem por secretaria
    doc.fontSize(12).text('1.2. Distribuição por Secretaria:', { underline: true });
    doc.moveDown(0.5);
    
    doc.text(`• Sec. Desenv. Rural e Meio Ambiente: ${dados.porSecretaria.rural} atendimentos (${(dados.total > 0 ? (dados.porSecretaria.rural/dados.total*100).toFixed(1) : 0)}%)`);
    doc.text(`• Sec. Assistência Social: ${dados.porSecretaria.social} atendimentos (${(dados.total > 0 ? (dados.porSecretaria.social/dados.total*100).toFixed(1) : 0)}%)`);
    doc.text(`• Sec. Educação e Esporte: ${dados.porSecretaria.educacao} atendimentos (${(dados.total > 0 ? (dados.porSecretaria.educacao/dados.total*100).toFixed(1) : 0)}%)`);
    doc.text(`• Sec. Infraest. e Seg. Pública: ${dados.porSecretaria.infra} atendimentos (${(dados.total > 0 ? (dados.porSecretaria.infra/dados.total*100).toFixed(1) : 0)}%)`);
    doc.text(`• Sec. Saúde e Direitos da Mulher: ${dados.porSecretaria.saude} atendimentos (${(dados.total > 0 ? (dados.porSecretaria.saude/dados.total*100).toFixed(1) : 0)}%)`);
    doc.text(`• Hospital e Maternidade: ${dados.porSecretaria.hospital} atendimentos (${(dados.total > 0 ? (dados.porSecretaria.hospital/dados.total*100).toFixed(1) : 0)}%)`);
    doc.text(`• Programa Mulher Segura: ${dados.porSecretaria.mulher} atendimentos (${(dados.total > 0 ? (dados.porSecretaria.mulher/dados.total*100).toFixed(1) : 0)}%)`);
    doc.text(`• Sec. Finanças - Tributos: ${dados.porSecretaria.tributos} atendimentos (${(dados.total > 0 ? (dados.porSecretaria.tributos/dados.total*100).toFixed(1) : 0)}%)`);
    doc.text(`• Sec. Administração: ${dados.porSecretaria.admin} atendimentos (${(dados.total > 0 ? (dados.porSecretaria.admin/dados.total*100).toFixed(1) : 0)}%)`);
    doc.moveDown(2);

    // Seção de análise qualitativa
    doc.fontSize(14).text('2. ANÁLISE QUALITATIVA', { underline: true });
    doc.moveDown();

    // Principais demandas
    doc.fontSize(12).text('2.1. Principais Demandas:', { underline: true });
    doc.moveDown(0.5);
    
    // Análise das principais demandas (simplificada)
    const tiposOrdenados = Object.entries(dados.porTipo).sort((a, b) => b[1] - a[1]);
    const tipoMaisFrequente = tiposOrdenados[0][0];
    
    let analiseDemandas = "";
    switch(tipoMaisFrequente) {
      case "reclamacoes":
        analiseDemandas = "As reclamações foram o tipo de atendimento mais frequente no período, indicando possíveis áreas que necessitam de melhorias nos serviços municipais.";
        break;
      case "denuncias":
        analiseDemandas = "As denúncias foram o tipo de atendimento mais frequente, sugerindo a necessidade de maior fiscalização em determinadas áreas.";
        break;
      case "sugestoes":
        analiseDemandas = "As sugestões foram o tipo de atendimento mais frequente, demonstrando o engajamento da população em contribuir para melhorias.";
        break;
      case "elogios":
        analiseDemandas = "Os elogios foram o tipo de atendimento mais frequente, indicando satisfação com os serviços municipais prestados.";
        break;
      case "informacoes":
        analiseDemandas = "As solicitações de informação/serviço foram o tipo de atendimento mais frequente, mostrando a necessidade de melhor divulgação dos serviços disponíveis.";
        break;
    }
    
    doc.text(analiseDemandas);
    doc.moveDown();

    // Secretaria com mais atendimentos
    const secretariasOrdenadas = Object.entries(dados.porSecretaria).sort((a, b) => b[1] - a[1]);
    const secretariaMaisFrequente = secretariasOrdenadas[0][0];
    
    let nomeSecretaria = "";
    switch(secretariaMaisFrequente) {
      case "rural": nomeSecretaria = "Secretaria de Desenvolvimento Rural e Meio Ambiente"; break;
      case "social": nomeSecretaria = "Secretaria de Assistência Social"; break;
      case "educacao": nomeSecretaria = "Secretaria de Educação e Esporte"; break;
      case "infra": nomeSecretaria = "Secretaria de Infraestrutura e Segurança Pública"; break;
      case "saude": nomeSecretaria = "Secretaria de Saúde e Direitos da Mulher"; break;
      case "hospital": nomeSecretaria = "Hospital e Maternidade Justa Maria Bezerra"; break;
      case "mulher": nomeSecretaria = "Programa Mulher Segura"; break;
      case "tributos": nomeSecretaria = "Sec. de Finanças - Setor de Tributos"; break;
      case "admin": nomeSecretaria = "Sec. de Administração - Servidores Municipais"; break;
    }
    
    doc.text(`A secretaria com maior volume de atendimentos foi a ${nomeSecretaria}, com ${secretariasOrdenadas[0][1]} solicitações (${(dados.total > 0 ? (secretariasOrdenadas[0][1]/dados.total*100).toFixed(1) : 0)}% do total).`);
    doc.moveDown();

    // Temas recorrentes (análise simplificada)
    doc.fontSize(12).text('2.2. Temas Recorrentes:', { underline: true });
    doc.moveDown(0.5);
    
    // Extrai palavras-chave das descrições (simplificado)
    const temas = {};
    dados.atendimentos.forEach(atendimento => {
      if (atendimento.descricao) {
        const palavras = atendimento.descricao.toLowerCase().split(/\s+/);
        palavras.forEach(palavra => {
          if (palavra.length > 3 && !["para", "com", "como", "mais", "sobre", "este", "esta"].includes(palavra)) {
            temas[palavra] = (temas[palavra] || 0) + 1;
          }
        });
      }
    });
    
    const temasOrdenados = Object.entries(temas).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    if (temasOrdenados.length > 0) {
      doc.text("Os principais temas identificados nas solicitações foram:");
      temasOrdenados.forEach(([tema, count]) => {
        doc.text(`- "${tema}" (${count} ocorrências)`);
      });
    } else {
      doc.text("Não foi possível identificar temas recorrentes nas descrições dos atendimentos.");
    }
    doc.moveDown();

    // Casos relevantes (exemplo)
    doc.fontSize(12).text('2.3. Casos Relevantes:', { underline: true });
    doc.moveDown(0.5);
    
    if (dados.atendimentos.length > 0) {
      // Pega os 3 atendimentos mais recentes como exemplo
      const casosRelevantes = dados.atendimentos.slice(-3);
      
      casosRelevantes.forEach((caso, index) => {
        const tipoMap = {
          1: "Reclamação",
          2: "Denúncia",
          3: "Sugestão",
          4: "Elogio",
          5: "Informação/Serviço"
        };
        
        const secretariaMap = {
          1: "Sec. Rural e Meio Ambiente",
          2: "Sec. Assistência Social",
          3: "Sec. Educação e Esporte",
          4: "Sec. Infraest. e Seg. Pública",
          5: "Sec. Saúde e Mulher",
          6: "Hospital",
          7: "Mulher Segura",
          8: "Tributos",
          9: "Sec. Administração"
        };
        
        doc.text(`Caso ${index + 1}:`);
        doc.text(`• Tipo: ${tipoMap[caso.tipo]}`);
        doc.text(`• Secretaria: ${secretariaMap[caso.secretaria]}`);
        doc.text(`• Data: ${new Date(caso.data).toLocaleDateString()}`);
        if (caso.descricao) {
          doc.text(`• Descrição: ${caso.descricao.substring(0, 100)}...`);
        }
        doc.moveDown(0.5);
      });
    } else {
      doc.text("Nenhum caso relevante registrado neste período.");
    }
    doc.moveDown(2);

    // Seção de encaminhamentos
    doc.fontSize(14).text('3. ENCAMINHAMENTOS E RESPOSTAS', { underline: true });
    doc.moveDown();
    
    // Estatísticas fictícias de encaminhamento
    const respondidos = Math.floor(dados.total * 0.8); // 80% respondidos (exemplo)
    const pendentes = dados.total - respondidos;
    
    doc.text(`• Total de demandas encaminhadas: ${dados.total}`);
    doc.text(`• Demandas respondidas: ${respondidos} (${(dados.total > 0 ? (respondidos/dados.total*100).toFixed(1) : 0)}%)`);
    doc.text(`• Demandas pendentes: ${pendentes} (${(dados.total > 0 ? (pendentes/dados.total*100).toFixed(1) : 0)}%)`);
    doc.text(`• Tempo médio de resposta: 3 dias úteis`);
    doc.moveDown(2);

    // Seção de conclusões e recomendações
    doc.fontSize(14).text('4. CONCLUSÕES E RECOMENDAÇÕES', { underline: true });
    doc.moveDown();
    
    doc.text('Com base nos dados coletados, podemos concluir que:');
    doc.moveDown(0.5);
    
    if (dados.total > 50) {
      doc.text('• O volume de atendimentos foi significativo, demonstrando a importância do canal de comunicação com a população.');
    } else if (dados.total > 20) {
      doc.text('• O volume de atendimentos foi moderado, com espaço para maior divulgação do serviço.');
    } else {
      doc.text('• O volume de atendimentos foi baixo, sugerindo a necessidade de maior divulgação do serviço.');
    }
    
    if (secretariasOrdenadas[0][1] > (dados.total * 0.4)) {
      doc.text(`• A ${nomeSecretaria} concentrou a maioria das demandas, indicando possível necessidade de reforço nesta área.`);
    }
    
    if (tiposOrdenados[0][1] > (dados.total * 0.5)) {
      const tipoNome = tiposOrdenados[0][0];
      switch(tipoNome) {
        case "reclamacoes":
          doc.text('• O alto número de reclamações sugere a necessidade de melhorias em serviços específicos.');
          break;
        case "denuncias":
          doc.text('• O alto número de denúncias indica a necessidade de maior fiscalização em determinadas áreas.');
          break;
      }
    }
    
    doc.moveDown();
    doc.text('Recomendações:');
    doc.text('• Analisar os casos pendentes para priorização');
    doc.text('• Verificar possíveis melhorias nos serviços mais demandados');
    doc.text('• Divulgar os canais de atendimento para ampliar o alcance');
    doc.moveDown();

    // Rodapé
    doc.text('_________________________________________');
    doc.moveDown(0.5);
    doc.text('Assinatura do Responsável');
    doc.text('Ouvidoria Municipal de Venturosa');
    doc.text(`Data de emissão: ${new Date().toLocaleDateString()}`);

    // Finaliza o documento
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      doc.end();
    });

    console.log(`Relatório mensal gerado com sucesso: ${filePath}`);
    
    // Aqui você pode adicionar o envio automático por e-mail para os responsáveis
    // Exemplo: enviarEmailRelatorioMensal(filePath, mes, ano);
    
    // Após gerar e enviar o relatório:
    registrarRelatorioEnviado(mes, ano);
    
    return filePath;
  } catch (error) {
    console.error('Erro ao gerar relatório mensal:', error);
    return null;
  }
}

// =============================================
// FUNÇÕES DE RELATÓRIOS
// =============================================

// Função para gerar relatório individual em PDF
async function gerarPDFRelatorio(senderId, protocolNumber) {
    try {
        const atendimento = atendimentos[senderId];
        if (!atendimento) {
            console.error('Atendimento não encontrado para:', senderId);
            return null;
        }

        // Mapeamentos
        const secretariaMap = {
            1: "Secretaria de Desenvolvimento Rural e Meio Ambiente",
            2: "Secretaria de Assistência Social",
            3: "Secretaria de Educação e Esporte",
            4: "Secretaria de Infraestrutura e Segurança Pública",
            5: "Secretaria de Saúde e Direitos da Mulher",
            6: "Hospital e Maternidade Justa Maria Bezerra",
            7: "Programa Mulher Segura",
            8: "Secretaria de Finanças - Setor de Tributos",
            9: "Secretaria de Administração - Servidores Munipais"
        };

        const tipoMap = {
            1: "Reclamação",
            2: "Denúncia",
            3: "Sugestão",
            4: "Elogio",
            5: "Solicitação de Informação/Serviço"
        };

        const secretaria = secretariaMap[atendimento.secretaria] || "Não informada";
        const tipo = tipoMap[atendimento.tipo] || "Não informado";

        // Criar documento PDF
        const doc = new PDFDocument();
        
        // Garante que protocolNumber seja uma string
        const protocolString = String(protocolNumber);
        const fileName = `Relatorio_${protocolString.replace(/\//g, '_')}.pdf`;
        const filePath = path.join(__dirname, 'relatorios', fileName);

        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Adicionar logo no cabeçalho
        const logoPath = path.join(__dirname, 'assets', 'logo.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, {
                fit: [150, 150],
                align: 'center',
                valign: 'top'
            });
            doc.moveDown();
        }

        // Cabeçalho
        doc.fontSize(16).text('RELATÓRIO DE ATENDIMENTO\nOUVIDORIA MUNICIPAL DE VENTUROSA', { align: 'center' });
        doc.moveDown();
        
        // Informações básicas
        doc.fontSize(12).text(`Data: ${new Date().toLocaleString()}`);
        doc.text(`Protocolo: ${protocolString}`);
        doc.moveDown();
        
        doc.text(`Solicitante: ${atendimento.anonimo ? 'Anônimo' : atendimento.nome}`);
        doc.text(`Contato: ${senderId.replace('@c.us', '')}`);
        doc.moveDown();
        
        doc.text(`Secretaria: ${secretaria}`);
        doc.text(`Tipo: ${tipo}`);
        doc.moveDown();
        
        // Descrição
        doc.font('Helvetica-Bold').text('Descrição:');
        doc.font('Helvetica').text(atendimento.descricao || "Não informada");
        doc.moveDown();
        
        // Detalhes adicionais para reclamações/denúncias
        if (atendimento.tipo === 1 || atendimento.tipo === 2) {
            doc.text(`Data/Hora do Ocorrido: ${atendimento.dataOcorrido || "Não informada"}`);
            doc.text(`Local do Ocorrido: ${atendimento.localOcorrido || "Não informado"}`);
            doc.moveDown();
        }
        
        // Detalhes para serviços
        if (atendimento.tipo === 5) {
            if (atendimento.servicoSelecionado) {
                doc.text(`Serviço Selecionado: ${atendimento.servicoSelecionado}`);
            }
            if (atendimento.servicoDetalhado) {
                doc.text(`Detalhes do Serviço: ${atendimento.servicoDetalhado}`);
            }
            if (atendimento.detalhesAdicionais) {
                doc.text(`Informações Adicionais: ${atendimento.detalhesAdicionais}`);
            }
            doc.moveDown();
        }
        
        // Seção de anexos se existirem
        if (atendimento.anexos && atendimento.anexos.length > 0) {
            doc.addPage();
            doc.fontSize(14).text('ANEXOS DO ATENDIMENTO', { underline: true });
            doc.moveDown();
            
            atendimento.anexos.forEach((anexo, index) => {
                doc.text(`${index + 1}. ${anexo.tipo.toUpperCase()} - ${new Date(anexo.data).toLocaleString()}`);
                doc.text(`Nome: ${anexo.nomeOriginal}`);
                doc.text(`Tipo: ${anexo.mimeType}`);
                doc.moveDown();
            });
        }
        
        // Histórico da conversa
        doc.addPage();
        doc.font('Helvetica-Bold').fontSize(14).text('HISTÓRICO COMPLETO DA CONVERSA', { underline: true });
        doc.moveDown();
        
        if (conversationHistory[senderId]) {
            doc.font('Helvetica-Bold').text('Fluxo do Atendimento:');
            doc.moveDown(0.5);
            
            if (menuOptionsHistory[senderId] && menuOptionsHistory[senderId].length > 0) {
                menuOptionsHistory[senderId].forEach((opcao, index) => {
                    doc.text(`${index + 1}. [${opcao.timestamp}] Menu: ${opcao.menu} - Opção ${opcao.opcao}: ${opcao.titulo}`);
                });
            } else {
                doc.text('Nenhum registro de fluxo disponível.');
            }
            
            doc.moveDown(2);
            
            doc.font('Helvetica-Bold').text('Registro Completo das Mensagens:');
            doc.moveDown(0.5);
            
            conversationHistory[senderId].messages.forEach((msg, index) => {
                const timestamp = conversationHistory[senderId].timestamps[index];
                const origem = conversationHistory[senderId].origem[index] === 'usuário' ? 'Usuário' : 'Atendente';
                
                doc.font('Helvetica-Bold').text(`[${new Date(timestamp).toLocaleString()}] ${origem}:`);
                doc.font('Helvetica').text(msg);
                doc.moveDown(0.5);
            });
        } else {
            doc.text('Nenhum histórico de conversa disponível.');
        }
        
        doc.moveDown();
        
        // Rodapé
        doc.text('_________________________________________');
        doc.moveDown(0.5);
        doc.text('Assinatura do Responsável');
        doc.text('Ouvidoria Municipal de Venturosa');
        doc.text(`Data de emissão: ${new Date().toLocaleDateString()}`);

        // Finalizar documento
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
            doc.end();
        });

        return { fileName, filePath };
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        return null;
    }
}

// Função para gerar relatório em texto
async function gerarRelatorioAtendimento(senderId, protocolNumber) {
  const atendimento = atendimentos[senderId];
  if (!atendimento) return null;

  const secretariaMap = {
    1: "Secretaria de Desenvolvimento Rural e Meio Ambiente",
    2: "Secretaria de Assistência Social",
    3: "Secretaria de Educação e Esporte",
    4: "Secretaria de Infraestrutura e Segurança Pública",
    5: "Secretaria de Saúde e Direitos da Mulher",
    6: "Hospital e Maternidade Justa Maria Bezerra",
    7: "Programa Mulher Segura",
    8: "Secretaria de Finanças - Setor de Tributos",
    9: "Secretaria de Administração - Servidores Municipais"
  };

  const tipoMap = {
    1: "Reclamação",
    2: "Denúncia",
    3: "Sugestão",
    4: "Elogio",
    5: "Solicitação de Informação/Serviço"
  };

  const secretaria = secretariaMap[atendimento.secretaria] || "Não informada";
  const tipo = tipoMap[atendimento.tipo] || "Não informado";

  // Adiciona o histórico da conversa ao relatório
  let historicoConversa = "\n\n📜 *Histórico da Conversa*:\n";
  if (conversationHistory[senderId]) {
    conversationHistory[senderId].messages.forEach((msg, index) => {
      historicoConversa += `[${conversationHistory[senderId].timestamps[index]}] ${msg}\n`;
    });
  }

  let relatorio = `*RELATÓRIO DE ATENDIMENTO - OUVIDORIA MUNICIPAL*  
📅 Data: ${new Date().toLocaleString()}  
📋 Protocolo: ${protocolNumber}  

👤 *Solicitante:* ${atendimento.anonimo ? 'Anônimo' : atendimento.nome}  
📞 *Contato:* ${senderId.replace('@c.us', '')}  

🏛️ *Secretaria:* ${secretaria}  
📌 *Tipo:* ${tipo}  

📝 *Descrição:*  
${atendimento.descricao || "Não informada"}

🔧 *Serviço Selecionado:* ${atendimento.servicoSelecionado || "Não informado"}

🔍 *Detalhes do Serviço:*  
${atendimento.servicoDetalhado || "Não informado"}

🔧 *Detalhes Adicionais:*
${atendimento.detalhesAdicionais || "Não informado"}


🕒 *Data/Hora do Ocorrido:* ${atendimento.dataOcorrido || "Não informada"}  
📍 *Local do Ocorrido:* ${atendimento.localOcorrido || "Não informado"}

📎 *Anexos:*
${atendimento.anexos && atendimento.anexos.length > 0 ? atendimento.anexos.join(", ") : "Nenhum anexo"}
🔄 *Histórico de Atualizações:*
${atendimento.historicoAtualizacoes && atendimento.historicoAtualizacoes.length > 0 ? atendimento.historicoAtualizacoes.join("\n") : "Nenhum registro de atualização"}

📌 *Status:* Registrado  
⏳ *Prazo para resposta:* 5 dias úteis  

${historicoConversa}

Agradecemos seu contato. Sua solicitação será encaminhada para análise e tratamento.`;

  return relatorio;
}
// =============================================
// FUNÇÕES DE RELATÓRIOS
// =============================================

async function enviarRelatorios(senderId, protocolNumber) {
    try {
        // Verifica se o atendimento existe
        if (!atendimentos[senderId]) {
            console.error('Atendimento não encontrado para:', senderId);
            return false;
        }

        // Garante que o protocolo seja armazenado no atendimento
        if (!atendimentos[senderId].protocolo) {
            atendimentos[senderId].protocolo = protocolNumber;
            atendimentos[senderId].status = 'aberto';
            atendimentos[senderId].dataRegistro = new Date().toISOString();
        }

        // Criar conversa no banco de dados
        try {
            const conversaData = {
                protocolo: protocolNumber,
                sender_id: senderId,
                nome_usuario: atendimentos[senderId].nome || 'Usuário',
                secretaria: atendimentos[senderId].secretaria || 1,
                tipo_atendimento: atendimentos[senderId].tipo || 5,
                anonimo: atendimentos[senderId].anonimo || false,
                data_inicio: atendimentos[senderId].dataRegistro || new Date().toISOString(),
                descricao: atendimentos[senderId].descricao || '',
                servico_selecionado: atendimentos[senderId].servicoSelecionado || '',
                detalhes_servico: atendimentos[senderId].detalhesServico || '',
                data_ocorrido: atendimentos[senderId].dataOcorrido || '',
                local_ocorrido: atendimentos[senderId].localOcorrido || '',
                detalhes_adicionais: atendimentos[senderId].detalhesAdicionais || ''
            };

            const conversaId = await salvarConversa(conversaData);
            console.log('✅ Conversa criada no banco com ID:', conversaId);
            
            // Atualizar o atendimento com o ID da conversa
            atendimentos[senderId].conversaId = conversaId;
            
        } catch (error) {
            console.error('❌ Erro ao criar conversa no banco:', error);
        }

        // Salvar demanda no banco de dados
        const atendimentoCompleto = { ...atendimentos[senderId] };
        atendimentoCompleto.senderId = senderId;
        
        try {
            const resultadoSalvamento = await salvarDemandaNoBanco(protocolNumber, atendimentoCompleto);
            
            if (resultadoSalvamento) {
                console.log(`Demanda ${protocolNumber} salva no banco de dados com sucesso`);
            } else {
                console.error(`Erro ao salvar demanda ${protocolNumber} no banco de dados`);
            }
        } catch (error) {
            console.error('Erro ao salvar demanda no banco:', error);
            console.log('⚠️ Backend não disponível. Continuando com geração local de protocolo...');
            // Continua o processo mesmo se falhar ao salvar no banco
        }

        // Registra o atendimento no relatório mensal
        if (atendimentos[senderId]) {
            registrarAtendimentoMensal(atendimentos[senderId]);
        } else {
            console.warn('Atendimento não encontrado para registro mensal:', senderId);
        }

        // Gerar relatório em texto e PDF
        const relatorioTexto = await gerarRelatorioAtendimento(senderId, protocolNumber);
        
        // Verifica se protocolNumber é uma string válida
        if (typeof protocolNumber !== 'string') {
            protocolNumber = String(protocolNumber);
        }
        
        const pdfResult = await gerarPDFRelatorio(senderId, protocolNumber);
        
        if (!pdfResult) {
            throw new Error('Falha ao gerar PDF do relatório');
        }

        const { fileName, filePath } = pdfResult;
        
        // Envia para o solicitante
        const chat = await client.getChatById(senderId);
        await chat.sendMessage(relatorioTexto);
        
        // Espera para garantir que o arquivo foi criado
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
            const media = MessageMedia.fromFilePath(filePath);
            await chat.sendMessage(media, {
                caption: `📄 Relatório de atendimento - ${protocolNumber}`
            });
        } catch (error) {
            console.error('Erro ao enviar PDF:', error);
            await chat.sendMessage(`⚠️ Relatório em texto enviado. Houve um problema ao gerar o PDF.`);
        }

        // Notificar a secretária responsável
        const atendimento = atendimentos[senderId];
        const secretariaEmail = SECRETARIAS_EMAILS[atendimento.secretaria];
        const secretariaWhatsapp = SECRETARIAS_WHATSAPP[atendimento.secretaria];
        
        let notificacaoEmailSucesso = false;
        let notificacaoWhatsappSucesso = false;

        // Enviar e-mail para a secretária
        if (secretariaEmail) {
            const tipoMap = {
                1: "Reclamação",
                2: "Denúncia",
                3: "Sugestão",
                4: "Elogio",
                5: "Solicitação de Informação/Serviço"
            };

            const assuntoEmail = `[Ouvidoria] Nova solicitação - Protocolo ${protocolNumber}`;
            const corpoEmail = `
                <h1>Nova solicitação recebida</h1>
                <p><strong>Protocolo:</strong> ${protocolNumber}</p>
                <p><strong>Solicitante:</strong> ${atendimento.anonimo ? 'Anônimo' : atendimento.nome}</p>
                <p><strong>Contato:</strong> ${senderId.replace('@c.us', '')}</p>
                <p><strong>Tipo:</strong> ${tipoMap[atendimento.tipo]}</p>
                <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                <hr>
                <p><strong>Descrição:</strong></p>
                <p>${atendimento.descricao || 'Não informada'}</p>
                <hr>
                <p>Por favor, acesse o sistema para dar andamento a esta solicitação.</p>
                <p><em>Esta é uma mensagem automática, por favor não responda este e-mail.</em></p>
            `;
            
            try {
                notificacaoEmailSucesso = await enviarEmailNotificacao(
                    secretariaEmail,
                    assuntoEmail,
                    corpoEmail,
                    {
                        filename: fileName,
                        path: filePath
                    }
                );
            } catch (erroEmail) {
                console.error('Erro ao enviar e-mail:', erroEmail);
                notificacaoEmailSucesso = false;
            }
        }

        // Enviar mensagem via WhatsApp para a secretária
        if (secretariaWhatsapp) {
            try {
                // Verifica se o número está registrado no WhatsApp
                const numeroValido = await client.isRegisteredUser(secretariaWhatsapp);
                
                if (numeroValido) {
                    // Envia notificação principal
                    notificacaoWhatsappSucesso = await notificarSecretariaWhatsApp(
                        secretariaWhatsapp,
                        protocolNumber,
                        atendimento
                    );
                    
                    // Envia o PDF como anexo
                    try {
                        const chatSecretaria = await client.getChatById(secretariaWhatsapp);
                        await chatSecretaria.sendMessage(media, {
                            caption: `📎 Anexo do Protocolo ${protocolNumber}`
                        });
                    } catch (erroAnexo) {
                        console.error('Erro ao enviar anexo para secretaria:', erroAnexo);
                    }
                } else {
                    console.error('Número da secretaria não registrado no WhatsApp:', secretariaWhatsapp);
                    await notificarAdmins(`Número de WhatsApp inválido: ${secretariaWhatsapp}`);
                }
            } catch (erroWhatsapp) {
                console.error('Erro na notificação por WhatsApp:', erroWhatsapp);
                notificacaoWhatsappSucesso = false;
            }
        }

        // Se ambas as notificações falharem, notificar os administradores
        if ((secretariaEmail && !notificacaoEmailSucesso) && 
            (secretariaWhatsapp && !notificacaoWhatsappSucesso)) {
            const mensagemAdmin = `⚠️ *Falha na Notificação* ⚠️\n\n` +
                                `Não foi possível notificar a secretaria sobre:\n\n` +
                                `*Protocolo:* ${protocolNumber}\n` +
                                `*Solicitante:* ${atendimento.anonimo ? 'Anônimo' : atendimento.nome}\n` +
                                `*Secretaria:* ${SECRETARIAS_EMAILS[atendimento.secretaria]}\n\n` +
                                `*Falhas:*\n` +
                                `- E-mail: ${secretariaEmail ? 'Falhou' : 'Não configurado'}\n` +
                                `- WhatsApp: ${secretariaWhatsapp ? 'Falhou' : 'Não configurado'}`;
            
            await notificarAdmins(mensagemAdmin);
            throw new Error('Falha em ambos os métodos de notificação');
        }

        return true;
    } catch (error) {
        console.error('Erro ao enviar relatórios:', error);
        
        // Notifica o usuário sobre a falha
        try {
            const chat = await client.getChatById(senderId);
            await chat.sendMessage(
                `⚠️ *Atenção*\n\n` +
                `Seu protocolo ${protocolNumber} foi registrado, mas houve um problema no envio para a secretaria.\n\n` +
                `Por favor, entre em contato diretamente com o setor responsável.`
            );
        } catch (erroUsuario) {
            console.error('Erro ao notificar usuário sobre falha:', erroUsuario);
        }
        
        return false;
    }
}



// =============================================
// FUNÇÕES DE MENU
// =============================================

// Função para gerar o menu principal
function getMainMenu() {
  return `

Bem-vindo! Sou Assistente Virtual da Ouvidoria Municipal de Venturosa.

Por favor, digite a opção da Secretaria que deseja atendimento:

*1*: 🏞️ Sec. Desenv. Rural e Meio Ambiente
*2*: 👨‍👩‍👧‍👦 Sec. Assistência Social
*3*: 📚 Sec. Educação
*4*: 👷 Sec. Infraest. e Seg. Pública
*5*: 🆘 Sec. Saúde e Direitos da Mulher
*6*: 🏥 Hosp. e Matern. Justa Maria Bezerra
*7*: 👩🏻‍⚕️ Programa Mulher Segura
*8*: 📈 Sec. Finança (Setor de Tributos)
*9*: 🤵 Sec. Administração (Servidores Municipais)

*99*: 📑 CONSULTA DO PROTOCOLO DE ATENDIMENTO
    `
}

// Função para gerar o submenu padrão para todas as secretarias
function getStandardSecretaryMenu(secretaryName) {
  return `
${secretaryName}

*1*: 🔴 Reclamações
*2*: 🔴 Denúncia
*3*: 🟡 Sugestões
*4*: 🟢 Elogios
*5*: ℹ️ Serviços e Informações

*0*: 🔄 Voltar Menu Inicial
*00*: ✅ Finalizar Atendimento
    `
}

// Funções para gerar submenus de serviços
function getRuralEnvironmentServicesMenu() {
  return `
  
 🏞️ Serviços da Sec. Desenv. Rural e Meio Ambiente:

*1*: 🛣️ Manutenção de Estradas e Vias
*2*: 🚜 Programa de Aração de Terras
*3*: 👨‍🌾 Programa de Distribuição de Sementes
*4*: 🚰 Programa de Distribuição de Água

*0*: 🔄 Voltar
*00*: ✅ Finalizar Atendimento
    `
}

function getSocialAssistanceServicesMenu() {
  return `

👨‍👩‍👧‍👦 Serviços da Sec. Assistência Social:

*1*: 💻 CADASTRO ÚNICO
*2*: ℹ️ CRAS
*3*: 👨‍⚖️ CREAS

*0*: 🔄 Voltar
*00*: ✅ Finalizar Atendimento
    `
}

function getEducationSportsServicesMenu() {
  return `
Serviços da Sec. Educação e Esporte:

*1*: 🏫 Matrícula Escolar
*2*: 🧑‍🏫 Reforço Escolar
*3*: 📑 Emissão de Histórico Escolar
*4*: 🧾 Declarações
*5*: 🚌 Transporte Universitário

*0*: 🔄 Voltar
*00*: ✅ Finalizar Atendimento
    `
}

function getInfrastructureSecurityServicesMenu() {
  return `

👷👨‍✈️ Serviços da Sec. Infraest. e Seg. Pública:

*1*: 💡 Iluminação Pública
*2*: 👷 Saneamento Básico
*3*: 🚧 Pavimentação (Manutenção)
*4*: 🧱 Limpeza Urbana (Entulho) 
*5*: 🚮 Coleta de Lixo (Dia/Hora)
*6*: 🚔 Guarda Municipal - Eventos

*0*: 🔄 Voltar
*00*: ✅ Finalizar Atendimento
`
}

function getHealthWomensRightsServicesMenu() {
  return `

🆘 Serviços da Sec. Saúde e Direitos da Mulher:

*1*: 👨‍⚕️ Centro de Especialidades Médicas - (CEM)
*2*: 🦷 Centro de Especialidades Odontológicas - (CEO)
*3*: 🧑‍🦼 Centro de Fisioterapia
*4*: 💺 Centro de Imagens
*5*: 🏠 Unidade Básica de Saúde da Família - (UBSF)

*0*: 🔄 Voltar
*00*: ✅ Finalizar Atendimento
    `
}

function getHospitalMaternityServicesMenu() {
  return `

🏥 Serviços do Hosp. e Matern. Justa Maria Bezerra:

1: 🔬 Exames Laboratóriais

0: 🔄 Voltar
*00*: ✅ Finalizar Atendimento
    `
}

function getmulherSeguraServicesMenu() {
    return `
👩🏻‍⚕️ Serviços do Programa Mulher Segura:

*1*: Atendimento Psicossocial
*2*: Acompanhamento Jurídico
*3*: Acolhimento Emergencial

*0*: 🔄 Voltar
*00*: ✅ Finalizar Atendimento
    `;
}

// Funções para gerar submenus de serviços
function gettaxesfinanceServicesMenu() {
  return `
  
 🏞️ Serviços da Sec. Finanças - Setor de Tributos

*1*: 📄 ISSQN
*2*: 📄 IPTU
*3*: 📄 ITBI
*4*: 📄 Alvará
*5*: 📄 Certidão Negativa

*0*: 🔄 Voltar
*00*: ✅ Finalizar Atendimento
    `
}

// Funções para gerar submenus de serviços
function getadministrationServicesMenu() {
  return `
  
 🏞️ Serviços da Sec. Administração

*1*: 📄 Contracheque
*2*: 📄 Margem Consignal
*3*: 📄 Licença Médica
*4*: 📄 Licença Prémio / Concessão
*5*: 📄 Licença Prémio / Gozo
*6*: 📄 Licença Sem Vencimento
*7*: 📄 Licença de Matrimônio
*8*: 📄 Mudança de Nome
*9*: 📄 Gratificação
*10*: 📄 Licença de Gestação
*11*: 📄 A Disposição
*12*: 📄 Exoneração
*13*: 📄 Aposentadoria
*14*: 📄 Salário Família
*15*: 📄 CTC
*16*: 📄 DTC

*0*: 🔄 Voltar
*00*: ✅ Finalizar Atendimento
    `
}

// Funções para gerar submenus específicos
function getUniqueRegistrationMenu() {
  return `

💻 CADASTRO ÚNICO:

*1*: 👨‍👩‍👧‍👦 Programa Bolsa Família 
*2*: 🔌 Tarifa Social de Energia Elétrica
*3*: 🛢️ Auxílio Gás dos Brasileiros

*0*: 🔄 Voltar
*00*: ✅ Finalizar Atendimento
    `
}

function getCRASMenu() {
  return `

ℹ️ CRAS:

*1*: 👨‍👩‍👧‍👦 Serviço de Proteção e Atendimento Integral a Família – PAIF
*2*: 📇 Carteiro do Idoso
*3*: 🧒🏻 Programa Criança Feliz
*4*: 👴🏼 Serviço de Convivência do Idoso - SCI
*5*: 👫 Serviço de Convivência e Fortalecimento de Vínculos
*6*: 🧏‍♂️ Benefício de Prestação Continuada - BPC
*7*: 🍜 Programa Bom Prato - PBP
*8*: 🥛 PAA – Programa do Leite
*9*: ✅ Benefícios Eventuais - (Kit Natalidade, Aux. Funerário, Aluguel Social, Cesta Básica)
*10*: 🏡 Programa Olhar para as Diferenças
*11*: 📄 Carteira do Autista

*0*: 🔄 Voltar
*00*: ✅ Finalizar Atendimento
    `
}

function getCREASMenu() {
  return `

👨‍⚖️ CREAS:

*1*: 👨🏼‍⚖️ Serviço de Proteção e Atendimento Especializado a Famílias e Indivíduos - PAEFI
*2*: 🏡 Casa de Acolhimento

*0*: 🔄 Voltar
*00*: ✅ Finalizar Atendimento
    `
}

function getCEMMenu() {
  return `
👨‍⚕️ Centro de Especialidades Médicas (CEM):

*1*: 🧒 Pediatria
*2*: 🦶 Teste do Pezinho
*3*: 💬 Neurologista
*4*: 👩🏽‍⚕️ Terapia Ocupacional (TO)
*5*: 🧑🏼‍⚕️ Psicólogo
*6*: 🧠 Psiquiatra
*7*: 🥬 Nutricionista
*8*: 🗣️ Fonoaudiólogo
*9*: 🦴 Ortopedista
*10*: 👨‍⚕️ Endocrinologista
*11*: 👩‍💼 Ginecologista/Obstetra
*12*: 👩‍💼 Psicopedagogo

*0*: 🔄 Voltar
*00*: ✅ Finalizar Atendimento
    `
}

function getCEOMenu() {
  return `

🦷 Centro de Especialidades Odontológicas (CEO):

*1*: 👨‍⚕️ Endodontista
*2*: 👩‍⚕️ Patologista Bucal
*3*: 👨‍⚕️ Periodontista
*4*: 👩‍⚕️ Radiologista
*5*: 👨‍⚕️ Traumatologista Bucomaxilofacial
*6*: 🧑‍🦼 Odontologista Pediatra e PcD (Pessoas com Deficiência)

*0*: 🔄 Voltar
*00*: ✅ Finalizar Atendimento
    `
}

function getPhysiotherapyCenterMenu() {
  return `
Centro de Fisioterapia:

*1*: 🏊🏻 Hidroterapia
*2*: 👨🏻‍⚕️ Fisioterapia Pediatra
*3*: 🚶🏻 Fisioterapia Motora (Geriatria)
*4*: 🧠 Reabilitação Neurológica
*5*: 🦴 Traumato-Ortopedia
*6*: 👨🏻‍⚕️ Reumatologia

*0*: 🔄 Voltar
*00*: ✅ Finalizar Atendimento
    `
}

function getImageCenterMenu() {
  return `

💺 Centro de Imagens:

*1*: 🛏️ Raio X
*2*: 🦷 Raio X Panorâmico
*3*: 🙆‍♀️ Mamografia
*4*: 🗣️ Endoscopia
*5*: 🙆 Ultrassonografia
*6*: 🙆‍♀️ Colonoscopia
*7*: ❤️ Ecocardiograma
*8*: ❤️ Cardiologista
*9*: 👁️ Oftalmologista

*0*: 🔄 Voltar
*00*: ✅ Finalizar Atendimento
    `
}

function getUBSFMenu() {
  return `
Unidades Básicas de Saúde da Família (UBSF):

*1*: 🏠 UBSF Albino Bezerra de Vasconcelos
*2*: 🏠 UBSF Antônio Pedro da Silva (Pedra Fixe)
*3*: 🏠 UBSF João Francisco Bezerra (COHAB)
*4*: 🏠 UBSF José Jorge Bezerra (Sítio Azevem)
*5*: 🏠 UBSF Mãe Lipu
*6*: 🏠 UBSF Maria Lenice Alexandre Tenório
*7*: 🏠 UBSF Satiliense
*8*: 🏠 UBSF Unidade de Saúde do Tará
*9*: 🏠 UBSF Valdecy da Silva (Bacural)

*0*: 🔄 Voltar
*00*: ✅ Finalizar Atendimento
    `
}

function getLaboratoryTestsMenu() {
  return `

🔬 Exames Laboratóriais:

*1*: 📋 Lista de Exames Disponíveis
*2*: 🗃️ Documentação (Solicitação)

*0*: 🔄 Voltar
*00*: ✅ Finalizar Atendimento
    `
}
// Função resetInactivityTimer já definida na linha 345

// =============================================
// FUNÇÕES DE HISTÓRICO
// =============================================

// Função para registrar opção de menu escolhida no histórico
function registrarOpcaoMenuNoHistorico(senderId, nomeOpcao) {
  if (!conversationHistory[senderId]) {
    conversationHistory[senderId] = {
      messages: [],
      timestamps: [],
      origem: []
    };
  }
  conversationHistory[senderId].messages.push(`Usuário selecionou: ${nomeOpcao}`);
  conversationHistory[senderId].timestamps.push(new Date().toISOString());
  conversationHistory[senderId].origem.push('menu');
}

// Função para registrar mensagem do bot no histórico
function registrarMensagemBotNoHistorico(senderId, mensagem) {
  if (!conversationHistory[senderId]) {
    conversationHistory[senderId] = {
      messages: [],
      timestamps: [],
      origem: []
    };
  }
  conversationHistory[senderId].messages.push(`Bot: ${mensagem}`);
  conversationHistory[senderId].timestamps.push(new Date().toISOString());
  conversationHistory[senderId].origem.push('bot');
}

// =============================================
// HANDLER DE MENSAGENS
// =============================================

// Modifique o evento 'message' para registrar as interações
client.on("message", async (msg) => {
    const chat = await msg.getChat();
    const senderId = msg.from;
    const text = msg.body.toLowerCase();
    const greeting = getGreeting();
    const senderName = msg._data.notifyName;

    // Inicializa o estado do usuário se não existir
    if (!userStates[senderId]) {
        userStates[senderId] = {
            mainMenu: 0,
            subMenu: 0,
            subSubMenu: 0,
            solicitacaoAnonimaPerguntada: false,
            solicitacaoAnonima: undefined,
            aguardandoEscolhaAnonima: false
        };
    }
    let userState = userStates[senderId];

    // Se ainda não perguntou sobre anonimato, pergunta e aguarda resposta
    if (!userState.solicitacaoAnonimaPerguntada && !userState.aguardandoEscolhaAnonima && userState.solicitacaoAnonima === undefined) {
        userState.aguardandoEscolhaAnonima = true;
        await chat.sendMessage(
            "Deseja registrar sua solicitação de forma anônima?\n1. Sim\n2. Não\n\n*De acordo com a LGPD, ao escolher anonimato, nenhum dado pessoal será solicitado ou armazenado.*"
        );
        return;
    }
    // Processa a resposta do usuário sobre anonimato
    if (userState.aguardandoEscolhaAnonima) {
        if (text === "1") {
            userState.solicitacaoAnonima = true;
            userState.solicitacaoAnonimaPerguntada = true;
            userState.aguardandoEscolhaAnonima = false;
            if (!atendimentos[senderId]) atendimentos[senderId] = {};
            atendimentos[senderId].anonimo = true;
            await chat.sendMessage("Sua solicitação será registrada de forma anônima.");
            await chat.sendMessage(getMainMenu());
            return;
        } else if (text === "2") {
            userState.solicitacaoAnonima = false;
            userState.solicitacaoAnonimaPerguntada = true;
            userState.aguardandoEscolhaAnonima = false;
            if (!atendimentos[senderId]) atendimentos[senderId] = {};
            atendimentos[senderId].anonimo = false;
            await chat.sendMessage("Ok, sua solicitação NÃO será anônima.");
            await chat.sendMessage(getMainMenu());
            return;
        } else {
            await chat.sendMessage("Por favor, responda apenas com 1 (Sim) ou 2 (Não). Deseja registrar sua solicitação de forma anônima?\n1. Sim\n2. Não");
            return;
        }
        // Após responder, segue para o menu normalmente
    }

    // Registrar mensagem do usuário
    const protocolo = atendimentos[senderId]?.protocolo;
    await registrarInteracao(senderId, text, 'usuário', protocolo);

    // Inicializa o histórico de conversa se não existir
    if (!conversationHistory[senderId]) {
        conversationHistory[senderId] = {
            messages: [],
            timestamps: [],
            origem: []
        };
    }

    // Verifica se a mensagem contém mídia (imagem, vídeo, documento)
    if (msg.hasMedia) {
        await handleMediaMessage(msg, senderId);
        return;
    }

  // Armazena a mensagem recebida
  conversationHistory[senderId].messages.push(text);
  conversationHistory[senderId].timestamps.push(new Date().toISOString());
  conversationHistory[senderId].origem.push('usuário');

  // Comandos administrativos
  if (text.startsWith('resp#') || text.startsWith('status#') || text.startsWith('enc#')) {
    if (!isAdmin(senderId)) {
      await chat.sendMessage(`❌ Acesso restrito a administradores.`);
      return;
    }
  }

  // Comando para resposta administrativa
  if (text.startsWith('resp#')) {
    const parts = text.split('#');
    if (parts.length >= 3) {
      const protocolNumber = parts[1].toUpperCase();
      const resposta = parts.slice(2).join('#');
      
      const success = await registrarRespostaProtocolo(protocolNumber, resposta, senderName);
      
      if (success) {
        await chat.sendMessage(`✅ Resposta registrada no protocolo ${protocolNumber} com sucesso!`);
      } else {
        await chat.sendMessage(`❌ Não foi possível registrar a resposta. Verifique o número do protocolo.`);
      }
    }
    return;
  }

  // Comando para adicionar comentário ao protocolo
  if (text.startsWith('r#')) {
    const parts = text.split('#');
    if (parts.length >= 3) {
      const protocolNumber = parts[1].toUpperCase();
      const comentario = parts.slice(2).join('#');
      
      const success = await adicionarComentarioProtocolo(protocolNumber, senderId, comentario, senderName);
      
      if (success) {
        await chat.sendMessage(`✅ Seu comentário foi adicionado ao protocolo ${protocolNumber} com sucesso!`);
      } else {
        await chat.sendMessage(`❌ Não foi possível adicionar seu comentário. Verifique o número do protocolo.`);
      }
    }
    return;
  }

  // Comando para alterar status (admin)
  if (text.startsWith('status#')) {
    const parts = text.split('#');
    if (parts.length >= 3) {
      const protocolNumber = parts[1].toUpperCase();
      const novoStatus = parts[2];
      
      const atendimento = buscarAtendimentoPorProtocolo(protocolNumber);
      if (atendimento) {
        atendimento.status = novoStatus;
        adicionarAtualizacaoProtocolo(
          protocolNumber,
          senderName,
          `Status alterado para: ${novoStatus}`
        );
        
        await chat.sendMessage(`✅ Status do protocolo ${protocolNumber} atualizado para: ${novoStatus}`);
        
        // Notifica o usuário sobre a mudança de status
        if (atendimento.senderId) {
          const statusMap = {
            'aberto': '🟡 Em análise',
            'em_andamento': '🔵 Em andamento',
            'resolvido': '🟢 Resolvido',
            'cancelado': '🔴 Cancelado'
          };
          
          const chatUsuario = await client.getChatById(atendimento.senderId);
          await chatUsuario.sendMessage(
            `📢 *Atualização no Protocolo ${protocolNumber}*\n\n` +
            `O status do seu atendimento foi atualizado:\n\n` +
            `${statusMap[novoStatus] || novoStatus}\n\n` +
            `Digite *99* para consultar seu protocolo.`
          );
        }
      } else {
        await chat.sendMessage(`❌ Protocolo não encontrado.`);
      }
    }
    return;
  }


   // Consulta de protocolo
  if (text === "99" || (userState && userState.consultandoProtocolo)) {
    if (text === "99") {
      userState.consultandoProtocolo = true;
      await chat.sendMessage("Por favor, digite o número do protocolo que deseja consultar (formato OUVMMDDYY/XXXX):");
      return;
    }

    const protocolNumber = text.toUpperCase().trim();
    const resultado = await consultarProtocolo(protocolNumber, senderId);
    await chat.sendMessage(resultado.message);

    if (resultado.success) {
      // Exibe opções adicionais após consulta de protocolo
      userState.protocoloConsulta = protocolNumber;
      userState.aguardandoOpcaoConsulta = true;
      await chat.sendMessage(
        "Escolha uma opção:\n" +
        "1 - Adicionar informações ao protocolo\n" +
        "2 - Enviar documento, foto ou vídeo\n" +
        "3 - Dúvidas\n" +
        "4 - FAQ (Perguntas Frequentes)\n" +
        "00 - Encerrar atendimento"
      );
      return;
    } else {
      // Protocolo não encontrado
      delete userState.consultandoProtocolo;
      return;
    }
  }

  // Processa opções após consulta de protocolo
  if (userState?.aguardandoOpcaoConsulta) {
    const opcao = text.trim();
    const protocolNumber = userState.protocoloConsulta;
    switch (opcao) {
      case "1":
        userState.aguardandoInfoProtocolo = true;
        await chat.sendMessage("Por favor, digite as informações que deseja adicionar ao protocolo.\n\n🔴ATENÇÃO🔴\n\nInsira quantas informações quiser, após finalizar a consulta, escolha uma opção:\n\n *77* - Menu anterior;\n *99* - Consultar protocolo;\n *cancelar* - Cancela a operação");
        break;
      case "2":
        userState.aguardandoMidiaProtocolo = true;
        await chat.sendMessage("Por favor, envie o documento, foto ou vídeo que deseja anexar ao protocolo.\n\n🔴ATENÇÃO🔴\n\nInsira quantos arquivos necessitar, após finalizar a consulta, escolha uma opção:\n\n *77* - Menu anterior;\n *99* - Consultar protocolo;\n *cancelar* - Cancela a operação");
        break;
      case "3":
        userState.aguardandoDuvidasProtocolo = true;
        await chat.sendMessage("Se você tem dúvidas sobre o seu protocolo, descreva sua dúvida e nossa equipe irá responder em breve.\n\n🔴ATENÇÃO🔴\n\nInsira quantas duvidas quiser, após finalizar a consulta, escolha uma opção:\n\n *77* - Menu anterior;\n *cancelar* - Cancela a operação");
        break;
      case "4":
        userState.aguardandoFAQProtocolo = true;
        await chat.sendMessage("FAQ - Perguntas Frequentes:\n1. Como consultar meu protocolo?\nR: Digite 99 e informe o número do protocolo.\n2. Como adicionar informações?\nR: Após consultar o protocolo, escolha a opção 1.\n3. Como enviar documentos?\nR: Após consultar o protocolo, escolha a opção 2.\n4. Como encerrar atendimento?\nR: Após consultar o protocolo, escolha a opção 00.\n\n🔴ATENÇÃO🔴\n\nApós finalizar a consulta, escolha uma opção:\n\n *77* - Menu anterior;\n *cancelar* - Cancela a operação");
        break;
      case "00":
        await chat.sendMessage("Atendimento encerrado. Se precisar de mais informações, digite 'menu' para iniciar um novo atendimento.");
        delete userState;
        break;
      default:
        await chat.sendMessage("Opção inválida. Por favor, escolha uma opção válida que aparece no menu.");
    }
    // Se não for encerrar, mantém o estado para próxima interação
    if (opcao !== "00") {
      userState.aguardandoOpcaoConsulta = false;
    }
    return;
  }

  // Adiciona informações ao protocolo
  if (userState?.aguardandoInfoProtocolo) {
    if (text.trim() === "77") {
      userState.aguardandoInfoProtocolo = false;
      userState.aguardandoOpcaoConsulta = true;
      await chat.sendMessage("Área de adicionar informações finalizada. Escolha outra opção ou digite 'cancelar' para voltar ao menu anterior.");
      await chat.sendMessage(
        "Escolha uma opção:\n" +
        "1 - Adicionar informações ao protocolo\n" +
        "2 - Enviar documento, foto ou vídeo\n" +
        "3 - Dúvidas\n" +
        "4 - FAQ (Perguntas Frequentes)\n" +
        "00 - Encerrar atendimento"
      );
      return;
    }
    if (text.trim().toLowerCase() === "cancelar") {
      userState.aguardandoInfoProtocolo = false;
      userState.aguardandoOpcaoConsulta = true;
      await chat.sendMessage("Operação cancelada. Voltando ao menu anterior da consulta de protocolo.");
      await chat.sendMessage(
        "Escolha uma opção:\n" +
        "1 - Adicionar informações ao protocolo\n" +
        "2 - Enviar documento, foto ou vídeo\n" +
        "3 - Dúvidas\n" +
        "4 - FAQ (Perguntas Frequentes)\n" +
        "00 - Encerrar atendimento"
        );
      return;
    }
    const protocolNumber = userState.protocoloConsulta;
    const comentario = text;
    const senderName = msg._data.notifyName;
    const sucesso = await adicionarComentarioProtocolo(protocolNumber, senderId, comentario, senderName);
    if (sucesso) {
      await chat.sendMessage(`✅ Informação adicionada ao protocolo ${protocolNumber} com sucesso!\nDigite '77' para finalizar ou 'cancelar' para voltar ao menu anterior.`);
    } else {
      await chat.sendMessage(`❌ Não foi possível adicionar a informação. Verifique o número do protocolo.\nDigite '77' para finalizar ou 'cancelar' para voltar ao menu anterior.`);
    }
    // Mantém aguardando até usuário digitar 77 ou cancelar
    return;
  }

  // Recebe mídia para anexar ao protocolo
  if (userState?.aguardandoMidiaProtocolo) {
    if (text.trim() === "77") {
      userState.aguardandoMidiaProtocolo = false;
      userState.aguardandoOpcaoConsulta = true;
      await chat.sendMessage("Área de envio de documentos finalizada. Escolha outra opção ou digite 'cancelar' para voltar ao menu anterior.");
      await chat.sendMessage(
        "Escolha uma opção:\n" +
        "1 - Adicionar informações ao protocolo\n" +
        "2 - Enviar documento, foto ou vídeo\n" +
        "3 - Dúvidas\n" +
        "4 - FAQ (Perguntas Frequentes)\n" +
        "00 - Encerrar atendimento"
      );
      return;
    }
    if (text.trim().toLowerCase() === "cancelar") {
      userState.aguardandoMidiaProtocolo = false;
      userState.aguardandoOpcaoConsulta = true;
      await chat.sendMessage("Operação cancelada. Voltando ao menu anterior da consulta de protocolo.");
      await chat.sendMessage(
        "Escolha uma opção:\n" +
        "1 - Adicionar informações ao protocolo\n" +
        "2 - Enviar documento, foto ou vídeo\n" +
        "3 - Dúvidas\n" +
        "4 - FAQ (Perguntas Frequentes)\n" +
        "00 - Encerrar atendimento"
        );
      return;
    }
    if (msg.hasMedia) {
      const protocolNumber = userState.protocoloConsulta;
      await handleMediaMessage(msg, senderId);
      await chat.sendMessage(`✅ Documento, foto ou vídeo anexado ao protocolo ${protocolNumber} com sucesso!\nDigite '77' para finalizar ou 'cancelar' para voltar ao menu anterior.`);
      // Mantém aguardando até usuário digitar 77 ou cancelar
      return;
    } else {
      await chat.sendMessage("Por favor, envie um documento, foto ou vídeo, ou digite '77' para finalizar ou 'cancelar' para voltar ao menu anterior.");
      return;
    }
  }

  // Dúvidas
  if (userState?.aguardandoDuvidasProtocolo) {
    if (text.trim() === "77") {
      userState.aguardandoDuvidasProtocolo = false;
      userState.aguardandoOpcaoConsulta = true;
      await chat.sendMessage("Área de dúvidas finalizada. Escolha outra opção ou digite 'cancelar' para voltar ao menu anterior.");
      await chat.sendMessage(
        "Escolha uma opção:\n" +
        "1 - Adicionar informações ao protocolo\n" +
        "2 - Enviar documento, foto ou vídeo\n" +
        "3 - Dúvidas\n" +
        "4 - FAQ (Perguntas Frequentes)\n" +
        "00 - Encerrar atendimento"
      );
      return;
    }
    if (text.trim().toLowerCase() === "cancelar") {
      userState.aguardandoDuvidasProtocolo = false;
      userState.aguardandoOpcaoConsulta = true;
      await chat.sendMessage("Operação cancelada. Voltando ao menu anterior da consulta de protocolo.");
      await chat.sendMessage(
        "Escolha uma opção:\n" +
        "1 - Adicionar informações ao protocolo\n" +
        "2 - Enviar documento, foto ou vídeo\n" +
        "3 - Dúvidas\n" +
        "4 - FAQ (Perguntas Frequentes)\n" +
        "00 - Encerrar atendimento"
        );
      return;
    }
    // Registra a dúvida no protocolo
    const protocolNumber = userState.protocoloConsulta;
    const duvida = text;
    const senderName = msg._data.notifyName;
    const sucesso = await adicionarComentarioProtocolo(protocolNumber, senderId, `DÚVIDA: ${duvida}`, senderName);
    if (sucesso) {
      await chat.sendMessage(`✅ Dúvida registrada no protocolo ${protocolNumber} com sucesso!\nDigite '77' para finalizar ou 'cancelar' para voltar ao menu anterior.`);
    } else {
      await chat.sendMessage(`❌ Não foi possível registrar a dúvida. Verifique o número do protocolo.\nDigite '77' para finalizar ou 'cancelar' para voltar ao menu anterior.`);
    }
    // Mantém aguardando até usuário digitar 77 ou cancelar
    return;
  }

  // FAQ
  if (userState?.aguardandoFAQProtocolo) {
    if (text.trim() === "77") {
      userState.aguardandoFAQProtocolo = false;
      userState.aguardandoOpcaoConsulta = true;
      await chat.sendMessage("Área de FAQ finalizada. Escolha outra opção ou digite 'cancelar' para voltar ao menu anterior.");
      await chat.sendMessage(
        "Escolha uma opção:\n" +
        "1 - Adicionar informações ao protocolo\n" +
        "2 - Enviar documento, foto ou vídeo\n" +
        "3 - Dúvidas\n" +
        "4 - FAQ (Perguntas Frequentes)\n" +
        "00 - Encerrar atendimento"
      );
      return;
    }
    if (text.trim().toLowerCase() === "cancelar") {
      userState.aguardandoFAQProtocolo = false;
      userState.aguardandoOpcaoConsulta = true;
      await chat.sendMessage("Operação cancelada. Voltando ao menu anterior da consulta de protocolo.");
      await chat.sendMessage(
        "Escolha uma opção:\n" +
        "1 - Adicionar informações ao protocolo\n" +
        "2 - Enviar documento, foto ou vídeo\n" +
        "3 - Dúvidas\n" +
        "4 - FAQ (Perguntas Frequentes)\n" +
        "00 - Encerrar atendimento"
      );
      return;
    }
    // Processa perguntas específicas do FAQ
    const pergunta = text.toLowerCase();
    let respostaFAQ = "";
    
    if (pergunta.includes("protocolo") || pergunta.includes("consultar")) {
      respostaFAQ = "Para consultar seu protocolo, digite '99' e informe o número do protocolo no formato OUVMMDDYY/XXXX.";
    } else if (pergunta.includes("adicionar") || pergunta.includes("informação")) {
      respostaFAQ = "Para adicionar informações ao protocolo, após consultá-lo, escolha a opção 1 no menu de opções.";
    } else if (pergunta.includes("documento") || pergunta.includes("foto") || pergunta.includes("vídeo") || pergunta.includes("video")) {
      respostaFAQ = "Para enviar documentos, fotos ou vídeos, após consultar o protocolo, escolha a opção 2 no menu de opções.";
    } else if (pergunta.includes("encerrar") || pergunta.includes("finalizar")) {
      respostaFAQ = "Para encerrar o atendimento, escolha a opção 00 no menu de opções após consultar o protocolo.";
    } else if (pergunta.includes("tempo") || pergunta.includes("prazo")) {
      respostaFAQ = "O prazo para resposta é de 5 dias úteis após o registro do protocolo.";
    } else if (pergunta.includes("status") || pergunta.includes("andamento")) {
      respostaFAQ = "Para verificar o status do seu protocolo, consulte-o digitando '99' e o número do protocolo.";
    } else {
      respostaFAQ = "Para mais informações, consulte as perguntas frequentes listadas acima ou entre em contato diretamente com a secretaria responsável.";
    }
    
    await chat.sendMessage(`📋 *FAQ - Resposta:*\n\n${respostaFAQ}\n\nDigite '77' para finalizar ou 'cancelar' para voltar ao menu anterior.`);
    // Mantém aguardando até usuário digitar 77 ou cancelar
    return;
  }



  // Processar confirmação de envio por e-mail
  if (userState.aguardandoConfirmacaoEmail) {
    if (text === 'sim' || text === 's') {
      const protocolNumber = userState.protocoloConsulta;
      const atendimento = buscarAtendimentoPorProtocolo(protocolNumber);
      
      if (atendimento) {
        const pdfResult = await gerarPDFRelatorio(atendimento.senderId || senderId, protocolNumber);
        
        if (pdfResult) {
          await chat.sendMessage(`✅ Comprovante do protocolo ${protocolNumber} enviado para ${atendimento.email}`);
          // Aqui você implementaria o envio real por e-mail
        } else {
          await chat.sendMessage("❌ Não foi possível gerar o comprovante. Por favor, tente novamente mais tarde.");
        }
      }
    } else {
      await chat.sendMessage("Ok, o comprovante não será enviado por e-mail.");
    }
    
    delete userState.aguardandoConfirmacaoEmail;
    delete userState.protocoloConsulta;
    return;
  }
  
// Função registrarRespostaProtocolo já definida na linha 824

  // Finaliza atendimento com "00"
if (text === "00") {
    // Garante que o atendimento existe
    if (!atendimentos[senderId]) {
        atendimentos[senderId] = {
            nome: 'Usuário',
            secretaria: 1,
            tipo: 5,
            descricao: 'Solicitação via WhatsApp',
            data: new Date().toISOString()
        };
    }
    
    try {
        const protocolNumber = await generateProtocolNumber();
        const success = await enviarRelatorios(senderId, protocolNumber);
        
        if (success) {
            await chat.sendMessage(
                `✅ *Atendimento finalizado*\n\n` +
                `Seu protocolo é: *${protocolNumber}*\n\n` +
                `Sua solicitação foi encaminhada para a secretaria responsável.\n` +
                `Obrigado por entrar em contato com a Ouvidoria Municipal de Venturosa!`
            );
        } else {
            await chat.sendMessage(
                `⚠️ *Atendimento registrado com problemas*\n\n` +
                `Seu protocolo é: *${protocolNumber}*\n\n` +
                `Houve um problema ao enviar sua solicitação para a secretaria. ` +
                `Por favor, entre em contato diretamente com o setor responsável.`
            );
        }
    } catch (error) {
        console.error('Erro ao finalizar atendimento:', error);
        await chat.sendMessage(
            `❌ *Erro no sistema*\n\n` +
            `Desculpe, houve um erro técnico. ` +
            `Por favor, tente novamente em alguns minutos ou entre em contato diretamente com a secretaria.`
        );
    }

    // Finalizar conversa no banco de dados
    if (atendimentos[senderId]?.protocolo) {
        try {
            await finalizarConversa(
                atendimentos[senderId].protocolo,
                new Date().toISOString(),
                'finalizado'
            );
            console.log('✅ Conversa finalizada no banco:', atendimentos[senderId].protocolo);
        } catch (error) {
            console.error('❌ Erro ao finalizar conversa no banco:', error);
        }
    }

    // Limpa o estado do usuário
    delete userStates[senderId];
    delete conversationHistory[senderId];
    if (userTimers[senderId]) {
        clearTimeout(userTimers[senderId]);
        delete userTimers[senderId];
    }
    return;
}
  // Inicializa o estado do usuário se não existir
  if (!userStates[senderId]) {
    userStates[senderId] = {
      mainMenu: 0,
      subMenu: 0,
      subSubMenu: 0,
    };
  }

  // Reseta o temporizador de inatividade
  resetInactivityTimer(senderId);

 
  if (["menu", "oi", "olá", "ola", "opa", "bom dia", "boa tarde", "boa noite"].includes(text)) {
    userState.mainMenu = 0;
    userState.subMenu = 0;
    userState.subSubMenu = 0;
    const resposta = `${greeting}, ${senderName}! ${getMainMenu()}`;
    await chat.sendMessage(resposta);
    registrarInteracao(senderId, resposta, 'bot');
    registrarMensagemBotNoHistorico(senderId, resposta);
    return;
  }

  // Processamento do menu principal
  if (userState.mainMenu === 0) {
    switch (text) {
      case "1":
        userState.mainMenu = 1;
        const protocolo = atendimentos[senderId]?.protocolo;
        await registrarOpcao(senderId, "Principal", "1", "Sec. Desenv. Rural e Meio Ambiente", protocolo);
        registrarOpcaoMenuNoHistorico(senderId, "Sec. Desenv. Rural e Meio Ambiente");
        await chat.sendMessage(getStandardSecretaryMenu("Sec. Desenv. Rural e Meio Ambiente"));
        registrarMensagemBotNoHistorico(senderId, getStandardSecretaryMenu("Sec. Desenv. Rural e Meio Ambiente"));
        break;
      case "2":
        userState.mainMenu = 2;
        const protocolo2 = atendimentos[senderId]?.protocolo;
        await registrarOpcao(senderId, "Principal", "2", "Sec. Assistência Social", protocolo2);
        registrarOpcaoMenuNoHistorico(senderId, "Sec. Assistência Social");
        await chat.sendMessage(getStandardSecretaryMenu("Sec. Assistência Social"));
        registrarMensagemBotNoHistorico(senderId, getStandardSecretaryMenu("Sec. Assistência Social"));
        break;
      case "3":
        userState.mainMenu = 3;
        const protocolo3 = atendimentos[senderId]?.protocolo;
        await registrarOpcao(senderId, "Principal", "3", "Sec. Educação e Esporte", protocolo3);
        registrarOpcaoMenuNoHistorico(senderId, "Sec. Educação e Esporte");
        await chat.sendMessage(getStandardSecretaryMenu("Sec. Educação e Esporte"));
        registrarMensagemBotNoHistorico(senderId, getStandardSecretaryMenu("Sec. Educação e Esporte"));
        break;
      case "4":
        userState.mainMenu = 4;
        const protocolo4 = atendimentos[senderId]?.protocolo;
        await registrarOpcao(senderId, "Principal", "4", "Sec. Infraestrutura e Seg. Pública", protocolo4);
        registrarOpcaoMenuNoHistorico(senderId, "Sec. Infraestrutura e Seg. Pública");
        await chat.sendMessage(getStandardSecretaryMenu("Sec. Infraestrutura e Seg. Pública"));
        registrarMensagemBotNoHistorico(senderId, getStandardSecretaryMenu("Sec. Infraestrutura e Seg. Pública"));
        break;
      case "5":
        userState.mainMenu = 5;
        const protocolo5 = atendimentos[senderId]?.protocolo;
        await registrarOpcao(senderId, "Principal", "5", "Sec. Saúde e dos Direitos da Mulher", protocolo5);
        registrarOpcaoMenuNoHistorico(senderId, "Sec. Saúde e dos Direitos da Mulher");
        await chat.sendMessage(getStandardSecretaryMenu("Sec. Saúde e dos Direitos da Mulher"));
        registrarMensagemBotNoHistorico(senderId, getStandardSecretaryMenu("Sec. Saúde e dos Direitos da Mulher"));
        break;
      case "6":
        userState.mainMenu = 6;
        const protocolo6 = atendimentos[senderId]?.protocolo;
        await registrarOpcao(senderId, "Principal", "6", "Hosp. e Matern. Justa Maria Bezerra", protocolo6);
        registrarOpcaoMenuNoHistorico(senderId, "Hosp. e Matern. Justa Maria Bezerra");
        await chat.sendMessage(getStandardSecretaryMenu("Hosp. e Matern. Justa Maria Bezerra"));
        registrarMensagemBotNoHistorico(senderId, getStandardSecretaryMenu("Hosp. e Matern. Justa Maria Bezerra"));
        break;
      case "7":
        userState.mainMenu = 7;
        const protocolo7 = atendimentos[senderId]?.protocolo;
        await registrarOpcao(senderId, "Principal", "7", "Programa Mulher Segura", protocolo7);
        registrarOpcaoMenuNoHistorico(senderId, "Programa Mulher Segura");
        await chat.sendMessage(getStandardSecretaryMenu("Programa Mulher Segura"));
        registrarMensagemBotNoHistorico(senderId, getStandardSecretaryMenu("Programa Mulher Segura"));
        break;
      case "8":
        userState.mainMenu = 8;
        const protocolo8 = atendimentos[senderId]?.protocolo;
        await registrarOpcao(senderId, "Principal", "8", "Sec. Finanças - Setor Tributário", protocolo8);
        registrarOpcaoMenuNoHistorico(senderId, "Sec. Finanças - Setor Tributário");
        await chat.sendMessage(getStandardSecretaryMenu("Sec. Finanças - Setor Tributário"));
        registrarMensagemBotNoHistorico(senderId, getStandardSecretaryMenu("Sec. Finanças - Setor Tributário"));
        break;
      case "9":
        userState.mainMenu = 9;
        const protocolo9 = atendimentos[senderId]?.protocolo;
        await registrarOpcao(senderId, "Principal", "9", "Sec. de Administração - (Servidores Municipais)", protocolo9);
        registrarOpcaoMenuNoHistorico(senderId, "Sec. de Administração - (Servidores Municipais)");
        await chat.sendMessage(getStandardSecretaryMenu("Sec. de Administração - (Servidores Municipais)"));
        registrarMensagemBotNoHistorico(senderId, getStandardSecretaryMenu("Sec. de Administração - (Servidores Municipais)"));
        break;
      case "0":
        userState.mainMenu = 0;
        registrarOpcao(senderId, "Principal", "0", "Opção Inválida");
        registrarOpcaoMenuNoHistorico(senderId, "Opção Inválida");
        await chat.sendMessage(getStandardSecretaryMenu("Opção Inválida"));
        registrarMensagemBotNoHistorico(senderId, getStandardSecretaryMenu("Opção Inválida"));
        break;
      default:
        await chat.sendMessage("Opção inválida. Por favor, escolha uma opção válida.")
        registrarMensagemBotNoHistorico(senderId, "Opção inválida. Por favor, escolha uma opção válida.");
    }
    return
  }

  // Processamento dos submenus das secretarias
if (userState.subMenu === 0) {
  switch (text) {
    case "1":
      userState.subMenu = 1;
      registrarOpcao(senderId, "Tipo Atendimento", "1", "Reclamação");
      registrarOpcaoMenuNoHistorico(senderId, "Reclamação");
      if (!atendimentos[senderId]) {
        atendimentos[senderId] = {
          nome: msg._data.notifyName,
          secretaria: userState.mainMenu,
          tipo: 1, // Reclamação
          data: new Date().toISOString(),
          descricao: "", // Inicializa campo de descrição
          dataOcorrido: "", // Inicializa campo de data do ocorrido
          localOcorrido: "" // Inicializa campo de local do ocorrido
        };
      }
      await chat.sendMessage(
        "Ok! Por favor, nos informe:\n1. A DATA e HORA do ocorrido\n2. O LOCAL do ocorrido\n3. Sua RECLAMAÇÃO detalhada\n\n*🔴 ATENÇÃO 🔴*\nApós informar todos os dados, digite:\n\n*0*: Menu Inicial\n*00*: Finalizar Atendimento."
      );
      registrarMensagemBotNoHistorico(senderId, "Ok! Por favor, nos informe:\n1. A DATA e HORA do ocorrido\n2. O LOCAL do ocorrido\n3. Sua RECLAMAÇÃO detalhada\n\n*🔴 ATENÇÃO 🔴*\nApós informar todos os dados, digite:\n\n*0*: Menu Inicial\n*00*: Finalizar Atendimento.");
      break;
    case "2":
      userState.subMenu = 1;
      registrarOpcao(senderId, "Tipo Atendimento", "2", "Denúncia");
      registrarOpcaoMenuNoHistorico(senderId, "Denúncia");
      if (!atendimentos[senderId]) {
        atendimentos[senderId] = {
          nome: msg._data.notifyName,
          secretaria: userState.mainMenu,
          tipo: 2, // Denúncia
          data: new Date().toISOString(),
          descricao: "",
          dataOcorrido: "",
          localOcorrido: ""
        };
      }
      await chat.sendMessage(
        "Ok! Por favor, nos informe:\n1. A DATA e HORA do ocorrido\n2. O LOCAL do ocorrido\n3. Sua DENÚNCIA detalhada\n\n*🔴 ATENÇÃO 🔴*\nApós informar todos os dados, digite:\n\n*0*: Menu Inicial\n*00*: Finalizar Atendimento."
      );
      registrarMensagemBotNoHistorico(senderId, "Ok! Por favor, nos informe:\n1. A DATA e HORA do ocorrido\n2. O LOCAL do ocorrido\n3. Sua DENÚNCIA detalhada\n\n*🔴 ATENÇÃO 🔴*\nApós informar todos os dados, digite:\n\n*0*: Menu Inicial\n*00*: Finalizar Atendimento.");
      break;
    case "3":
      userState.subMenu = 1;
      registrarOpcao(senderId, "Tipo Atendimento", "3", "Sugestão");
      registrarOpcaoMenuNoHistorico(senderId, "Sugestão");
      if (!atendimentos[senderId]) {
        atendimentos[senderId] = {
          nome: msg._data.notifyName,
          secretaria: userState.mainMenu,
          tipo: 3, // Sugestão
          data: new Date().toISOString(),
          descricao: ""
        };
      }
      await chat.sendMessage(
        "Ok! Por favor, informe sua SUGESTÃO detalhada:\n\n*🔴 ATENÇÃO 🔴*\nApós informar sua sugestão, digite:\n\n*0*: Menu Inicial\n*00*: Finalizar Atendimento."
      );
      registrarMensagemBotNoHistorico(senderId, "Ok! Por favor, informe sua SUGESTÃO detalhada:\n\n*🔴 ATENÇÃO 🔴*\nApós informar sua sugestão, digite:\n\n*0*: Menu Inicial\n*00*: Finalizar Atendimento.");
      break;
    case "4":
      userState.subMenu = 1;
      registrarOpcao(senderId, "Tipo Atendimento", "4", "Elogio");
      registrarOpcaoMenuNoHistorico(senderId, "Elogio");
      if (!atendimentos[senderId]) {
        atendimentos[senderId] = {
          nome: msg._data.notifyName,
          secretaria: userState.mainMenu,
          tipo: 4, // Elogio
          data: new Date().toISOString(),
          descricao: ""
        };
      }
      await chat.sendMessage(
        "Ok! Por favor, informe seu ELOGIO detalhado:\n\n*🔴 ATENÇÃO 🔴*\nApós informar seu elogio, digite:\n\n*0*: Menu Inicial\n*00*: Finalizar Atendimento."
      );
      registrarMensagemBotNoHistorico(senderId, "Ok! Por favor, informe seu ELOGIO detalhado:\n\n*🔴 ATENÇÃO 🔴*\nApós informar seu elogio, digite:\n\n*0*: Menu Inicial\n*00*: Finalizar Atendimento.");
      break;
      case "5":
  userState.subMenu = 5;
  registrarOpcao(senderId, "Tipo Atendimento", "5", "Serviços e Informações\n\n*0*: Menu Inicial\n*00*: Finalizar Atendimento. ");
  registrarOpcaoMenuNoHistorico(senderId, "Serviços e Informações");
  if (!atendimentos[senderId]) {
    atendimentos[senderId] = {
      nome: msg._data.notifyName,
      secretaria: userState.mainMenu,
      tipo: 5, // Serviços e Informações
      data: new Date().toISOString(),
      servicoSelecionado: "", // Novo campo para armazenar o serviço selecionado
      detalhesAdicionais: "" // Novo campo para detalhes adicionais
    };
  }
        userState.subMenu = 5
        switch (userState.mainMenu) {
          case 1:
            await chat.sendMessage(getRuralEnvironmentServicesMenu())
            registrarMensagemBotNoHistorico(senderId, getRuralEnvironmentServicesMenu());
            break
          case 2:
            await chat.sendMessage(getSocialAssistanceServicesMenu())
            registrarMensagemBotNoHistorico(senderId, getSocialAssistanceServicesMenu());
            break
          case 3:
            await chat.sendMessage(getEducationSportsServicesMenu())
            registrarMensagemBotNoHistorico(senderId, getEducationSportsServicesMenu());
            break
          case 4:
            await chat.sendMessage(getInfrastructureSecurityServicesMenu())
            registrarMensagemBotNoHistorico(senderId, getInfrastructureSecurityServicesMenu());
            break
          case 5:
            await chat.sendMessage(getHealthWomensRightsServicesMenu())
            registrarMensagemBotNoHistorico(senderId, getHealthWomensRightsServicesMenu());
            break
          case 6:
            await chat.sendMessage(getHospitalMaternityServicesMenu())
            registrarMensagemBotNoHistorico(senderId, getHospitalMaternityServicesMenu());
            break
          case 7:
            await chat.sendMessage(getmulherSeguraServicesMenu())
            registrarMensagemBotNoHistorico(senderId, getmulherSeguraServicesMenu());
            break
          case 8:
            await chat.sendMessage(gettaxesfinanceServicesMenu())
            registrarMensagemBotNoHistorico(senderId, gettaxesfinanceServicesMenu());
            break
          case 9:
            await chat.sendMessage(getadministrationServicesMenu())
            registrarMensagemBotNoHistorico(senderId, getadministrationServicesMenu());
            break
        }
        break
      case "0":
        userState.mainMenu = 0
        userState.subMenu = 0
        userState.subSubMenu = 0
        await chat.sendMessage(getMainMenu())
        registrarMensagemBotNoHistorico(senderId, getMainMenu());
        break;
         }
    return
  }

if (userState.subMenu === 1 || userState.subMenu === 2) {
  // Se for uma reclamação ou denúncia (tipo 1 ou 2)
  if (atendimentos[senderId].tipo === 1 || atendimentos[senderId].tipo === 2) {
    // Verifica se já tem data/hora e local
    if (!atendimentos[senderId].dataOcorrido) {
      atendimentos[senderId].dataOcorrido = text;
      await chat.sendMessage("Obrigado! Agora por favor, informe o LOCAL do ocorrido:");
    } 
    else if (!atendimentos[senderId].localOcorrido) {
      atendimentos[senderId].localOcorrido = text;
      await chat.sendMessage("Obrigado! Por favor, descreva agora sua RECLAMAÇÃO/DENÚNCIA detalhadamente:\n\n*0*: Menu Inicial\n*00*: Finalizar Atendimento.");
    }
    else {
      // Se já tiver os dados básicos, armazena como descrição
      atendimentos[senderId].descricao = text;
    }
  } 
  else {
    // Para sugestões, elogios ou informações (tipo 3, 4 ou 5)
    if (atendimentos[senderId].tipo === 5 && atendimentos[senderId].servicoSelecionado && !atendimentos[senderId].detalhesAdicionais) {
      atendimentos[senderId].detalhesAdicionais = text;
    } else {
      atendimentos[senderId].descricao = text;
    }
  }
}

  // Processamento dos submenus de serviços
if (userState.subMenu === 5) {
  if (text === "0") {
    userState.subMenu = 0;
    userState.subSubMenu = 0;
    switch (userState.mainMenu) {
      case 1:
        await chat.sendMessage(getStandardSecretaryMenu("Sec. Desenv. Rural e Meio Ambiente"));
        break;
      case 2:
        await chat.sendMessage(getStandardSecretaryMenu("Sec. Assistência Social"));
        break;
      case 3:
        await chat.sendMessage(getStandardSecretaryMenu("Sec. Educação e Esporte"));
        break;
      case 4:
        await chat.sendMessage(getStandardSecretaryMenu("Sec. Infraest. e Seg. Pública"));
        break;
      case 5:
        await chat.sendMessage(getStandardSecretaryMenu("Sec. Saúde e Direitos da Mulher"));
        break;
      case 6:
        await chat.sendMessage(getStandardSecretaryMenu("Hosp. e Matern. Justa Maria Bezerra"));
        break;
      case 7:
        await chat.sendMessage(getStandardSecretaryMenu("Programa Mulher Segura"));
        break;
      case 8:
        await chat.sendMessage(getStandardSecretaryMenu("Sec. Finanças - Setor Tributário"));
        break;
      case 9:
        await chat.sendMessage(getStandardSecretaryMenu("Sec. Administração - Servidores Municipais"));
        break;
    }
    return;
  }

    if (userState.subSubMenu === 0) {
    switch (userState.mainMenu) {
      case 1: // Sec. Desenv. Rural e Meio Ambiente
        switch (text) {
          case "1":
    registrarOpcao(senderId, "Serviços Rurais", "1", "Manutenção de Estradas e Vias");
    registrarOpcaoMenuNoHistorico(senderId, "Manutenção de Estradas Rurais");
    atendimentos[senderId].servicoSelecionado = "Serviços Rurais - Manutenção de Estradas";
    
    const msgEstradas = "*MANUTENÇÃO DE ESTRADAS RURAIS*\n\n" +
                       "● Como solicitar:\n" +
                       "   - Informe o nome da estrada/via rural\n" +
                       "   - Descreva o problema encontrado\n" +
                       "   - Envie a localização ou pontos de referência\n\n" +
                       "🔴 ATENÇÃO 🔴\n" +
                       "Priorizamos vias com maior fluxo de transporte\n" +
                       "Prazo médio para avaliação: 5 dias úteis\n\n" +
                       "*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
    
    await chat.sendMessage(msgEstradas);
    registrarMensagemBotNoHistorico(senderId, msgEstradas);
    break;

case "2":
    registrarOpcao(senderId, "Serviços Rurais", "2", "Programa de Aração de Terras");
    registrarOpcaoMenuNoHistorico(senderId, "Aração de Terras");
    atendimentos[senderId].servicoSelecionado = "Serviços Rurais - Aração de Terras";
    
    const msgAracao = "*PROGRAMA DE ARAÇÃO DE TERRAS*\n\n" +
                      "● Documentos necessários:\n" +
                      "   - Documento de posse da terra\n" +
                      "   - RG e CPF do solicitante\n" +
                      "   - Comprovante de residência\n\n" +
                      "● Local:\n" +
                      "   - Secretaria de Agricultura\n" +
                      "   - Horário: 8h às 13h (segunda a sexta)\n\n" +
                      "🔴 ATENÇÃO 🔴\n" +
                      "Vagas limitadas - Prioridade para pequenos produtores\n\n" +
                      "*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
    
    await chat.sendMessage(msgAracao);
    registrarMensagemBotNoHistorico(senderId, msgAracao);
    break;

case "3":
    registrarOpcao(senderId, "Serviços Rurais", "3", "Distribuição de Sementes");
    registrarOpcaoMenuNoHistorico(senderId, "Distribuição de Sementes");
    atendimentos[senderId].servicoSelecionado = "Serviços Rurais - Distribuição de Sementes";
    
    const msgSementes = "*PROGRAMA DE DISTRIBUIÇÃO DE SEMENTES*\n\n" +
                       "● Requisitos:\n" +
                       "   - Cadastro no programa agrícola municipal\n" +
                       "   - Comprovante de propriedade/arrendamento\n" +
                       "   - Documento de identificação\n\n" +
                       "● Período:\n" +
                       "   - Distribuição semestral\n" +
                       "   - Próxima edição: Agosto/2023\n\n" +
                       "🔴 ATENÇÃO 🔴\n" +
                       "Quantidade limitada por família\n\n" +
                       "*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
    
    await chat.sendMessage(msgSementes);
    registrarMensagemBotNoHistorico(senderId, msgSementes);
    break;

case "4":
    registrarOpcao(senderId, "Serviços Rurais", "4", "Distribuição de Água");
    registrarOpcaoMenuNoHistorico(senderId, "Distribuição de Água");
    atendimentos[senderId].servicoSelecionado = "Serviços Rurais - Distribuição de Água";
    
    const msgAgua = "*PROGRAMA DE DISTRIBUIÇÃO DE ÁGUA*\n\n" +
                   "● Como participar:\n" +
                   "   - Cadastro prévio na Secretaria de Agricultura\n" +
                   "   - Comprovar necessidade hídrica\n" +
                   "   - Ter propriedade na zona rural\n\n" +
                   "● Frequência:\n" +
                   "   - Caminhão-pipa: quinzenal\n" +
                   "   - Prioridade para áreas críticas\n\n" +
                   "🔴 ATENÇÃO 🔴\n" +
                   "Emergências: contatar Defesa Civil\n" +
                   "Telefone: (XX) XXXX-XXXX\n\n" +
                   "*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
    
    await chat.sendMessage(msgAgua);
    registrarMensagemBotNoHistorico(senderId, msgAgua);
    break;
                 }
                 break;

        case 2: // Sec. Assistência Social
        switch (text) {
          case "1":
            userState.subSubMenu = 1;
            registrarOpcao(senderId, "Ação Social", "1", "CADASTRO ÚNICO");
            registrarOpcaoMenuNoHistorico(senderId, "Cadastro Único para Programas Sociais");
            atendimentos[senderId].servicoSelecionado = "Cadastro Único para Programas Sociais";
            await chat.sendMessage(getUniqueRegistrationMenu());
            registrarMensagemBotNoHistorico(senderId, getUniqueRegistrationMenu());
            break;
        
        case "2":
            userState.subSubMenu = 2;
            registrarOpcao(senderId, "Ação Social", "2", "CRAS");
            registrarOpcaoMenuNoHistorico(senderId, "Centro de Referência de Assistência Social (CRAS)");
            atendimentos[senderId].servicoSelecionado = "Centro de Referência de Assistência Social (CRAS)";
            await chat.sendMessage(getCRASMenu());
            registrarMensagemBotNoHistorico(senderId, getCRASMenu());
            break;
        
        case "3":
            userState.subSubMenu = 3;
            registrarOpcao(senderId, "Ação Social", "3", "CREAS");
            registrarOpcaoMenuNoHistorico(senderId, "Centro de Referência Especializado de Assistência Social (CREAS)");
            atendimentos[senderId].servicoSelecionado = "Centro de Referência Especializado de Assistência Social (CREAS)";
            await chat.sendMessage(getCREASMenu());
            registrarMensagemBotNoHistorico(senderId, getCREASMenu());
            break;
          default:
            await chat.sendMessage("Opção inválida. Por favor, escolha uma opção válida.");
        }
        break;
        case 3: // Sec. Educação e Esporte
        switch (text) {
          case "1":
    registrarOpcao(senderId, "Educação", "1", "Matrícula Escolar");
    registrarOpcaoMenuNoHistorico(senderId, "Matrícula Escolar");
    atendimentos[senderId].servicoSelecionado = "Educação - Matrícula Escolar";
    const msgMatricula = "*MATRÍCULA ESCOLAR*\n\n" +
                        "● Como realizar:\n" +
                        "   - Compareça à secretaria da escola\n" +
                        "   - Leve documentos pessoais e comprovante de residência\n" +
                        "   - Escolas mais próximas do seu endereço\n\n" +
                        "🔴 ATENÇÃO 🔴\n" +
                        "Período de matrículas: 01/11 a 30/11\n\n" +
                        "*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
    await chat.sendMessage(msgMatricula);
    registrarMensagemBotNoHistorico(senderId, msgMatricula);
    break;

case "2":
    registrarOpcao(senderId, "Educação", "2", "Reforço Escolar");
    registrarOpcaoMenuNoHistorico(senderId, "Reforço Escolar");
    atendimentos[senderId].servicoSelecionado = "Educação - Reforço Escolar";
    const msgReforco = "*REFORÇO ESCOLAR*\n\n" +
                      "● Situação atual:\n" +
                      "   - Programa temporariamente suspenso\n" +
                      "   - Nova data será divulgada\n\n" +
                      "● Acompanhe:\n" +
                      "   - Site: https://venturosa.pe.gov.br/\n" +
                      "   - Redes sociais oficiais\n\n" +
                      "🔴 ATENÇÃO 🔴\n" +
                      "Retomaremos assim que possível\n\n" +
                      "*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
    await chat.sendMessage(msgReforco);
    registrarMensagemBotNoHistorico(senderId, msgReforco);
    break;

case "3":
    registrarOpcao(senderId, "Educação", "3", "Histórico Escolar");
    registrarOpcaoMenuNoHistorico(senderId, "Histórico Escolar");
    atendimentos[senderId].servicoSelecionado = "Educação - Histórico Escolar";
    const msgHistorico = "*EMISSÃO DE HISTÓRICO ESCOLAR*\n\n" +
                        "● Como solicitar:\n" +
                        "   - Compareça à secretaria da escola\n" +
                        "   - Leve documento de identificação\n" +
                        "   - Prazo: 5 dias úteis\n\n" +
                        "🔴 ATENÇÃO 🔴\n" +
                        "Para alunos ativos: gratuito\n" +
                        "Para ex-alunos: taxa de R$ 15,00\n\n" +
                        "*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
    await chat.sendMessage(msgHistorico);
    registrarMensagemBotNoHistorico(senderId, msgHistorico);
    break;

case "4":
    registrarOpcao(senderId, "Educação", "4", "Declarações Escolares");
    registrarOpcaoMenuNoHistorico(senderId, "Declarações Escolares");
    atendimentos[senderId].servicoSelecionado = "Educação - Declarações Escolares";
    const msgDeclaracoes = "*DECLARAÇÕES ESCOLARES*\n\n" +
                          "● Tipos disponíveis:\n" +
                          "   - Frequência escolar\n" +
                          "   - Matrícula ativa\n" +
                          "   - Conclusão de série\n\n" +
                          "● Como solicitar:\n" +
                          "   - Secretaria da escola do aluno\n" +
                          "   - Prazo: 2 dias úteis\n\n" +
                          "🔴 ATENÇÃO 🔴\n" +
                          "Documentos necessários: RG do responsável\n\n" +
                          "*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
    await chat.sendMessage(msgDeclaracoes);
    registrarMensagemBotNoHistorico(senderId, msgDeclaracoes);
    break;

case "5":
    registrarOpcao(senderId, "Educação", "5", "Transporte Universitário");
    registrarOpcaoMenuNoHistorico(senderId, "Transporte Universitário");
    atendimentos[senderId].servicoSelecionado = "Educação - Transporte Universitário";
    const msgTransporte = "*TRANSPORTE UNIVERSITÁRIO*\n\n" +
                         "● Documentos necessários:\n" +
                         "   - RG e CPF\n" +
                         "   - Comprovante de matrícula\n" +
                         "   - Comprovante de residência\n\n" +
                         "● Local:\n" +
                         "   - Secretaria de Educação e Esporte\n" +
                         "   - Horário: 8h às 14h\n\n" +
                         "🔴 ATENÇÃO 🔴\n" +
                         "Vagas limitadas - Prioridade por ordem de chegada\n\n" +
                         "*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
    await chat.sendMessage(msgTransporte);
    registrarMensagemBotNoHistorico(senderId, msgTransporte);
    break;
                }
                break;
        case 4: // Sec. Infraest. e Seg. Pública
        switch (text) {
          case "1":
    registrarOpcao(senderId, "Serviços e Obras", "1", "Iluminação Pública");
    registrarOpcaoMenuNoHistorico(senderId, "Iluminação Pública");
    atendimentos[senderId].servicoSelecionado = "Serviços e Obras - Iluminação Pública";
    const msgIluminacao = "*ILUMINAÇÃO PÚBLICA*\n\n" +
                        "● Como solicitar:\n" +
                        "   - Informe o endereço completo\n" +
                        "   - Número do poste afetado\n" +
                        "   - Ou envie uma foto como referência\n\n" +
                        "🔴 ATENÇÃO 🔴\n" +
                        "Solicitações serão encaminhadas para a equipe técnica\n\n" +
                        "*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
    await chat.sendMessage(msgIluminacao);
    registrarMensagemBotNoHistorico(senderId, msgIluminacao);
    break;

case "2":
    registrarOpcao(senderId, "Serviços e Obras", "2", "Saneamento Básico");
    registrarOpcaoMenuNoHistorico(senderId, "Saneamento Básico");
    atendimentos[senderId].servicoSelecionado = "Serviços e Obras - Saneamento Básico";
    const msgSaneamento = "*SANEAMENTO BÁSICO*\n\n" +
                         "● Como solicitar:\n" +
                         "   - Informe o endereço completo\n" +
                         "   - Descreva o problema encontrado\n" +
                         "   - Envie foto como referência (opcional)\n\n" +
                         "🔴 ATENÇÃO 🔴\n" +
                         "Problemas urgentes serão priorizados\n\n" +
                         "*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
    await chat.sendMessage(msgSaneamento);
    registrarMensagemBotNoHistorico(senderId, msgSaneamento);
    break;

case "3":
    registrarOpcao(senderId, "Serviços e Obras", "3", "Pavimentação");
    registrarOpcaoMenuNoHistorico(senderId, "Pavimentação");
    atendimentos[senderId].servicoSelecionado = "Serviços e Obras - Pavimentação";
    const msgPavimentacao = "*PAVIMENTAÇÃO (Manutenção)*\n\n" +
                           "● Como solicitar:\n" +
                           "   - Informe o endereço completo\n" +
                           "   - Descreva o tipo de reparo necessário\n" +
                           "   - Envie foto do local afetado\n\n" +
                           "🔴 ATENÇÃO 🔴\n" +
                           "Solicitações serão avaliadas por ordem de gravidade\n\n" +
                           "*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
    await chat.sendMessage(msgPavimentacao);
    registrarMensagemBotNoHistorico(senderId, msgPavimentacao);
    break;

case "4":
    registrarOpcao(senderId, "Serviços e Obras", "4", "Limpeza Urbana");
    registrarOpcaoMenuNoHistorico(senderId, "Limpeza Urbana");
    atendimentos[senderId].servicoSelecionado = "Serviços e Obras - Limpeza Urbana";
    const msgLimpeza = "*LIMPEZA URBANA (Entulho)*\n\n" +
                      "● Como solicitar:\n" +
                      "   - Informe o endereço completo\n" +
                      "   - Descreva o tipo de resíduo\n" +
                      "   - Envie foto do material a ser removido\n\n" +
                      "🔴 ATENÇÃO 🔴\n" +
                      "Descarte irregular pode acarretar multas\n\n" +
                      "*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
    await chat.sendMessage(msgLimpeza);
    registrarMensagemBotNoHistorico(senderId, msgLimpeza);
    break;

case "5":
    registrarOpcao(senderId, "Serviços e Obras", "5", "Coleta de Lixo");
    registrarOpcaoMenuNoHistorico(senderId, "Coleta de Lixo");
    atendimentos[senderId].servicoSelecionado = "Serviços e Obras - Coleta de Lixo";
    const msgColeta = "*COLETA DE LIXO*\n\n" +
                     "● Dias e Horários:\n" +
                     "   - *Segunda:* Toda cidade - 7:00\n" +
                     "   - *Terça:* Centro (Após Feira) - 16:00\n" +
                     "   - *Quarta:* Bairros (Exceto Boa Vista) - 7:00\n" +
                     "   - *Quinta:* Bairros (Exceto Arco-Íris) - 7:00\n" +
                     "   - *Sexta:* Bairros (Exceto Boa Vista) - 7:00\n" +
                     "   - *Sábado:* Centro e Sítios - 7:00\n" +
                     "   - *Domingo:* Centro (Comércio) - 7:00\n\n" +
                     "🔴 ATENÇÃO 🔴\n" +
                     "Respeite os horários para evitar multas\n\n" +
                     "*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
    await chat.sendMessage(msgColeta);
    registrarMensagemBotNoHistorico(senderId, msgColeta);
    break;

case "6":
    registrarOpcao(senderId, "Segurança", "6", "Guarda Municipal");
    registrarOpcaoMenuNoHistorico(senderId, "Guarda Municipal");
    atendimentos[senderId].servicoSelecionado = "Segurança - Guarda Municipal";
    const msgGuarda = "*GUARDA MUNICIPAL (Eventos)*\n\n" +
                     "● Como solicitar:\n" +
                     "   - Comparecer presencialmente\n" +
                     "   - Local: Secretaria de Segurança\n" +
                     "   - Verificar disponibilidade\n\n" +
                     "🔴 ATENÇÃO 🔴\n" +
                     "Solicitações com 15 dias de antecedência\n\n" +
                     "*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
    await chat.sendMessage(msgGuarda);
    registrarMensagemBotNoHistorico(senderId, msgGuarda);
    break;
          }
          break;
        case 5: // Sec. Saúde e Direitos da Mulher
        switch (text) {
          case "1":
    userState.subSubMenu = 1;
    registrarOpcao(senderId, "Serviços de Saúde", "1", "CEM");
    registrarOpcaoMenuNoHistorico(senderId, "Centro de Especialidades Médicas (CEM)");
    atendimentos[senderId].servicoSelecionado = "Centro de Especialidades Médicas (CEM)";
    await chat.sendMessage(getCEMMenu());
    registrarMensagemBotNoHistorico(senderId, getCEMMenu());
    break;
    
case "2":
    userState.subSubMenu = 2;
    registrarOpcao(senderId, "Serviços de Saúde", "2", "CEO");
    registrarOpcaoMenuNoHistorico(senderId, "Centro de Especialidades Odontológicas (CEO)");
    atendimentos[senderId].servicoSelecionado = "Centro de Especialidades Odontológicas (CEO)";
    await chat.sendMessage(getCEOMenu());
    registrarMensagemBotNoHistorico(senderId, getCEOMenu());
    break;
    
case "3":
    userState.subSubMenu = 3;
    registrarOpcao(senderId, "Serviços de Saúde", "3", "Centro de Fisioterapia");
    registrarOpcaoMenuNoHistorico(senderId, "Centro de Fisioterapia");
    atendimentos[senderId].servicoSelecionado = "Centro de Fisioterapia";
    await chat.sendMessage(getPhysiotherapyCenterMenu());
    registrarMensagemBotNoHistorico(senderId, getPhysiotherapyCenterMenu());
    break;
    
case "4":
    userState.subSubMenu = 4;
    registrarOpcao(senderId, "Serviços de Saúde", "4", "Centro de Imagens");
    registrarOpcaoMenuNoHistorico(senderId, "Centro de Imagens");
    atendimentos[senderId].servicoSelecionado = "Centro de Imagens";
    await chat.sendMessage(getImageCenterMenu());
    registrarMensagemBotNoHistorico(senderId, getImageCenterMenu());
    break;
    
case "5":
    userState.subSubMenu = 5;
    registrarOpcao(senderId, "Serviços de Saúde", "5", "UBSF");
    registrarOpcaoMenuNoHistorico(senderId, "Unidade Básica de Saúde da Família (UBSF)");
    atendimentos[senderId].servicoSelecionado = "Unidade Básica de Saúde da Família (UBSF)";
    await chat.sendMessage(getUBSFMenu());
    registrarMensagemBotNoHistorico(senderId, getUBSFMenu());
    break;
          default:
            await chat.sendMessage("Opção inválida. Por favor, escolha uma opção válida.");
        }
        break;
        case 6: // Hosp. e Matern. Justa Mª Bezerra
        switch (text) {
          case "1":
    userState.subSubMenu = 1;
    registrarOpcao(senderId, "Hosp. e Matern.", "1", "Exames Laboratoriais");
    registrarOpcaoMenuNoHistorico(senderId, "Exames Laboratoriais");
    atendimentos[senderId].servicoSelecionado = "Exames Laboratoriais";
    await chat.sendMessage(getLaboratoryTestsMenu());
    registrarMensagemBotNoHistorico(senderId, getLaboratoryTestsMenu());
    break;
          default:
            await chat.sendMessage("Opção inválida. Por favor, escolha uma opção válida.");
        }
        break;
        
        case 7: // Programa Mulher Segura
        switch (text) {
          case "1":
  registrarOpcao(senderId, "Mulher Segura", "1", "Atendimento Psicossocial");
  registrarOpcaoMenuNoHistorico(senderId, "Atendimento Psicossocial");
  atendimentos[senderId].servicoSelecionado = "Mulher Segura - Atendimento Psicossocial";
  const msgAtendimento1 = "*PROGRAMA MULHER SEGURA - ATENDIMENTO PSICOSSOCIAL*\n\n" +
                        "● Serviço oferecido:\n" +
                        "   - Acompanhamento psicológico\n" +
                        "   - Suporte emocional\n" +
                        "   - Orientação social\n\n" +
                        "● Como acessar:\n" +
                        "   - Presencial: Secretaria de Saúde e Direitos da Mulher\n" +
                        "   - Telefone: (XX) XXXX-XXXX\n" +
                        "   - Horário: 8h às 17h (segunda a sexta)\n\n" +
                        "🔴 ATENÇÃO 🔴\n" +
                        "Atendimento prioritário para mulheres em situação de vulnerabilidade\n\n" +
                        "*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
  await chat.sendMessage(msgAtendimento1);
  registrarMensagemBotNoHistorico(senderId, msgAtendimento1);
  break;

case "2":
  registrarOpcao(senderId, "Mulher Segura", "2", "Atendimento Jurídico");
  registrarOpcaoMenuNoHistorico(senderId, "Atendimento Jurídico");
  atendimentos[senderId].servicoSelecionado = "Mulher Segura - Atendimento Jurídico";
  const msgAtendimento2 = "*PROGRAMA MULHER SEGURA - ATENDIMENTO JURÍDICO*\n\n" +
                        "● Serviço oferecido:\n" +
                        "   - Orientação jurídica\n" +
                        "   - Acompanhamento legal\n" +
                        "   - Medidas protetivas\n\n" +
                        "● Como acessar:\n" +
                        "   - Presencial: Secretaria de Saúde e Direitos da Mulher\n" +
                        "   - Telefone: (XX) XXXX-XXXX\n" +
                        "   - Horário: 8h às 17h (segunda a sexta)\n\n" +
                        "🔴 ATENÇÃO 🔴\n" +
                        "Documentos necessários: RG, CPF e comprovante de residência\n\n" +
                        "*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
  await chat.sendMessage(msgAtendimento2);
  registrarMensagemBotNoHistorico(senderId, msgAtendimento2);
  break;
case "3":
  registrarOpcao(senderId, "Mulher Segura", "3", "Acolhimento Emergencial");
  registrarOpcaoMenuNoHistorico(senderId, "Acolhimento Emergencial");
  atendimentos[senderId].servicoSelecionado = "Mulher Segura - Acolhimento Emergencial";
  const msgAtendimento3 = "*PROGRAMA MULHER SEGURA - ACOLHIMENTO EMERGENCIAL*\n\n" +
                        "● Serviço oferecido:\n" +
                        "   - Abrigo temporário\n" +
                        "   - Apoio imediato\n" +
                        "   - Rede de proteção\n\n" +
                        "● Como acessar:\n" +
                        "   - Plantão 24h: (XX) XXXX-XXXX\n" +
                        "   - Presencial: CRAM (Centro de Referência)\n" +
                        "   - Disque 180 para denúncias\n\n" +
                        "🔴 ATENÇÃO 🔴\n" +
                        "Serviço disponível 24 horas para casos de urgência\n\n" +
                        "*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
  await chat.sendMessage(msgAtendimento3);
  registrarMensagemBotNoHistorico(senderId, msgAtendimento3);
  break;
case "16":
  registrarOpcao(senderId, "Administração", "16", "DTC - Declaração de Tempo de Contribuição");
  registrarOpcaoMenuNoHistorico(senderId, "DTC - Declaração de Tempo de Contribuição");
  atendimentos[senderId].servicoSelecionado = "DTC - Declaração de Tempo de Contribuição";
  const msgDTC = "*DTC - Declaração de Tempo de Contribuição*\n\n" +
                "● Forma Presencial:\n" +
                "   - Local: Secretaria de Administração\n\n" +
                "🔴 ATENÇÃO 🔴\n" +
                "As informações serão encaminhadas automaticamente ao setor responsável\n\n" +
                "*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
  await chat.sendMessage(msgDTC);
  registrarMensagemBotNoHistorico(senderId, msgDTC);
  break;
                }
            }
      return
    }

    // Processamento dos sub-submenus (nível mais profundo)
  if (userState.subSubMenu !== 0) {
    if (text === "0") {
      // Volta para o menu de serviços da secretaria
      userState.subSubMenu = 0;
      switch (userState.mainMenu) {
        case 2:
          await chat.sendMessage(getSocialAssistanceServicesMenu());
          break;
        case 5:
          await chat.sendMessage(getHealthWomensRightsServicesMenu());
          break;
        case 6:
          await chat.sendMessage(getHospitalMaternityServicesMenu());
          break;
      }
      return;
    }

      // Processa as opções específicas de cada sub-submenu
    switch (userState.mainMenu) {
      case 2: // Sec. Assistência Social
        switch (userState.subSubMenu) {
          case 1: // CADASTRO ÚNICO
            switch (text) {
              case "1":
                registrarOpcao(senderId, "Cadastro Único", "1", "Programa Bolsa Família");
                registrarOpcaoMenuNoHistorico(senderId, "Programa Bolsa Família");
                atendimentos[senderId].servicoDetalhado = "Programa Bolsa Família - Cadastro/Atualização";
                const msgBolsaFamilia = "*PROGRAMA BOLSA FAMÍLIA*\n\n" +
                                       "● Local: Centro Comunitário Cultural\n" +
                                       "● Horário: 8:00 às 13:00 hs\n" +
                                       "● Documentos necessários:\n   - Documentação de todos os residentes no domicílio\n" +
                                       "● Serviço: Novo cadastro ou atualização cadastral\n\n" +
                "*0*: Menu Inicial\n" +
                "*00*: Finalizar Atendimento.";
                await chat.sendMessage(msgBolsaFamilia);
                registrarMensagemBotNoHistorico(senderId, msgBolsaFamilia);
                break;
              
              case "2":
                registrarOpcao(senderId, "Cadastro Único", "2", "Tarifa Social de Energia Elétrica");
                registrarOpcaoMenuNoHistorico(senderId, "Tarifa Social de Energia Elétrica");
                atendimentos[senderId].servicoDetalhado = "Tarifa Social de Energia Elétrica - Benefício";
                const msgTarifaSocial = "*TARIFA SOCIAL DE ENERGIA ELÉTRICA*\n\n" +
                                       "● Cadastro Único:\n" +
                                       "   - Local: Centro Comunitário Cultural\n" +
                                       "   - Horário: 8:00 às 13:00 hs\n\n" +
                                       "● Solicitação do benefício:\n" +
                                       "   - Site: https://agenciavirtual.neoenergia.com/#/login\n" +
                                       "   - Loja de Atendimento: Farmácia de Nininho\n" +
                                       "   - Teleatendimento: 0800 701 01 02\n\n" +
                                       "*0*: Menu Inicial\n" +
                                       "*00*: Finalizar Atendimento.";
                await chat.sendMessage(msgTarifaSocial);
                registrarMensagemBotNoHistorico(senderId, msgTarifaSocial);
                break;
              
              case "3":
                registrarOpcao(senderId, "Cadastro Único", "3", "Auxílio Gás dos Brasileiros");
                registrarOpcaoMenuNoHistorico(senderId, "Auxílio Gás dos Brasileiros");
                atendimentos[senderId].servicoDetalhado = "Auxílio Gás dos Brasileiros - Benefício";
                const msgAuxilioGas = "*AUXÍLIO GÁS DOS BRASILEIROS*\n\n" +
                                     "● Cadastro Único:\n" +
                                     "   - Local: Centro Comunitário Cultural\n" +
                                     "   - Horário: 8:00 às 13:00 hs\n\n" +
                                     "● Solicitação do benefício:\n" +
                                     "   - Aplicativo Bolsa Família\n" +
                                     "   - Aplicativo Caixa Tem\n\n" +
                                     "*0*: Menu Inicial\n" +
                                     "*00*: Finalizar Atendimento.";
                await chat.sendMessage(msgAuxilioGas);
                registrarMensagemBotNoHistorico(senderId, msgAuxilioGas);
                break;
              case "0":
                  userState.subSubMenu = 0;
                  await chat.sendMessage(getHealthWomensRightsServicesMenu());
                  break;
                  }
                  break;
           
          case 2: // CRAS
            switch (text) {
              case "1":
                registrarOpcao(senderId, "CRAS", "1", "PAIF");
                registrarOpcaoMenuNoHistorico(senderId, "PAIF");
                atendimentos[senderId].servicoDetalhado = "PAIF - Proteção e Atendimento Integral a Família";
                const msgPaif = "*SERVIÇO DE PROTEÇÃO E ATENDIMENTO INTEGRAL A FAMÍLIA - PAIF*\n\n" +
                               "● Local: Secretaria de Assistência Social\n" +
                               "● Horário: 8:00 às 13:00 hs\n" +
                               "● Serviço: Apoio a famílias em situação de vulnerabilidade\n\n" +
                               "*0*: Menu Inicial\n" +
                               "*00*: Finalizar Atendimento.";
                await chat.sendMessage(msgPaif);
                registrarMensagemBotNoHistorico(senderId, msgPaif);
                break;
              
              case "2":
                registrarOpcao(senderId, "CRAS", "2", "Carteira do Idoso");
                registrarOpcaoMenuNoHistorico(senderId, "Carteira do Idoso");
                atendimentos[senderId].servicoDetalhado = "Carteira do Idoso - Benefício para maiores de 60 anos";
                const msgIdoso = "*CARTEIRA DO IDOSO*\n\n" +
                                "● Local: Secretaria de Assistência Social\n" +
                                "● Horário: 8:00 às 13:00 hs\n" +
                                "● Requisitos: Idosos a partir de 60 anos com renda inferior a 2 salários mínimos\n\n" +
                                "*0*: Menu Inicial\n" +
                                "*00*: Finalizar Atendimento.";
                await chat.sendMessage(msgIdoso);
                registrarMensagemBotNoHistorico(senderId, msgIdoso);
                break;
              
              case "3":
                registrarOpcao(senderId, "CRAS", "3", "Programa Criança Feliz");
                registrarOpcaoMenuNoHistorico(senderId, "Programa Criança Feliz");
                atendimentos[senderId].servicoDetalhado = "Programa Criança Feliz - Acompanhamento infantil";
                const msgCriancaFeliz = "*PROGRAMA CRIANÇA FELIZ*\n\n" +
                                       "● Local: Secretaria de Assistência Social\n" +
                                       "● Horário: 8:00 às 13:00 hs\n" +
                                       "● Serviço: Acompanhamento de gestantes e crianças na primeira infância (0 a 6 anos)\n" +
                                       "● Orientações: Compareça a secretaria para mais informações\n\n" +
                                       "*0*: Menu Inicial\n" +
                                       "*00*: Finalizar Atendimento.";
                await chat.sendMessage(msgCriancaFeliz);
                registrarMensagemBotNoHistorico(senderId, msgCriancaFeliz);
                break;
              
              case "4":
                registrarOpcao(senderId, "CRAS", "4", "Serviço de Convivência do Idoso");
                registrarOpcaoMenuNoHistorico(senderId, "Serviço de Convivência do Idoso");
                atendimentos[senderId].servicoDetalhado = "Serviço de Convivência do Idoso - Atividades para idosos";
                const msgConvivIdoso = "*SERVIÇO DE CONVIVÊNCIA DO IDOSO*\n\n" +
                                      "● Local: Secretaria de Assistência Social\n" +
                                      "● Horário: 8:00 às 13:00 hs\n" +
                                      "● Serviço: Atividades esportivas, educacionais e de lazer para os idosos\n" +
                                      "● Orientações: Compareça a secretaria para mais informações\n\n" +
                                      "*0*: Menu Inicial\n" +
                                      "*00*: Finalizar Atendimento.";
                await chat.sendMessage(msgConvivIdoso);
                registrarMensagemBotNoHistorico(senderId, msgConvivIdoso);
                break;
              
              case "5":
                registrarOpcao(senderId, "CRAS", "5", "Serviço de Convivência e Fortalecimento de Vínculos");
                registrarOpcaoMenuNoHistorico(senderId, "Serviço de Convivência e Fortalecimento de Vínculos");
                atendimentos[senderId].servicoDetalhado = "Serviço de Convivência e Fortalecimento de Vínculos - Atividades grupais";
                const msgConvivVinculos = "*SERVIÇO DE CONVIVÊNCIA E FORTALECIMENTO DE VÍNCULOS*\n\n" +
                                         "● Local: Secretaria de Assistência Social\n" +
                                         "● Horário: 8:00 às 13:00 hs\n" +
                                         "● Serviço: Atividades em grupo por faixa etária (culturais, esportivas, educacionais e de lazer)\n" +
                                         "● Orientações: Compareça a secretaria para mais informações\n\n" +
                                         "*0*: Menu Inicial\n" +
                                         "*00*: Finalizar Atendimento.";
                await chat.sendMessage(msgConvivVinculos);
                registrarMensagemBotNoHistorico(senderId, msgConvivVinculos);
                break;
              
              case "6":
                registrarOpcao(senderId, "CRAS", "6", "BPC");
                registrarOpcaoMenuNoHistorico(senderId, "Benefício de Prestação Continuada");
                atendimentos[senderId].servicoDetalhado = "BPC - Benefício de Prestação Continuada";
                const msgBpc = "*BENEFÍCIO DE PRESTAÇÃO CONTINUADA - BPC*\n\n" +
                              "● Local: Secretaria de Assistência Social\n" +
                              "● Horário: 8:00 às 13:00 hs\n" +
                              "● Serviço: BPC na Escola, BPC por Idade e BPC por Deficiência\n" +
                              "● Orientações: Compareça a secretaria para mais informações\n\n" +
                              "*0*: Menu Inicial\n" +
                              "*00*: Finalizar Atendimento.";
                await chat.sendMessage(msgBpc);
                registrarMensagemBotNoHistorico(senderId, msgBpc);
                break;
              
              case "7":
                registrarOpcao(senderId, "CRAS", "7", "Programa Bom Prato");
                registrarOpcaoMenuNoHistorico(senderId, "Programa Bom Prato");
                atendimentos[senderId].servicoDetalhado = "Programa Bom Prato - Refeições gratuitas";
                const msgBomPrato = "*PROGRAMA BOM PRATO - PBP*\n\n" +
                                   "● Local: Vila Mutirão - Rua 4 S/N - Boa Vista\n" +
                                   "● Horário: 16:00 às 17:00 hs\n" +
                                   "● Serviço: Refeições gratuitas para pessoas em vulnerabilidade\n" +
                                   "● Informações: 200 unidades do Governo do Estado + 200 do Municipal\n\n" +
                                   "*0*: Menu Inicial\n" +
                                   "*00*: Finalizar Atendimento.";
                await chat.sendMessage(msgBomPrato);
                registrarMensagemBotNoHistorico(senderId, msgBomPrato);
                break;
              
              case "8":
                registrarOpcao(senderId, "CRAS", "8", "PAA");
                registrarOpcaoMenuNoHistorico(senderId, "Programa do Leite (PAA)");
                atendimentos[senderId].servicoDetalhado = "PAA - Programa do Leite";
                const msgPaa = "*PROGRAMA DO LEITE - PAA*\n\n" +
                              "● Local: Secretaria de Assistência Social\n" +
                              "● Horário: 8:00 às 13:00 hs\n" +
                              "● Serviço: Distribuição de leite para famílias cadastradas no CadÚnico\n" +
                              "● Prioridade: Famílias do perfil do Bolsa Família\n\n" +
                              "*0*: Menu Inicial\n" +
                              "*00*: Finalizar Atendimento.";
                await chat.sendMessage(msgPaa);
                registrarMensagemBotNoHistorico(senderId, msgPaa);
                break;
              
              case "9":
                registrarOpcao(senderId, "CRAS", "9", "Benefícios Eventuais");
                registrarOpcaoMenuNoHistorico(senderId, "Benefícios Eventuais");
                atendimentos[senderId].servicoDetalhado = "Benefícios Eventuais - Auxílios diversos";
                const msgBenefEventuais = "*BENEFÍCIOS EVENTUAIS*\n\n" +
                                         "● Local: Secretaria de Assistência Social\n" +
                                         "● Horário: 8:00 às 13:00 hs\n" +
                                         "● Serviço: Kit Natalidade, Auxílio Funerário, Aluguel Social, Cestas Básicas\n" +
                                         "● Orientações: Compareça a secretaria para mais informações\n\n" +
                                         "*0*: Menu Inicial\n" +
                                         "*00*: Finalizar Atendimento.";
                await chat.sendMessage(msgBenefEventuais);
                registrarMensagemBotNoHistorico(senderId, msgBenefEventuais);
                break;
              
              case "10":
                registrarOpcao(senderId, "CRAS", "10", "Olhar para as Diferenças");
                registrarOpcaoMenuNoHistorico(senderId, "Programa Olhar para as Diferenças");
                atendimentos[senderId].servicoDetalhado = "Olhar para as Diferenças - Inclusão de PCDs";
                const msgOlharDif = "*PROGRAMA OLHAR PARA AS DIFERENÇAS*\n\n" +
                                   "● Local: Secretaria de Assistência Social\n" +
                                   "● Horário: 8:00 às 13:00 hs\n" +
                                   "● Serviço: Inclusão e atendimento de pessoas com deficiência\n" +
                                   "● Áreas: Saúde, educação e assistência social\n\n" +
                                   "*0*: Menu Inicial\n" +
                                   "*00*: Finalizar Atendimento.";
                await chat.sendMessage(msgOlharDif);
                registrarMensagemBotNoHistorico(senderId, msgOlharDif);
                break;
              
              case "11":
                registrarOpcao(senderId, "CRAS", "11", "Carteira do Autista");
                registrarOpcaoMenuNoHistorico(senderId, "Carteira do Autista");
                atendimentos[senderId].servicoDetalhado = "Carteira do Autista - CIPTEA";
                const msgAutista = "*CARTEIRA DO AUTISTA*\n\n" +
                                  "● Local: Secretaria de Assistência Social\n" +
                                  "● Horário: 8:00 às 13:00 hs\n" +
                                  "● Serviço: Carteira de Identificação da Pessoa com TEA (CIPTEA)\n" +
                                  "● Benefícios: Prioridade no atendimento em serviços públicos/privados\n\n" +
                                  "*0*: Menu Inicial\n" +
                                  "*00*: Finalizar Atendimento.";
                await chat.sendMessage(msgAutista);
                registrarMensagemBotNoHistorico(senderId, msgAutista);
                break;
          
              case "0":
                  userState.subSubMenu = 0;
                  await chat.sendMessage(getHealthWomensRightsServicesMenu());
                  break;
                }
                break;
       
            case 3: // CREAS
            switch (text) {
              case "1":
                registrarOpcao(senderId, "CREAS", "1", "PAEFI");
                registrarOpcaoMenuNoHistorico(senderId, "PAEFI");
                atendimentos[senderId].servicoDetalhado = "PAEFI - Atendimento Especializado a Famílias";
                const msgPaefi = "*SERVIÇO DE PROTEÇÃO E ATENDIMENTO ESPECIALIZADO A FAMÍLIAS - PAEFI*\n\n" +
                                 "● Local: Secretaria de Assistência Social\n" +
                                 "● Horário: 8:00 às 13:00 hs\n" +
                                 "● Serviço: Atendimento psicossocial e jurídico\n\n" +
                                 "*0*: Menu Inicial\n" +
                                 "*00*: Finalizar Atendimento.";
                await chat.sendMessage(msgPaefi);
                registrarMensagemBotNoHistorico(senderId, msgPaefi);
                break;
              
              case "2":
                registrarOpcao(senderId, "CREAS", "2", "Casa de Acolhimento");
                registrarOpcaoMenuNoHistorico(senderId, "Casa de Acolhimento");
                atendimentos[senderId].servicoDetalhado = "Casa de Acolhimento - Acolhimento provisório";
                const msgCasaAcolhimento = "*CASA DE ACOLHIMENTO*\n\n" +
                                           "● Local: Secretaria de Assistência Social\n" +
                                           "● Horário: 8:00 às 13:00 hs\n" +
                                           "● Serviço: Acolhimento provisório para crianças e adolescentes\n\n" +
                                           "*0*: Menu Inicial\n" +
                                           "*00*: Finalizar Atendimento.";
                await chat.sendMessage(msgCasaAcolhimento);
                registrarMensagemBotNoHistorico(senderId, msgCasaAcolhimento);
                break;
              case "0":
                  userState.subSubMenu = 0;
                  await chat.sendMessage(getHealthWomensRightsServicesMenu());
                  break;
                  }
                  }
        break;
       case 5: // Sec. Saúde e Direitos da Mulher
          if (userState.subSubMenu === 1) {
            // CEM
            switch (text) {
              case "1":
  registrarOpcao(senderId, "CEM", "1", "Pediatria");
  registrarOpcaoMenuNoHistorico(senderId, "Pediatria");
  atendimentos[senderId].servicoDetalhado = "Pediatria - Dra. Rejane (Terças, 8:00-13:00)";
  const msgPediatria = `*PEDIATRIA*\n\n
  ● Especialista: Dra. Rejane\n
  ● Dia: Terças\n
  ● Horário: 8:00 às 13:00 hs\n
  ● Documentos: Encaminhamento e Cartão SUS.\n\n
  *0*: Menu Inicial\n
  *00*: Finalizar Atendimento.`;
  await chat.sendMessage(msgPediatria);
  registrarMensagemBotNoHistorico(senderId, msgPediatria);
  break;

case "2":
  registrarOpcao(senderId, "CEM", "2", "Teste do Pezinho");
  registrarOpcaoMenuNoHistorico(senderId, "Teste do Pezinho");
  atendimentos[senderId].servicoDetalhado = "Teste do Pezinho - Ana Claudia (Terça a Quinta, 8:00-16:00)";
  const msgTestePezinho = `*TESTE DO PEZINHO*\n\n
  ● Responsável: Ana Claudia\n
  ● Dias: Terça a Quinta\n
  ● Horário: 8:00 às 16:00 hs\n
  ● Documentos: Identidade da mãe e Certidão de Nascimento.\n\n
  *0*: Menu Inicial\n
  *00*: Finalizar Atendimento.`;
  await chat.sendMessage(msgTestePezinho);
  registrarMensagemBotNoHistorico(senderId, msgTestePezinho);
  break;

case "3":
  registrarOpcao(senderId, "CEM", "3", "Neurologista");
  registrarOpcaoMenuNoHistorico(senderId, "Neurologista");
  atendimentos[senderId].servicoDetalhado = "Neurologista - Dr. Eduardo (Sextas, 8:00-13:00)";
  const msgNeurologista = `*NEUROLOGISTA*\n\n
  ● Especialista: Dr. Eduardo\n
  ● Dia de atendimento: Sextas\n
  ● Horário: 8:00 às 13:00 hs\n\n
  🔴 ATENÇÃO 🔴\n
  Para agendar uma consulta para NEUROLOGISTA, por favor, compareça ao Centro de Especialidades Médicas (CEM) com Encaminhamento do Município e Cartão do SUS.\n\n
  *0*: Menu Inicial\n
  *00*: Finalizar Atendimento.`;
  await chat.sendMessage(msgNeurologista);
  registrarMensagemBotNoHistorico(senderId, msgNeurologista);
  break;

case "4":
  registrarOpcao(senderId, "CEM", "4", "T.O.");
  registrarOpcaoMenuNoHistorico(senderId, "Terapia Ocupacional");
  atendimentos[senderId].servicoDetalhado = "T.O. - Dra. Ashiley (Sábados, 8:00-16:00)";
  const msgTerapiaOcupacional = `*TERAPIA OCUPACIONAL-TO*\n\n
  ● Especialista: Dra. Ashiley\n
  ● Dia de atendimento: Sábados\n
  ● Horário: 8:00 às 16:00 hs\n\n
  🔴 ATENÇÃO 🔴\n
  Para agendar uma consulta para TERAPEUTA OCUPACIONAL, por favor, compareça ao Centro de Especialidades Médicas (CEM) com Encaminhamento do Município e Cartão do SUS.\n\n
  *0*: Menu Inicial\n
  *00*: Finalizar Atendimento.`;
  await chat.sendMessage(msgTerapiaOcupacional);
  registrarMensagemBotNoHistorico(senderId, msgTerapiaOcupacional);
  break;

case "5":
  registrarOpcao(senderId, "CEM", "5", "Psicólogo");
  registrarOpcaoMenuNoHistorico(senderId, "Psicólogo");
  atendimentos[senderId].servicoDetalhado = "Psicólogo - Dra. Ana Paula; Bárbara; Josenildo; Mariana; Aline; Manuella; Jessica (Segunda a Sexta, 8:00-16:00)";
  const msgPsicologo = `*PSICÓLOGO*\n\n
  ● Especialista: Dr.(a) Ana Paula; Bárbara; Josenildo; Mariana; Aline; Manuella; Jessica\n
  ● Dia de atendimento: Segunda a Sexta\n
  ● Horário: 8:00 às 16:00 hs\n\n
  🔴 ATENÇÃO 🔴\n
  Para agendar uma consulta para PSICÓLOGO, por favor, compareça ao Centro de Especialidades Médicas (CEM) com Encaminhamento do Município e Cartão do SUS.\n\n
  *0*: Menu Inicial\n
  *00*: Finalizar Atendimento.`;
  await chat.sendMessage(msgPsicologo);
  registrarMensagemBotNoHistorico(senderId, msgPsicologo);
  break;

case "6":
  registrarOpcao(senderId, "CEM", "6", "Psiquiatria");
  registrarOpcaoMenuNoHistorico(senderId, "Psiquiatria");
  atendimentos[senderId].servicoDetalhado = "Psiquiatria - Dra. Suellem (Segunda) e Dra. Milena (Quarta), 8:00-16:00)";
  const msgPsiquiatria = `*PSIQUIATRIA*\n\n
  ● Especialista: Dra. Suellem (Segunda) e Dra. Milena (Quarta)\n
  ● Dia de atendimento: Segunda e Quartas\n
  ● Horário: 8:00 às 16:00 hs\n\n
  🔴 ATENÇÃO 🔴\n
  Para agendar uma consulta para PSIQUIATRIA, por favor, compareça ao Centro de Especialidades Médicas (CEM) com Encaminhamento do Município e Cartão do SUS.\n\n
  *0*: Menu Inicial\n
  *00*: Finalizar Atendimento.`;
  await chat.sendMessage(msgPsiquiatria);
  registrarMensagemBotNoHistorico(senderId, msgPsiquiatria);
  break;

case "7":
  registrarOpcao(senderId, "CEM", "7", "Nutricionista");
  registrarOpcaoMenuNoHistorico(senderId, "Nutricionista");
  atendimentos[senderId].servicoDetalhado = "Nutricionista - Dra. Hadassa (Segundas, 8:00-13:00)";
  const msgNutricionista = `*NUTRICIONISTA*\n\n
  ● Especialista: Dra. Hadassa\n
  ● Dia de atendimento: Segundas\n
  ● Horário: 8:00 às 13:00 hs\n\n
  🔴 ATENÇÃO 🔴\n
  Para agendar consulta para NUTRICIONISTA, por favor, compareça ao Centro de Especialidades Médicas (CEM) com Encaminhamento do Município e Cartão do SUS.\n\n
  *0*: Menu Inicial\n
  *00*: Finalizar Atendimento.`;
  await chat.sendMessage(msgNutricionista);
  registrarMensagemBotNoHistorico(senderId, msgNutricionista);
  break;

case "8":
  registrarOpcao(senderId, "CEM", "8", "Fonoaudiólogo");
  registrarOpcaoMenuNoHistorico(senderId, "Fonoaudiólogo");
  atendimentos[senderId].servicoDetalhado = "Fonoaudiólogo - Dra. Ana Claudia (Quartas, 8:00-16:00)";
  const msgFonoaudiologo = `*FONOAUDIÓLOGO*\n\n
  ● Especialista: Dra. Ana Claudia\n
  ● Dia de atendimento: Quartas\n
  ● Horário: 8:00 às 16:00 hs\n\n
  🔴 ATENÇÃO 🔴\n
  Para agendar uma consulta para FONOAUDIÓLOGO, por favor, compareça ao Centro de Especialidades Médicas (CEM) com Encaminhamento do Município e Cartão do SUS.\n\n
  *0*: Menu Inicial\n
  *00*: Finalizar Atendimento.`;
  await chat.sendMessage(msgFonoaudiologo);
  registrarMensagemBotNoHistorico(senderId, msgFonoaudiologo);
  break;

case "9":
  registrarOpcao(senderId, "CEM", "9", "Ortopedista");
  registrarOpcaoMenuNoHistorico(senderId, "Ortopedista");
  atendimentos[senderId].servicoDetalhado = "Ortopedista - Dr. Felipe Lessa (Terças, 8:00-13:00)";
  const msgOrtopedista = `*ORTOPEDISTA*\n\n
  ● Especialista: Dr. Felipe Lessa\n
  ● Dia de atendimento: Terças\n
  ● Horário: 8:00 às 13:00 hs\n\n
  🔴 ATENÇÃO 🔴\n
  Para agendar uma consulta para ORTOPEDISTA, por favor, compareça ao Centro de Especialidades Médicas (CEM) com Encaminhamento do Município e Cartão do SUS.\n\n
  *0*: Menu Inicial\n
  *00*: Finalizar Atendimento.`;
  await chat.sendMessage(msgOrtopedista);
  registrarMensagemBotNoHistorico(senderId, msgOrtopedista);
  break;

case "10":
  registrarOpcao(senderId, "CEM", "10", "Endocrino");
  registrarOpcaoMenuNoHistorico(senderId, "Endocrinologista");
  atendimentos[senderId].servicoDetalhado = "Endocrinologista - Dra. Suellem (Sextas, 8:00-16:00)";
  const msgEndocrino = `*ENDOCRINOLOGISTA*\n\n
  ● Especialista: Dra. Suellem\n
  ● Dia de atendimento: Sextas\n
  ● Horário: 8:00 às 16:00 hs\n\n
  🔴 ATENÇÃO 🔴\n
  Para agendar uma consulta para ENDÓCRINO, por favor, compareça ao Centro de Especialidades Médicas (CEM) com Encaminhamento do Município e Cartão do SUS.\n\n
  *0*: Menu Inicial\n
  *00*: Finalizar Atendimento.`;
  await chat.sendMessage(msgEndocrino);
  registrarMensagemBotNoHistorico(senderId, msgEndocrino);
  break;

case "11":
  registrarOpcao(senderId, "CEM", "11", "Ginecologista/obstetra");
  registrarOpcaoMenuNoHistorico(senderId, "Ginecologista/Obstetra");
  atendimentos[senderId].servicoDetalhado = "Ginecologista/Obstetra - Dra. Dea (Terças e Quintas, 8:00-13:00)";
  const msgGinecologista = `*GINECOLOGISTA/OBSTETRA*\n\n
  ● Especialista: Dra. Dea\n
  ● Dia de atendimento: Terças e Quintas\n
  ● Horário: 8:00 às 13:00 hs\n\n
  🔴 ATENÇÃO 🔴\n
  Para agendar uma consulta para OBSTETRA, por favor, compareça ao Centro de Especialidades Médicas (CEM) com Encaminhamento do Município e Cartão do SUS.\n\n
  *0*: Menu Inicial\n
  *00*: Finalizar Atendimento.`;
  await chat.sendMessage(msgGinecologista);
  registrarMensagemBotNoHistorico(senderId, msgGinecologista);
  break;

case "12":
  registrarOpcao(senderId, "CEM", "12", "Psicopedagoga");
  registrarOpcaoMenuNoHistorico(senderId, "Psicopedagogo");
  atendimentos[senderId].servicoDetalhado = "Psicopedagogo - Dr. Luiz (Segundas e Quartas, 8:00-16:00)";
  const msgPsicopedagogo = `*PSICOPEDAGOGO*\n\n
  ● Especialista: Dr. Luis\n
  ● Dia de atendimento: Segundas e Quartas\n
  ● Horário: 8:00 às 16:00 hs\n\n
  🔴 ATENÇÃO 🔴\n
  Para agendar PSICOPEDAGOGO, por favor, compareça ao Centro de Especialidades Médicas (CEM) com Encaminhamento do Município e Cartão do SUS.\n\n
  *0*: Menu Inicial\n
  *00*: Finalizar Atendimento.`;
  await chat.sendMessage(msgPsicopedagogo);
  registrarMensagemBotNoHistorico(senderId, msgPsicopedagogo);
  break;

  case "0":
    userState.subSubMenu = 0;
    await chat.sendMessage(getHealthWomensRightsServicesMenu());
    break;
    }
    }

}
  // Bloco separado para subSubMenu === 2
  if (userState.subSubMenu === 2) {
  // CEO - Centro de Especialidades Odontológicas
  switch (text) {
      case "1":
          registrarOpcao(senderId, "CEO", "1", "Endodontista");
          registrarOpcaoMenuNoHistorico(senderId, "Endodontista");
          atendimentos[senderId].servicoDetalhado = "Endodontista - Dra. Andreza (Segundas e Quintas) e Dr. João (Quintas e Sextas)";
          
          const msgEndodontista = `*ENDODONTISTA*\n\n
          ● Especialistas: Dra. Andreza e Dr. João\n
          ● Dias de atendimento:\n
          - Dra. Andreza: Segundas (manhã/tarde) e Quintas (tarde)\n
          - Dr. João: Quintas (manhã) e Sextas (manhã/tarde)\n
          ● Horário: 8:00 às 17:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar, compareça ao CEO com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgEndodontista);
          registrarMensagemBotNoHistorico(senderId, msgEndodontista);
          userState.aguardandoDescricao = true;
          break;
          
      case "2":
          registrarOpcao(senderId, "CEO", "2", "Patologista Bucal");
          registrarOpcaoMenuNoHistorico(senderId, "Patologista Bucal");
          atendimentos[senderId].servicoDetalhado = "Patologista Bucal - Dr. Ricardo (Quintas, a partir das 18:00)";
          
          const msgPatologista = `*PATOLOGISTA BUCAL*\n\n
          ● Especialista: Dr. Ricardo\n
          ● Dia de atendimento: Quintas\n
          ● Horário: A partir das 18:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar, compareça ao CEO com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgPatologista);
          registrarMensagemBotNoHistorico(senderId, msgPatologista);
          userState.aguardandoDescricao = true;
          break;
          
      case "3":
          registrarOpcao(senderId, "CEO", "3", "Periodontista");
          registrarOpcaoMenuNoHistorico(senderId, "Periodontista");
          atendimentos[senderId].servicoDetalhado = "Periodontista - Dra. Isadora (Terças, Quartas e Quintas - manhã)";
          
          const msgPeriodontista = `*PERIODONTISTA*\n\n
          ● Especialista: Dra. Isadora\n
          ● Dias de atendimento: Terças, Quartas e Quintas (manhã)\n
          ● Horário: 8:00 às 13:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar, compareça ao CEO com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgPeriodontista);
          registrarMensagemBotNoHistorico(senderId, msgPeriodontista);
          userState.aguardandoDescricao = true;
          break;
          
      case "4":
          registrarOpcao(senderId, "CEO", "4", "Radiologista");
          registrarOpcaoMenuNoHistorico(senderId, "Radiologista");
          atendimentos[senderId].servicoDetalhado = "Radiologista (Segundas e Quartas)";
          
          const msgRadiologista = `*RADIOLOGISTA*\n\n
          ● Dias de atendimento: Segundas e Quartas\n
          ● Horário: 8:00 às 13:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar, compareça ao CEO com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgRadiologista);
          registrarMensagemBotNoHistorico(senderId, msgRadiologista);
          userState.aguardandoDescricao = true;
          break;
          
      case "5":
          registrarOpcao(senderId, "CEO", "5", "Traumatologista Bucomaxilofacial");
          registrarOpcaoMenuNoHistorico(senderId, "Traumatologista Bucomaxilofacial");
          atendimentos[senderId].servicoDetalhado = "Traumatologista Bucomaxilofacial - Dr. Jonas, Dr. Anistean e Dr. Ricardo";
          
          const msgTraumatologista = `*TRAUMATOLOGISTA BUCOMAXILOFACIAL (Cirurgia)*\n\n
          ● Especialistas:\n
          - Dr. Jonas: Terças (manhã/tarde) e Quintas (tarde)\n
          - Dr. Anistean: Terças (manhã/tarde) e Quintas (manhã)\n
          - Dr. Ricardo: Quintas (quinzenal - noite)\n
          ● Horário: 8:00 às 17:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar cirurgia, compareça ao CEO para avaliação com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgTraumatologista);
          registrarMensagemBotNoHistorico(senderId, msgTraumatologista);
          userState.aguardandoDescricao = true;
          break;
          
      case "6":
          registrarOpcao(senderId, "CEO", "6", "Odontopediatria/PCD");
          registrarOpcaoMenuNoHistorico(senderId, "Odontopediatria/PCD");
          atendimentos[senderId].servicoDetalhado = "Odontopediatra e PcD - Dra. Rhanelle e Dra. Samylla";
          
          const msgOdontopediatria = `*ODONTOLOGISTA PEDIATRA E PCD*\n\n
          ● Especialistas:\n
          - Dra. Rhanelle: Segundas (manhã) e Quartas (tarde)\n
          - Dra. Samylla: Terças (tarde) e Quintas (tarde)\n
          ● Horário: 8:00 às 17:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar, compareça ao CEO com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgOdontopediatria);
          registrarMensagemBotNoHistorico(senderId, msgOdontopediatria);
          userState.aguardandoDescricao = true;
          break;
          
      case "0":
          userState.subSubMenu = 0;
          await chat.sendMessage(getHealthWomensRightsServicesMenu());
          break;
  }

} else if (userState.subSubMenu === 3) {
  // Centro de Fisioterapia
  switch (text) {
      case "1":
          registrarOpcao(senderId, "Centro de Fisioterapia", "1", "Hidroterapia");
          registrarOpcaoMenuNoHistorico(senderId, "Hidroterapia");
          atendimentos[senderId].servicoDetalhado = "Hidroterapia - Dr. Henrique (Terças e Sextas) e Dr. Hallfes (Segundas e Quintas)";
          
          const msgHidroterapia = `*HIDROTERAPIA*\n\n
          ● Especialistas:\n
          - Dr. Henrique: Terças e Sextas (manhã/tarde)\n
          - Dr. Hallfes: Segundas e Quintas (manhã/tarde)\n
          ● Horário: 8:00 às 17:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar, compareça ao Centro de Fisioterapia com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgHidroterapia);
          registrarMensagemBotNoHistorico(senderId, msgHidroterapia);
          userState.aguardandoDescricao = true;
          break;
          
      case "2":
          registrarOpcao(senderId, "Centro de Fisioterapia", "2", "Fisioterapia Pediatra");
          registrarOpcaoMenuNoHistorico(senderId, "Fisioterapia Pediatra");
          atendimentos[senderId].servicoDetalhado = "Fisioterapia Pediatra - Dra. Millane, Dra. Andréia, Dr. Hallfes, Dr. Henrique, Dra. Ana Carolina";
          
          const msgFisioPediatra = `*FISIOTERAPIA PEDIATRA*\n\n
          ● Especialistas:\n
          - Dra. Millane: Segundas (manhã), Sextas (tarde) e Sábados (manhã/tarde)\n
          - Dra. Andréia: Terças e Quartas (manhã/tarde)\n
          - Dr. Hallfes: Segundas e Quintas (manhã/tarde)\n
          - Dr. Henrique: Terças e Sextas (manhã/tarde)\n
          - Dra. Ana Carolina: Segundas e Quartas (manhã/tarde)\n
          ● Horário: 8:00 às 17:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar, compareça ao Centro de Fisioterapia com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgFisioPediatra);
          registrarMensagemBotNoHistorico(senderId, msgFisioPediatra);
          userState.aguardandoDescricao = true;
          break;
          
      case "3":
          registrarOpcao(senderId, "Centro de Fisioterapia", "3", "Geriatria");
          registrarOpcaoMenuNoHistorico(senderId, "Geriatria");
          atendimentos[senderId].servicoDetalhado = "Fisioterapia Motora (Geriatria) - Dra. Luene (Quartas e Quintas) e Dr. Fábio (Segundas e Sextas)";
          
          const msgGeriatria = `*FISIOTERAPIA MOTORA (GERIATRIA)*\n\n
          ● Especialistas:\n
          - Dra. Luene: Quartas e Quintas (manhã/tarde)\n
          - Dr. Fábio: Segundas e Sextas (manhã/tarde)\n
          ● Horário: 8:00 às 17:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar, compareça ao Centro de Fisioterapia com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgGeriatria);
          registrarMensagemBotNoHistorico(senderId, msgGeriatria);
          userState.aguardandoDescricao = true;
          break;
          
      case "4":
          registrarOpcao(senderId, "Centro de Fisioterapia", "4", "Reabilitação Neurológica");
          registrarOpcaoMenuNoHistorico(senderId, "Reabilitação Neurológica");
          atendimentos[senderId].servicoDetalhado = "Reabilitação Neurológica - Dr. Fábio (Segundas e Sextas) e Dra. Millane (Segundas, Sextas e Sábados)";
          
          const msgNeuro = `*REABILITAÇÃO NEUROLÓGICA*\n\n
          ● Especialistas:\n
          - Dr. Fábio: Segundas e Sextas (manhã/tarde)\n
          - Dra. Millane: Segundas (manhã), Sextas (tarde) e Sábados (manhã/tarde)\n
          ● Horário: 8:00 às 17:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar, compareça ao Centro de Fisioterapia com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgNeuro);
          registrarMensagemBotNoHistorico(senderId, msgNeuro);
          userState.aguardandoDescricao = true;
          break;
          
      case "5":
          registrarOpcao(senderId, "Centro de Fisioterapia", "5", "Traumato Ortopedia");
          registrarOpcaoMenuNoHistorico(senderId, "Traumato Ortopedia");
          atendimentos[senderId].servicoDetalhado = "Traumato-Ortopedia - Dra. Luene (Quartas e Quintas), Dr. Henrique (Terças e Sextas) e Dr. Fábio (Segundas e Sextas)";
          
          const msgTraumato = `*TRAUMATO-ORTOPEDIA*\n\n
          ● Especialistas:\n
          - Dra. Luene: Quartas e Quintas (manhã/tarde)\n
          - Dr. Henrique: Terças e Sextas (manhã/tarde)\n
          - Dr. Fábio: Segundas e Sextas (manhã/tarde)\n
          ● Horário: 8:00 às 17:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar, compareça ao Centro de Fisioterapia com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgTraumato);
          registrarMensagemBotNoHistorico(senderId, msgTraumato);
          userState.aguardandoDescricao = true;
          break;
          
      case "6":
          registrarOpcao(senderId, "Centro de Fisioterapia", "6", "Reumatologia");
          registrarOpcaoMenuNoHistorico(senderId, "Reumatologia");
          atendimentos[senderId].servicoDetalhado = "Reumatologia - Dra. Luene, Dr. Fábio, Dra. Andréia, Dr. Hallfes, Dra. Millane";
          
          const msgReumatologia = `*REUMATOLOGIA*\n\n
          ● Especialistas:\n
          - Dra. Luene: Quartas e Quintas (manhã/tarde)\n
          - Dr. Fábio: Segundas e Sextas (manhã/tarde)\n
          - Dra. Andréia: Terças e Quartas (manhã/tarde)\n
          - Dr. Hallfes: Segundas e Quintas (manhã/tarde)\n
          - Dra. Millane: Segundas (manhã), Sextas (tarde) e Sábados (manhã/tarde)\n
          ● Horário: 8:00 às 17:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar, compareça ao Centro de Fisioterapia com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgReumatologia);
          registrarMensagemBotNoHistorico(senderId, msgReumatologia);
          userState.aguardandoDescricao = true;
          break;
          
      case "0":
          userState.subSubMenu = 0;
          await chat.sendMessage(getHealthWomensRightsServicesMenu());
          break;
  }

} else if (userState.subSubMenu === 4) {
  // Centro de Imagens
  switch (text) {
      case "1":
          registrarOpcao(senderId, "Centro de Imagens", "1", "Raio-X");
          registrarOpcaoMenuNoHistorico(senderId, "Raio-X");
          atendimentos[senderId].servicoDetalhado = "Raio-X - Valcerlandia Almeida, Tamires Araújo e Anderson Leite (Seg-Sex 8-17h, Sáb 8-12h)";
          
          const msgRaioX = `*RAIO-X*\n\n
          ● Radiologistas: Valcerlandia Almeida, Tamires Araújo e Anderson Leite\n
          ● Dias:\n
          - Segunda a Sexta: 8:00 às 17:00 hs\n
          - Sábados: 8:00 às 12:00 hs\n
          - Plantão noturno e domingos (emergências)\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar, compareça ao Centro de Imagens com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgRaioX);
          registrarMensagemBotNoHistorico(senderId, msgRaioX);
          userState.aguardandoDescricao = true;
          break;
          
      case "2":
          registrarOpcao(senderId, "Centro de Imagens", "2", "Raio-X Panorâmico");
          registrarOpcaoMenuNoHistorico(senderId, "Raio-X Panorâmico");
          atendimentos[senderId].servicoDetalhado = "Raio-X Panorâmico - Lidiane Almeida (Segundas, Terças e Sextas, 8-12h)";
          
          const msgPanoramico = `*RAIO-X PANORÂMICO*\n\n
          ● Radiologista: Lidiane Almeida\n
          ● Dias: Segundas, Terças e Sextas\n
          ● Horário: 8:00 às 12:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar, compareça ao Centro de Imagens com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgPanoramico);
          registrarMensagemBotNoHistorico(senderId, msgPanoramico);
          userState.aguardandoDescricao = true;
          break;
          
      case "3":
          registrarOpcao(senderId, "Centro de Imagens", "3", "Mamografia");
          registrarOpcaoMenuNoHistorico(senderId, "Mamografia");
          atendimentos[senderId].servicoDetalhado = "Mamografia - Tec. Lidiane Almeida (Quartas, 8-17h)";
          
          const msgMamografia = `*MAMOGRAFIA*\n\n
          ● Especialista: Téc. Lidiane Almeida\n
          ● Dia: Quartas\n
          ● Horário: 8:00 às 17:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar, compareça à Secretaria de Saúde no setor de Regulação com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgMamografia);
          registrarMensagemBotNoHistorico(senderId, msgMamografia);
          userState.aguardandoDescricao = true;
          break;
          
      case "4":
          registrarOpcao(senderId, "Centro de Imagens", "4", "Endoscopia");
          registrarOpcaoMenuNoHistorico(senderId, "Endoscopia");
          atendimentos[senderId].servicoDetalhado = "Endoscopia - Dr. Guilherme Braz (a agendar)";
          
          const msgEndoscopia = `*ENDOSCOPIA*\n\n
          ● Especialista: Dr. Guilherme Braz\n
          ● Dia: A agendar\n
          ● Horário: 8:00 às 17:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar, compareça à Secretaria de Saúde no setor de Regulação com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgEndoscopia);
          registrarMensagemBotNoHistorico(senderId, msgEndoscopia);
          userState.aguardandoDescricao = true;
          break;
          
      case "5":
          registrarOpcao(senderId, "Centro de Imagens", "5", "Ultrassonografia");
          registrarOpcaoMenuNoHistorico(senderId, "Ultrassonografia");
          atendimentos[senderId].servicoDetalhado = "Ultrassonografia - Dr. Paulo Goes (Quartas, 8-17h)";
          
          const msgUltrassom = `*ULTRASSONOGRAFIA*\n\n
          ● Especialista: Dr. Paulo Goes\n
          ● Dia: Quartas\n
          ● Horário: 8:00 às 17:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar, compareça à Secretaria de Saúde no setor de Regulação com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgUltrassom);
          registrarMensagemBotNoHistorico(senderId, msgUltrassom);
          userState.aguardandoDescricao = true;
          break;
          
      case "6":
          registrarOpcao(senderId, "Centro de Imagens", "6", "Colonoscopia");
          registrarOpcaoMenuNoHistorico(senderId, "Colonoscopia");
          atendimentos[senderId].servicoDetalhado = "Colonoscopia - Dr. Guilherme Braz (a agendar)";
          
          const msgColonoscopia = `*COLONOSCOPIA*\n\n
          ● Especialista: Dr. Guilherme Braz\n
          ● Dia: A agendar\n
          ● Horário: 8:00 às 17:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar, compareça à Secretaria de Saúde no setor de Regulação com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgColonoscopia);
          registrarMensagemBotNoHistorico(senderId, msgColonoscopia);
          userState.aguardandoDescricao = true;
          break;
          
      case "7":
          registrarOpcao(senderId, "Centro de Imagens", "7", "Ecocardiograma");
          registrarOpcaoMenuNoHistorico(senderId, "Ecocardiograma");
          atendimentos[senderId].servicoDetalhado = "Ecocardiograma - Dr. Jonny Victor (a agendar)";
          
          const msgEco = `*ECOCARDIOGRAMA*\n\n
          ● Especialista: Dr. Jonny Victor\n
          ● Dia: A agendar\n
          ● Horário: 8:00 às 17:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar, compareça à Secretaria de Saúde no setor de Regulação com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgEco);
          registrarMensagemBotNoHistorico(senderId, msgEco);
          userState.aguardandoDescricao = true;
          break;
          
      case "8":
          registrarOpcao(senderId, "Centro de Imagens", "8", "Eletrocardiograma");
          registrarOpcaoMenuNoHistorico(senderId, "Eletrocardiograma");
          atendimentos[senderId].servicoDetalhado = "Eletrocardiograma - Dr. Dyego Barbosa (Segundas, 8-17h)";
          
          const msgEletro = `*ELETROCARDIOGRAMA*\n\n
          ● Especialista: Dr. Dyego Barbosa\n
          ● Dia: Segundas\n
          ● Horário: 8:00 às 17:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar, compareça à Secretaria de Saúde no setor de Regulação com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgEletro);
          registrarMensagemBotNoHistorico(senderId, msgEletro);
          userState.aguardandoDescricao = true;
          break;
          
      case "9":
          registrarOpcao(senderId, "Centro de Imagens", "9", "Oftalmo");
          registrarOpcaoMenuNoHistorico(senderId, "Oftalmologista");
          atendimentos[senderId].servicoDetalhado = "Oftalmologista - Dr. Andrey Batista (Quinzenal)";
          
          const msgOftalmo = `*OFTALMOLOGISTA*\n\n
          ● Especialista: Dr. Andrey Batista\n
          ● Dia: Quinzenal (a agendar)\n
          ● Horário: 8:00 às 17:00 hs\n\n
          🔴 *ATENÇÃO* 🔴\n
          Para agendar consulta, compareça à Secretaria de Saúde no setor de Regulação com:\n
          - Encaminhamento do Município\n
          - Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgOftalmo);
          registrarMensagemBotNoHistorico(senderId, msgOftalmo);
          userState.aguardandoDescricao = true;
          break;
          
      case "0":
          userState.subSubMenu = 0;
          await chat.sendMessage(getHealthWomensRightsServicesMenu());
          break;
          
      default:
          await chat.sendMessage("Opção inválida. Por favor, escolha uma opção válida.");
  }

} else if (userState.subSubMenu === 5) {
  // UBSF - Unidades Básicas de Saúde da Família
  switch (text) {
      case "1":
          registrarOpcao(senderId, "UBSF", "1", "Albino Bezerra de Vasconcelos");
          registrarOpcaoMenuNoHistorico(senderId, "UBSF Albino Bezerra");
          atendimentos[senderId].servicoDetalhado = "UBSF Albino Bezerra de Vasconcelos";
          
          const msgAlbino = `*UBSF ALBINO BEZERRA DE VASCONCELOS*\n\n
          👨‍⚕️ *Profissionais:*\n
          ● Médico(a): Emanuela Giordana Freitas de Siqueira\n
          ● Dentista: Ana Luiza Neves de Macedo\n
          ● Enfermeiro(a): Edy Karlla Bezerra da Silva\n
          ● Téc. Enfermagem: Francialle Silva Franco e Leni Aragão Bezerra Galindo\n
          ● ACS: Adnice, Lilyan, Alberi, David\n\n
          📅 *Dias de Atendimento:*\n
          ● Médico: Terças e Quartas (manhã/tarde), Quintas (manhã)\n
          ● Dentista: Segundas (tarde), Quartas (manhã/tarde), Sextas (tarde)\n
          ● Enfermagem: Segunda a Sexta (manhã/tarde)\n
          ⏰ Horário: 8:00 às 16:00 hs\n\n
          🔴 *ATENÇÃO*\n
          Para agendar consulta, compareça à UBSF com:\n
          ● Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgAlbino);
          registrarMensagemBotNoHistorico(senderId, msgAlbino);
          userState.aguardandoDescricao = true;
          break;

      case "2":
          registrarOpcao(senderId, "UBSF", "2", "Antônio Pedro da Silva (Pedra Fixe)");
          registrarOpcaoMenuNoHistorico(senderId, "UBSF Pedra Fixe");
          atendimentos[senderId].servicoDetalhado = "UBSF Antônio Pedro da Silva (Pedra Fixe)";
          
          const msgPedraFixe = `*UBSF ANTÔNIO PEDRO DA SILVA (PEDRA FIXE)*\n\n
          👨‍⚕️ *Profissionais:*\n
          ● Médico(a): Yobânia Vargas Aguiar\n
          ● Dentista: Letícia Galdinho\n
          ● ASB: Valdenira Ferreira da Silva\n
          ● Enfermeiro(a): Mariana Almeida Macêdo\n
          ● Téc. Enfermagem: Maria Aparecida Santos Felix\n
          ● ACS: Ana Maria, Edilene, Edvalda, Maria da Consolação, Maria Valeria\n\n
          📅 *Dias de Atendimento:*\n
          ● Médico: Quintas - Sítio Pedrinhas (manhã)\n
          ● Dentista: Segundas (Pedrinhas/Simeão), Terças (Pedra Fixe), Quartas (Serra do Totel)\n
          ● Enfermagem: Segunda a Sexta (manhã/tarde)\n
          ⏰ Horário: 7:00 às 17:00 hs\n\n
          🔴 *ATENÇÃO*\n
          Todos os atendimentos na UBSF Pedra Fixe. Leve seu Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgPedraFixe);
          registrarMensagemBotNoHistorico(senderId, msgPedraFixe);
          userState.aguardandoDescricao = true;
          break;

      case "3":
          registrarOpcao(senderId, "UBSF", "3", "João Francisco Bezerra (COHAB)");
          registrarOpcaoMenuNoHistorico(senderId, "UBSF COHAB");
          atendimentos[senderId].servicoDetalhado = "UBSF João Francisco Bezerra (COHAB)";
          
          const msgCohab = `*UBSF JOÃO FRANCISCO BEZERRA (COHAB)*\n\n
          👨‍⚕️ *Profissionais:*\n
          ● Médico(a): André Ricardo\n
          ● Dentista: Maria Aryanna Libório Alexandre\n
          ● ASB: Geane Maria Lima dos Santos\n
          ● Enfermeiro(a): Dra. Joanna Lima e Dr. André\n
          ● Téc. Enfermagem: Drielly Ruanna Ferreira e Waldiedja Galindo\n
          ● Aux. Enfermagem: Joselene Bezerra Galindo\n
          ● ACS: Edilene, Jerry, Lucianna, Luciano, Luciclecio, Nilda\n\n
          📅 *Dias de Atendimento:*\n
          ● Médico: Terças a Sextas (manhã/tarde)\n
          ● Dentista: Segundas a Quintas (manhã/tarde)\n
          ● Enfermagem: Segunda a Sexta (manhã/tarde)\n
          ⏰ Horário: 8:00 às 16:00 hs\n\n
          🔴 *ATENÇÃO*\n
          Para agendar consulta, compareça à UBSF com Cartão do SUS.\n\n
          *0*: Voltar Menu Secretaria\n
          *00*: Finalizar Atendimento.`;
          
          await chat.sendMessage(msgCohab);
          registrarMensagemBotNoHistorico(senderId, msgCohab);
          userState.aguardandoDescricao = true;
          break;
      case "4":
    registrarOpcao(senderId, "UBSF", "4", "José Jorge (Azevém)");
    registrarOpcaoMenuNoHistorico(senderId, "UBSF Azevém");
    atendimentos[senderId].servicoDetalhado = "UBSF José Jorge Bezerra (Azevém)";
    
    const msgAzevem = `*UBSF JOSÉ JORGE (AZEVÉM)*\n\n`
                     + `👨‍⚕️ *EQUIPE DE SAÚDE*\n`
                     + `• Médica: Dra. Beatriz\n`
                     + `• Dentista: Dr. Luiz Carlos\n`
                     + `• Enfermeira: Thais\n`
                     + `• Téc. Enfermagem: Josinei e Neriane\n\n`
                     + `📅 *ATENDIMENTOS EXTERNOS*\n`
                     + `• Olho D'água: Seg e Qua\n`
                     + `• Sítio do Meio: Qui e Sex\n\n`
                     + `⏰ *HORÁRIO BASE*\n`
                     + `• Seg-Sex: 8h-16h\n\n`
                     + `📍 *COMUNIDADES ATENDIDAS:* Azevém, Olho D'água, Sítio do Meio\n\n`
                     + `🔴 *DOCUMENTAÇÃO*\n`
                     + `• Cartão SUS obrigatório\n`
                     + `• Encaminhamento médico quando necessário\n\n`
                     + `*0*: Menu Inicial | *00*: Finalizar Atendimento`;
    
    await chat.sendMessage(msgAzevem);
    registrarMensagemBotNoHistorico(senderId, msgAzevem);
    userState.aguardandoDescricao = true;
    break;

case "5":
    registrarOpcao(senderId, "UBSF", "5", "Mãe Lipu");
    registrarOpcaoMenuNoHistorico(senderId, "UBSF Mãe Lipu");
    atendimentos[senderId].servicoDetalhado = "UBSF Mãe Lipu";
    
    const msgMaeLipu = `*UBSF MÃE LIPU*\n\n`
                     + `👨‍⚕️ *EQUIPE DE SAÚDE*\n`
                     + `• Médico: Dr. Hildson\n`
                     + `• Dentista: Dr. Emmanuel\n`
                     + `• Enfermeira: Maria Aparecida\n`
                     + `• Téc. Enfermagem: Rosilene e Eliza\n\n`
                     + `📅 *HORÁRIOS ESPECÍFICOS*\n`
                     + `• Consultas médicas: Ter (13h-16h), Qua-Sex (8h-12h)\n`
                     + `• Odontologia: Seg/Ter (13h-16h), Qua/Qui (8h-12h)\n\n`
                     + `💊 *MEDICAMENTOS*\n`
                     + `• Retirada: Terças e Quintas (14h-16h)\n\n`
                     + `🔴 *ATENÇÃO*\n`
                     + `• Cadastro anual obrigatório\n`
                     + `• Atualizar dados sempre que houver mudança\n\n`
                     + `*0*: Menu Inicial | *00*: Finalizar Atendimento`;
    
    await chat.sendMessage(msgMaeLipu);
    registrarMensagemBotNoHistorico(senderId, msgMaeLipu);
    userState.aguardandoDescricao = true;
    break;
case "6":
    registrarOpcao(senderId, "UBSF", "6", "Maria Lenice");
    registrarOpcaoMenuNoHistorico(senderId, "UBSF Maria Lenice");
    atendimentos[senderId].servicoDetalhado = "UBSF Maria Lenice Alexandre Tenório";
    
    const msgMariaLenice = `*UBSF MARIA LENICE*\n\n`
                         + `👨‍⚕️ *EQUIPE DE SAÚDE*\n`
                         + `• Médico: Dr. Augusto\n`
                         + `• Dentista: Dra. Francines\n`
                         + `• Enfermeira: Emilane\n`
                         + `• Téc. Enfermagem: Maria de Lourdes e Milsiely\n\n`
                         + `📅 *HORÁRIOS*\n`
                         + `• Consultas: Ter-Sex (8h-12h e 13h-16h)\n`
                         + `• Odontologia: Seg/Ter (13h-16h), Qua/Qui (8h-12h)\n`
                         + `• Curativos: Seg-Sex (8h-16h)\n\n`
                         + `💉 *VACINAÇÃO*\n`
                         + `• Segundas e Quartas (8h-12h)\n\n`
                         + `🔴 *DOCUMENTOS*\n`
                         + `• Cartão SUS e documento com foto\n`
                         + `• Carteira de vacinação para imunização\n\n`
                         + `*0*: Menu Inicial | *00*: Finalizar Atendimento`;
    
    await chat.sendMessage(msgMariaLenice);
    registrarMensagemBotNoHistorico(senderId, msgMariaLenice);
    userState.aguardandoDescricao = true;
    break;

case "7":
    registrarOpcao(senderId, "UBSF", "7", "Satiliense");
    registrarOpcaoMenuNoHistorico(senderId, "UBSF Satiliense");
    atendimentos[senderId].servicoDetalhado = "UBSF Satiliense";
    
    const msgSatiliense = `*UBSF SATILIENSE*\n\n`
                        + `👨‍⚕️ *EQUIPE DE SAÚDE*\n`
                        + `• Médica: Dra. Mylena\n`
                        + `• Dentista: Dra. Andreza\n`
                        + `• Enfermeira: Amanda\n`
                        + `• Téc. Enfermagem: Norma e Iolanda\n\n`
                        + `📅 *ATENDIMENTO EXTERNO*\n`
                        + `• Carrapateira: Quinzenal (consultar datas)\n\n`
                        + `⏰ *HORÁRIO BASE*\n`
                        + `• Seg-Qui: 8h-16h\n\n`
                        + `🏥 *SERVIÇOS*\n`
                        + `• Consultas\n`
                        + `• Coleta de exames\n`
                        + `• Aferição de pressão e glicemia\n\n`
                        + `🔴 *ATENÇÃO*\n`
                        + `• Agendamento com 48h de antecedência\n`
                        + `• Chegar com 15min de antecedência\n\n`
                        + `*0*: Menu Inicial | *00*: Finalizar Atendimento`;
    
    await chat.sendMessage(msgSatiliense);
    registrarMensagemBotNoHistorico(senderId, msgSatiliense);
    userState.aguardandoDescricao = true;
    break;

case "8":
    registrarOpcao(senderId, "UBSF", "8", "Povoado Tará");
    registrarOpcaoMenuNoHistorico(senderId, "UBSF Tará");
    atendimentos[senderId].servicoDetalhado = "UBSF Povoado Tará";
    
    const msgTara = `*UBSF POVOADO TARÁ*\n\n`
                  + `👨‍⚕️ *EQUIPE DE SAÚDE*\n`
                  + `• Médico: Dr. Ricardo\n`
                  + `• Dentista: Dra. Kathlyn\n`
                  + `• Enfermeira: Thianne\n`
                  + `• Téc. Enfermagem: Maria Angélica\n\n`
                  + `📅 *ATENDIMENTO MÓVEL*\n`
                  + `• Grotão/Pontais: Quartas\n`
                  + `• Carrapateira: Quartas\n\n`
                  + `⏰ *HORÁRIO BASE*\n`
                  + `• Seg-Sex: 7h-15h\n\n`
                  + `📍 *COMUNIDADES ATENDIDAS:* Tará, Grotão, Pontais\n\n`
                  + `🔴 *INFORMAÇÕES*\n`
                  + `• Emergências: procurar sede principal\n`
                  + `• Transporte médico disponível\n\n`
                  + `*0*: Menu Inicial | *00*: Finalizar Atendimento`;
    
    await chat.sendMessage(msgTara);
    registrarMensagemBotNoHistorico(senderId, msgTara);
    userState.aguardandoDescricao = true;
    break;

case "9":
    registrarOpcao(senderId, "UBSF", "9", "Valdecy (Bacural)");
    registrarOpcaoMenuNoHistorico(senderId, "UBSF Bacural");
    atendimentos[senderId].servicoDetalhado = "UBSF Valdecy da Silva (Bacural)";
    
    const msgBacural = `*UBSF VALDECY (BACURAL)*\n\n`
                     + `👨‍⚕️ *EQUIPE DE SAÚDE*\n`
                     + `• Médico: Dr. Roberto\n`
                     + `• Dentista: Dra. Mariana\n`
                     + `• Enfermeira: Ranielly\n`
                     + `• Téc. Enfermagem: Jucielli e Genecilda\n\n`
                     + `📅 *HORÁRIOS*\n`
                     + `• Consultas: Seg-Qui (8h-12h e 13h-16h)\n`
                     + `• Odontologia: Seg-Qua (8h-12h)\n`
                     + `• Enfermagem: Seg-Sex (8h-16h)\n\n`
                     + `🚑 *EMERGÊNCIAS PRÓXIMAS*\n`
                     + `• Hospital Regional: 30km\n`
                     + `• SAMU: 192\n\n`
                     + `🔴 *DOCUMENTOS*\n`
                     + `• Cartão SUS obrigatório\n`
                     + `• Comprovante de residência para cadastro\n\n`
                     + `*0*: Menu Inicial | *00*: Finalizar Atendimento`;
    
    await chat.sendMessage(msgBacural);
    registrarMensagemBotNoHistorico(senderId, msgBacural);
    userState.aguardandoDescricao = true;
    break;

                case "0":
                  userState.subSubMenu = 0;
                  await chat.sendMessage(getHealthWomensRightsServicesMenu());
                  break;
               }
            }
            // Hosp. e Matern. Justa Mª Bezerra
            if (userState.mainMenu === 6 && userState.subSubMenu === 1) {
              // Exames Laboratoriais
              switch (text) {
                case "1":
                  registrarOpcao(senderId, "Exames Laboratoriais", "1", "Lista de Exames Disponíveis");
                  registrarOpcaoMenuNoHistorico(senderId, "Lista de Exames Disponíveis");
                  atendimentos[senderId].servicoDetalhado = "Lista de Exames Disponíveis";
                  const msgListaExames = "*Lista de exames disponíveis:*\n ● Hemograma\n ● Glicemia\n ● TGO\n ● TGP\n ● Ureia\n ● Creatinina\n ● Sumário de Urina\n ● Sódio\n ● Potássio\n ● Triglicerídeos\n ● Colesterol\n ● D-Dimero\n ● VDRL.\n\n*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
                  await chat.sendMessage(msgListaExames);
                  registrarMensagemBotNoHistorico(senderId, msgListaExames);
                  break;
          
                case "2":
                  registrarOpcao(senderId, "Exames Laboratoriais", "2", "Solicitação de Exames");
                  registrarOpcaoMenuNoHistorico(senderId, "Solicitação de Exames");
                  atendimentos[senderId].servicoDetalhado = "Solicitação de Exames";
                  const msgSolicitacaoExames = "*Solicitação de Exames*:\n ● Cartão do SUS\n ● CPF\n ● RG\n ● Requisição Médica\n ● Comprovante de Residência.\n\n*0*: Menu Inicial\n*00*: Finalizar Atendimento.";
                  await chat.sendMessage(msgSolicitacaoExames);
                  registrarMensagemBotNoHistorico(senderId, msgSolicitacaoExames);
                  break;
          
                case "0":
                  userState.subSubMenu = 0;
                  await chat.sendMessage(getHealthWomensRightsServicesMenu());
                  break;
              }
            }
          
          // Adicionar no início do atendimento, antes de coletar dados pessoais
          if (!userState.solicitacaoAnonimaPerguntada && userState.aguardandoDescricao) {
            userState.solicitacaoAnonimaPerguntada = true;
            userState.aguardandoDescricao = false;
            userState.aguardandoEscolhaAnonima = true;
            await chat.sendMessage(
              "Deseja registrar sua solicitação de forma anônima?\n1. Sim\n2. Não\n\n*De acordo com a LGPD, ao escolher anonimato, nenhum dado pessoal será solicitado ou armazenado.*"
            );
            return;
          }
          
          if (userState.aguardandoEscolhaAnonima) {
            if (text === "1") {
              userState.solicitacaoAnonima = true;
              userState.aguardandoEscolhaAnonima = false;
              userState.aguardandoDescricao = true;
              if (!atendimentos[senderId]) atendimentos[senderId] = {};
              atendimentos[senderId].anonimo = true;
              await chat.sendMessage("Sua solicitação será registrada de forma anônima. Por favor, descreva sua demanda.");
              return;
            } else if (text === "2") {
              userState.solicitacaoAnonima = false;
              userState.aguardandoEscolhaAnonima = false;
              userState.aguardandoDescricao = true;
              if (!atendimentos[senderId]) atendimentos[senderId] = {};
              atendimentos[senderId].anonimo = false;
              await chat.sendMessage("Ok, sua solicitação NÃO será anônima. Por favor, descreva sua demanda.");
              return;
            } else {
              await chat.sendMessage("Por favor, responda apenas com 1 (Sim) ou 2 (Não). Deseja registrar sua solicitação de forma anônima?\n1. Sim\n2. Não");
              return;
            }
          }
          
          // Exemplo de uso: sempre que o usuário escolher uma opção de menu, chame registrarOpcaoMenuNoHistorico(senderId, nomeOpcao)
          // Sempre que o bot enviar uma mensagem relevante, chame registrarMensagemBotNoHistorico(senderId, mensagem)
        }
        }
        });
          
          // =============================================
          // INICIALIZAÇÃO
          // =============================================
          console.log("Iniciando cliente WhatsApp...");
          
          // Tratamento de erros global
          process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Erro não tratado:', reason);
          });
          
          process.on('uncaughtException', (error) => {
            console.error('❌ Exceção não capturada:', error);
          });
          
          // Inicializa o cliente WhatsApp
          try {
            console.log('🚀 Iniciando cliente WhatsApp...');
            client.initialize();
          } catch (error) {
            console.error('❌ Erro ao inicializar cliente:', error);
          }
          
          // =============================================
          // EXPORTAÇÃO DE FUNÇÕES
          // =============================================
          module.exports = {
            enviarEmailNotificacao
          };