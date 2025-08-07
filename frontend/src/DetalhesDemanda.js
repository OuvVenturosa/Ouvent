import React, { useState, useEffect } from 'react';
import './DetalhesDemanda.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function DetalhesDemanda({ demandaId, onClose }) {
  const [detalhes, setDetalhes] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [novaInteracao, setNovaInteracao] = useState('');
  const [mostrarFormInteracao, setMostrarFormInteracao] = useState(false);

  useEffect(() => {
    if (demandaId) {
      carregarDetalhes();
    }
  }, [demandaId]);

  const carregarDetalhes = async () => {
    setCarregando(true);
    setErro(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/demandas/${demandaId}/detalhes-completos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDetalhes(data);
      } else {
        const errorData = await response.json();
        setErro(errorData.erro || 'Erro ao carregar detalhes');
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      setErro('Erro ao carregar detalhes da demanda');
    } finally {
      setCarregando(false);
    }
  };

  const adicionarInteracao = async (e) => {
    e.preventDefault();
    
    if (!novaInteracao.trim()) {
      alert('Digite uma mensagem');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/demandas/${demandaId}/interacao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mensagem: novaInteracao,
          origem: 'atendente'
        })
      });

      if (response.ok) {
        setNovaInteracao('');
        setMostrarFormInteracao(false);
        carregarDetalhes(); // Recarregar para mostrar a nova interação
        alert('Interação adicionada com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.erro}`);
      }
    } catch (error) {
      console.error('Erro ao adicionar interação:', error);
      alert('Erro ao adicionar interação');
    }
  };

  const exportarTranscript = async (formato = 'txt') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/demandas/${demandaId}/transcript?formato=${formato}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        if (formato === 'txt') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `transcript_${detalhes.demanda.protocolo}.txt`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `transcript_${detalhes.demanda.protocolo}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } else {
        alert('Erro ao exportar transcript');
      }
    } catch (error) {
      console.error('Erro ao exportar transcript:', error);
      alert('Erro ao exportar transcript');
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  const getStatusColor = (status) => {
    const cores = {
      'pendente': '#ff9800',
      'em_andamento': '#2196f3',
      'respondida': '#4caf50',
      'resolvida': '#4caf50',
      'arquivada': '#9e9e9e'
    };
    return cores[status] || '#757575';
  };

  const getPrioridadeColor = (prioridade) => {
    const cores = {
      'baixa': '#4caf50',
      'normal': '#2196f3',
      'alta': '#ff9800',
      'urgente': '#f44336'
    };
    return cores[prioridade] || '#757575';
  };

  if (carregando) {
    return (
      <div className="detalhes-demanda-overlay">
        <div className="detalhes-demanda-content">
          <div className="carregando">Carregando detalhes...</div>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="detalhes-demanda-overlay">
        <div className="detalhes-demanda-content">
          <div className="erro">
            <h3>Erro</h3>
            <p>{erro}</p>
            <button onClick={onClose}>Fechar</button>
          </div>
        </div>
      </div>
    );
  }

  if (!detalhes) {
    return null;
  }

  return (
    <div className="detalhes-demanda-overlay">
      <div className="detalhes-demanda-content">
        {/* Cabeçalho */}
        <div className="detalhes-header">
          <h2>Detalhes da Demanda - {detalhes.demanda.protocolo}</h2>
          <div className="header-actions">
            <button 
              onClick={() => exportarTranscript('txt')}
              className="btn-exportar"
            >
              📄 Exportar TXT
            </button>
            <button 
              onClick={() => exportarTranscript('json')}
              className="btn-exportar"
            >
              📊 Exportar JSON
            </button>
            <button onClick={onClose} className="btn-fechar">
              ✕
            </button>
          </div>
        </div>

        {/* Informações da Demanda */}
        <div className="detalhes-info">
          <div className="info-grid">
            <div className="info-item">
              <label>Protocolo:</label>
              <span>{detalhes.demanda.protocolo}</span>
            </div>
            <div className="info-item">
              <label>Secretaria:</label>
              <span>{detalhes.demanda.secretaria}</span>
            </div>
            <div className="info-item">
              <label>Categoria:</label>
              <span>{detalhes.demanda.categoria}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(detalhes.demanda.status) }}
              >
                {detalhes.demanda.status}
              </span>
            </div>
            <div className="info-item">
              <label>Prioridade:</label>
              <span 
                className="prioridade-badge"
                style={{ backgroundColor: getPrioridadeColor(detalhes.demanda.prioridade) }}
              >
                {detalhes.demanda.prioridade}
              </span>
            </div>
            <div className="info-item">
              <label>Usuário:</label>
              <span>{detalhes.demanda.usuario_anonimizado || 'Anônimo'}</span>
            </div>
            <div className="info-item">
              <label>Data de Criação:</label>
              <span>{formatarData(detalhes.demanda.data_criacao)}</span>
            </div>
            <div className="info-item">
              <label>Última Atualização:</label>
              <span>{detalhes.demanda.data_atualizacao ? formatarData(detalhes.demanda.data_atualizacao) : 'Não atualizada'}</span>
            </div>
            <div className="info-item">
              <label>Responsável:</label>
              <span>{detalhes.demanda.responsavel || 'Não atribuído'}</span>
            </div>
          </div>

          {detalhes.demanda.resumo_mensagem && (
            <div className="info-item full-width">
              <label>Resumo da Mensagem:</label>
              <p>{detalhes.demanda.resumo_mensagem}</p>
            </div>
          )}

          {detalhes.demanda.descricao_completa && (
            <div className="info-item full-width">
              <label>Descrição Completa:</label>
              <p>{detalhes.demanda.descricao_completa}</p>
            </div>
          )}
        </div>

        {/* Histórico de Interações */}
        <div className="historico-section">
          <div className="historico-header">
            <h3>Histórico de Interações ({detalhes.historico.total_interacoes})</h3>
            <button 
              onClick={() => setMostrarFormInteracao(!mostrarFormInteracao)}
              className="btn-adicionar-interacao"
            >
              ➕ Adicionar Interação
            </button>
          </div>

          {/* Formulário para adicionar interação */}
          {mostrarFormInteracao && (
            <form onSubmit={adicionarInteracao} className="form-interacao">
              <textarea
                value={novaInteracao}
                onChange={(e) => setNovaInteracao(e.target.value)}
                placeholder="Digite sua interação..."
                rows={3}
                required
              />
              <div className="form-actions">
                <button type="submit" className="btn-confirmar">
                  Adicionar
                </button>
                <button 
                  type="button" 
                  onClick={() => setMostrarFormInteracao(false)}
                  className="btn-cancelar"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Lista de interações */}
          <div className="historico-lista">
            {detalhes.historico.interacoes.length === 0 ? (
              <p className="sem-interacoes">Nenhuma interação registrada.</p>
            ) : (
              detalhes.historico.interacoes.map((interacao, index) => (
                <div 
                  key={interacao.id} 
                  className={`interacao-item ${interacao.origem === 'usuário' ? 'usuario' : 'atendente'}`}
                >
                  <div className="interacao-header">
                    <span className="interacao-origem">
                      {interacao.origem === 'usuário' ? '👤 Usuário' : '🤖 Atendente'}
                    </span>
                    <span className="interacao-timestamp">
                      {formatarData(interacao.timestamp)}
                    </span>
                    {interacao.responsavel && (
                      <span className="interacao-responsavel">
                        por {interacao.responsavel}
                      </span>
                    )}
                  </div>
                  <div className="interacao-mensagem">
                    {interacao.mensagem}
                  </div>
                  {interacao.tipo_midia && (
                    <div className="interacao-midia">
                      📎 {interacao.tipo_midia}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalhesDemanda; 