import React, { useState, useEffect, useRef } from 'react';
import './EditorResposta.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function EditorResposta({ demandaId, onClose, onRespostaEnviada }) {
  const [resposta, setResposta] = useState('');
  const [mostrarFormatacao, setMostrarFormatacao] = useState(false);
  const [mostrarModelos, setMostrarModelos] = useState(false);
  const [mostrarOpcoesEnvio, setMostrarOpcoesEnvio] = useState(false);
  const [modoEnvio, setModoEnvio] = useState('chatbot'); // chatbot, email, sms
  const [emailDestinatario, setEmailDestinatario] = useState('');
  const [telefoneDestinatario, setTelefoneDestinatario] = useState('');
  const [assuntoEmail, setAssuntoEmail] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [detalhesDemanda, setDetalhesDemanda] = useState(null);
  
  const editorRef = useRef(null);

  // Modelos de respostas pré-definidos
  const modelosRespostas = {
    'duvida_frequente': {
      titulo: 'Dúvida Frequente',
      conteudo: `Olá! 

Agradecemos seu contato com a Ouvidoria Municipal.

Sua solicitação foi registrada e está sendo analisada pela equipe responsável. Em breve entraremos em contato com mais informações.

Protocolo: {protocolo}
Data: {data}

Atenciosamente,
Equipe da Ouvidoria Municipal`
    },
    'informacao_geral': {
      titulo: 'Informação Geral',
      conteudo: `Prezado(a) cidadão(ã),

Informamos que sua solicitação foi recebida e está sendo processada.

Para acompanhar o status, você pode consultar através do número de protocolo: {protocolo}

Qualquer dúvida, entre em contato conosco.

Obrigado pela confiança!`
    },
    'resposta_tecnica': {
      titulo: 'Resposta Técnica',
      conteudo: `Sobre sua solicitação protocolada sob o número {protocolo}, informamos:

ANÁLISE TÉCNICA:
- Situação identificada: [DESCREVER]
- Medidas necessárias: [LISTAR]
- Prazo estimado: [INFORMAR]

CONCLUSÃO:
[RESPOSTA FINAL]

Em caso de dúvidas, estamos à disposição.`
    },
    'agradecimento': {
      titulo: 'Agradecimento',
      conteudo: `Agradecemos seu contato e a confiança depositada na Ouvidoria Municipal.

Sua contribuição é fundamental para melhorarmos nossos serviços.

Protocolo: {protocolo}

Continuamos à disposição!`
    }
  };

  useEffect(() => {
    if (demandaId) {
      carregarDetalhesDemanda();
    }
  }, [demandaId]);

  const carregarDetalhesDemanda = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/demandas/${demandaId}/detalhes-completos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDetalhesDemanda(data);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da demanda:', error);
    }
  };

  const aplicarFormatacao = (tipo) => {
    const editor = editorRef.current;
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const texto = resposta;
    const textoSelecionado = texto.substring(start, end);

    let novoTexto = '';
    let novaPosicao = start;

    switch (tipo) {
      case 'negrito':
        novoTexto = texto.substring(0, start) + `*${textoSelecionado}*` + texto.substring(end);
        novaPosicao = end + 2;
        break;
      case 'italico':
        novoTexto = texto.substring(0, start) + `_${textoSelecionado}_` + texto.substring(end);
        novaPosicao = end + 2;
        break;
      case 'riscado':
        novoTexto = texto.substring(0, start) + `~${textoSelecionado}~` + texto.substring(end);
        novaPosicao = end + 2;
        break;
      case 'monospace':
        novoTexto = texto.substring(0, start) + `\`${textoSelecionado}\`` + texto.substring(end);
        novaPosicao = end + 2;
        break;
      case 'link':
        const url = prompt('Digite a URL:');
        if (url) {
          novoTexto = texto.substring(0, start) + `[${textoSelecionado}](${url})` + texto.substring(end);
          novaPosicao = end + url.length + 4;
        }
        break;
      case 'lista':
        const linhas = textoSelecionado.split('\n');
        const listaFormatada = linhas.map(linha => `• ${linha}`).join('\n');
        novoTexto = texto.substring(0, start) + listaFormatada + texto.substring(end);
        novaPosicao = start + listaFormatada.length;
        break;
      case 'numeracao':
        const linhasNum = textoSelecionado.split('\n');
        const numeracaoFormatada = linhasNum.map((linha, index) => `${index + 1}. ${linha}`).join('\n');
        novoTexto = texto.substring(0, start) + numeracaoFormatada + texto.substring(end);
        novaPosicao = start + numeracaoFormatada.length;
        break;
    }

    if (novoTexto) {
      setResposta(novoTexto);
      setTimeout(() => {
        editor.setSelectionRange(novaPosicao, novaPosicao);
        editor.focus();
      }, 0);
    }
  };

  const inserirModelo = (chave) => {
    const modelo = modelosRespostas[chave];
    if (!modelo) return;

    let conteudo = modelo.conteudo;
    
    // Substituir placeholders
    if (detalhesDemanda) {
      conteudo = conteudo.replace('{protocolo}', detalhesDemanda.demanda.protocolo);
      conteudo = conteudo.replace('{data}', new Date().toLocaleDateString('pt-BR'));
    }

    setResposta(conteudo);
    setMostrarModelos(false);
  };

  const inserirVariavel = (variavel) => {
    const editor = editorRef.current;
    if (!editor) return;

    const start = editor.selectionStart;
    const texto = resposta;
    const novoTexto = texto.substring(0, start) + variavel + texto.substring(start);
    
    setResposta(novoTexto);
    setTimeout(() => {
      editor.setSelectionRange(start + variavel.length, start + variavel.length);
      editor.focus();
    }, 0);
  };

  const enviarResposta = async () => {
    if (!resposta.trim()) {
      alert('Digite uma resposta antes de enviar.');
      return;
    }

    setCarregando(true);

    try {
      const token = localStorage.getItem('token');
      const dadosEnvio = {
        resposta: resposta,
        modoEnvio: modoEnvio
      };

      if (modoEnvio === 'email') {
        dadosEnvio.emailDestinatario = emailDestinatario;
        dadosEnvio.assuntoEmail = assuntoEmail;
      } else if (modoEnvio === 'sms') {
        dadosEnvio.telefoneDestinatario = telefoneDestinatario;
      }

      const response = await fetch(`${API_URL}/demandas/${demandaId}/responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosEnvio)
      });

      if (response.ok) {
        alert('Resposta enviada com sucesso!');
        setResposta('');
        if (onRespostaEnviada) {
          onRespostaEnviada();
        }
        if (onClose) {
          onClose();
        }
      } else {
        const errorData = await response.json();
        alert(`Erro ao enviar resposta: ${errorData.erro}`);
      }
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      alert('Erro ao enviar resposta');
    } finally {
      setCarregando(false);
    }
  };

  const visualizarFormatacao = () => {
    const preview = resposta
      .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/~(.*?)~/g, '<del>$1</del>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/^•\s*(.*)$/gm, '<li>$1</li>')
      .replace(/^\d+\.\s*(.*)$/gm, '<li>$1</li>');

    return { __html: preview };
  };

  return (
    <div className="editor-resposta">
      <div className="editor-header">
        <h3>Editor de Resposta</h3>
        <button className="btn-fechar" onClick={onClose}>×</button>
      </div>

      <div className="editor-toolbar">
        <button 
          className={`btn-toolbar ${mostrarFormatacao ? 'ativo' : ''}`}
          onClick={() => setMostrarFormatacao(!mostrarFormatacao)}
        >
          🎨 Formatação
        </button>
        <button 
          className={`btn-toolbar ${mostrarModelos ? 'ativo' : ''}`}
          onClick={() => setMostrarModelos(!mostrarModelos)}
        >
          📋 Modelos
        </button>
        <button 
          className={`btn-toolbar ${mostrarOpcoesEnvio ? 'ativo' : ''}`}
          onClick={() => setMostrarOpcoesEnvio(!mostrarOpcoesEnvio)}
        >
          📤 Envio
        </button>
      </div>

      {mostrarFormatacao && (
        <div className="formatacao-panel">
          <div className="formatacao-buttons">
            <button onClick={() => aplicarFormatacao('negrito')} title="Negrito">B</button>
            <button onClick={() => aplicarFormatacao('italico')} title="Itálico">I</button>
            <button onClick={() => aplicarFormatacao('riscado')} title="Riscado">S</button>
            <button onClick={() => aplicarFormatacao('monospace')} title="Monospace">M</button>
            <button onClick={() => aplicarFormatacao('link')} title="Link">🔗</button>
            <button onClick={() => aplicarFormatacao('lista')} title="Lista">•</button>
            <button onClick={() => aplicarFormatacao('numeracao')} title="Numeração">1.</button>
          </div>
          <div className="variaveis">
            <span>Variáveis:</span>
            <button onClick={() => inserirVariavel('{protocolo}')}>Protocolo</button>
            <button onClick={() => inserirVariavel('{data}')}>Data</button>
            <button onClick={() => inserirVariavel('{nome}')}>Nome</button>
            <button onClick={() => inserirVariavel('{secretaria}')}>Secretaria</button>
          </div>
        </div>
      )}

      {mostrarModelos && (
        <div className="modelos-panel">
          <h4>Modelos Pré-definidos</h4>
          <div className="modelos-grid">
            {Object.entries(modelosRespostas).map(([chave, modelo]) => (
              <button 
                key={chave}
                className="modelo-item"
                onClick={() => inserirModelo(chave)}
              >
                <strong>{modelo.titulo}</strong>
                <small>{modelo.conteudo.substring(0, 100)}...</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {mostrarOpcoesEnvio && (
        <div className="opcoes-envio-panel">
          <h4>Opções de Envio</h4>
          <div className="opcoes-envio">
            <label>
              <input 
                type="radio" 
                name="modoEnvio" 
                value="chatbot" 
                checked={modoEnvio === 'chatbot'}
                onChange={(e) => setModoEnvio(e.target.value)}
              />
              Via Chatbot (WhatsApp)
            </label>
            <label>
              <input 
                type="radio" 
                name="modoEnvio" 
                value="email" 
                checked={modoEnvio === 'email'}
                onChange={(e) => setModoEnvio(e.target.value)}
              />
              Via E-mail
            </label>
            <label>
              <input 
                type="radio" 
                name="modoEnvio" 
                value="sms" 
                checked={modoEnvio === 'sms'}
                onChange={(e) => setModoEnvio(e.target.value)}
              />
              Via SMS
            </label>
          </div>

          {modoEnvio === 'email' && (
            <div className="campos-email">
              <input
                type="email"
                placeholder="E-mail do destinatário"
                value={emailDestinatario}
                onChange={(e) => setEmailDestinatario(e.target.value)}
              />
              <input
                type="text"
                placeholder="Assunto do e-mail"
                value={assuntoEmail}
                onChange={(e) => setAssuntoEmail(e.target.value)}
              />
            </div>
          )}

          {modoEnvio === 'sms' && (
            <div className="campos-sms">
              <input
                type="tel"
                placeholder="Telefone do destinatário"
                value={telefoneDestinatario}
                onChange={(e) => setTelefoneDestinatario(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      <div className="editor-content">
        <div className="editor-textarea">
          <textarea
            ref={editorRef}
            value={resposta}
            onChange={(e) => setResposta(e.target.value)}
            placeholder="Digite sua resposta aqui..."
            rows={10}
          />
        </div>

        <div className="editor-preview">
          <h5>Visualização:</h5>
          <div 
            className="preview-content"
            dangerouslySetInnerHTML={visualizarFormatacao()}
          />
        </div>
      </div>

      <div className="editor-actions">
        <button 
          className="btn-salvar-rascunho"
          onClick={() => {
            localStorage.setItem('rascunho_resposta', resposta);
            alert('Rascunho salvo!');
          }}
        >
          💾 Salvar Rascunho
        </button>
        <button 
          className="btn-carregar-rascunho"
          onClick={() => {
            const rascunho = localStorage.getItem('rascunho_resposta');
            if (rascunho) {
              setResposta(rascunho);
              alert('Rascunho carregado!');
            } else {
              alert('Nenhum rascunho encontrado.');
            }
          }}
        >
          📄 Carregar Rascunho
        </button>
        <button 
          className="btn-enviar"
          onClick={enviarResposta}
          disabled={carregando || !resposta.trim()}
        >
          {carregando ? 'Enviando...' : '📤 Enviar Resposta'}
        </button>
      </div>
    </div>
  );
}

export default EditorResposta; 