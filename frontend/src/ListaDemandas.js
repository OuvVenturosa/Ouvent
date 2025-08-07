import React, { useState, useEffect } from 'react';
import './ListaDemandas.css';
import DetalhesDemanda from './DetalhesDemanda';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function ListaDemandas() {
  const [demandas, setDemandas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [filtros, setFiltros] = useState({
    secretaria: '',
    status: '',
    prioridade: '',
    categoria: '',
    dataInicial: '',
    dataFinal: '',
    protocolo: ''
  });
  const [ordenacao, setOrdenacao] = useState({
    campo: 'data_criacao',
    ordem: 'DESC'
  });
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    limite: 50,
    total: 0,
    totalPaginas: 0
  });
  const [opcoesFiltro, setOpcoesFiltro] = useState({
    status: [],
    prioridade: [],
    categorias: []
  });
  const [secretarias, setSecretarias] = useState([]);
  const [modalAcao, setModalAcao] = useState({
    aberto: false,
    tipo: '',
    demanda: null,
    dados: {}
  });

  // Estado para detalhes da demanda
  const [detalhesDemanda, setDetalhesDemanda] = useState({
    aberto: false,
    demandaId: null
  });

  // Carregar opções de filtro
  useEffect(() => {
    carregarOpcoesFiltro();
    carregarSecretarias();
  }, []);

  // Carregar demandas quando filtros ou ordenação mudarem
  useEffect(() => {
    carregarDemandas();
  }, [filtros, ordenacao, paginacao.pagina]);

  const carregarOpcoesFiltro = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/demandas/filtros`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOpcoesFiltro(data);
      }
    } catch (error) {
      console.error('Erro ao carregar opções de filtro:', error);
    }
  };

  const carregarSecretarias = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/secretarias`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSecretarias(data);
        
        // Se o usuário só tem acesso a uma secretaria, definir como filtro padrão
        if (data.length === 1) {
          setFiltros(prev => ({ ...prev, secretaria: data[0] }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar secretarias:', error);
    }
  };

  const carregarDemandas = async () => {
    setCarregando(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        ...filtros,
        ordenarPor: ordenacao.campo,
        ordem: ordenacao.ordem,
        pagina: paginacao.pagina,
        limite: paginacao.limite
      });

      const response = await fetch(`${API_URL}/demandas/lista?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDemandas(data.demandas);
        setPaginacao(prev => ({
          ...prev,
          total: data.paginacao.total,
          totalPaginas: data.paginacao.totalPaginas
        }));
      } else {
        console.error('Erro ao carregar demandas');
      }
    } catch (error) {
      console.error('Erro ao carregar demandas:', error);
    } finally {
      setCarregando(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPaginacao(prev => ({ ...prev, pagina: 1 }));
  };

  const handleOrdenacao = (campo) => {
    setOrdenacao(prev => ({
      campo,
      ordem: prev.campo === campo && prev.ordem === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  const handleAcaoRapida = (tipo, demanda) => {
    setModalAcao({
      aberto: true,
      tipo,
      demanda,
      dados: {}
    });
  };

  const abrirDetalhesDemanda = (demandaId) => {
    setDetalhesDemanda({
      aberto: true,
      demandaId
    });
  };

  const fecharDetalhesDemanda = () => {
    setDetalhesDemanda({
      aberto: false,
      demandaId: null
    });
  };

  const executarAcao = async () => {
    const { tipo, demanda, dados } = modalAcao;
    const token = localStorage.getItem('token');

    try {
      let url = `${API_URL}/demandas/${demanda.id}`;
      let method = 'POST';
      let body = {};

      switch (tipo) {
        case 'responder':
          url += '/responder';
          body = { resposta: dados.resposta, anexo: dados.anexo };
          break;
        case 'arquivar':
          url += '/arquivar';
          body = { motivo: dados.motivo };
          break;
        case 'reclassificar':
          url += '/reclassificar';
          body = {
            novaCategoria: dados.novaCategoria,
            novaPrioridade: dados.novaPrioridade,
            novaSecretaria: dados.novaSecretaria,
            motivo: dados.motivo
          };
          break;
        default:
          return;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        alert('Ação executada com sucesso!');
        setModalAcao({ aberto: false, tipo: '', demanda: null, dados: {} });
        carregarDemandas();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.erro}`);
      }
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      alert('Erro ao executar ação');
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

  const renderModalAcao = () => {
    if (!modalAcao.aberto) return null;

    const { tipo, demanda, dados } = modalAcao;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Ação Rápida - {tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h3>
          <p><strong>Protocolo:</strong> {demanda.protocolo}</p>
          <p><strong>Secretaria:</strong> {demanda.secretaria}</p>
          
          {tipo === 'responder' && (
            <div>
              <label>Resposta:</label>
              <textarea
                value={dados.resposta || ''}
                onChange={(e) => setModalAcao(prev => ({
                  ...prev,
                  dados: { ...prev.dados, resposta: e.target.value }
                }))}
                rows={4}
                placeholder="Digite sua resposta..."
              />
            </div>
          )}

          {tipo === 'arquivar' && (
            <div>
              <label>Motivo do Arquivamento:</label>
              <textarea
                value={dados.motivo || ''}
                onChange={(e) => setModalAcao(prev => ({
                  ...prev,
                  dados: { ...prev.dados, motivo: e.target.value }
                }))}
                rows={3}
                placeholder="Motivo do arquivamento (opcional)"
              />
            </div>
          )}

          {tipo === 'reclassificar' && (
            <div>
              <label>Nova Categoria:</label>
              <select
                value={dados.novaCategoria || ''}
                onChange={(e) => setModalAcao(prev => ({
                  ...prev,
                  dados: { ...prev.dados, novaCategoria: e.target.value }
                }))}
              >
                <option value="">Selecione...</option>
                {opcoesFiltro.categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <label>Nova Prioridade:</label>
              <select
                value={dados.novaPrioridade || ''}
                onChange={(e) => setModalAcao(prev => ({
                  ...prev,
                  dados: { ...prev.dados, novaPrioridade: e.target.value }
                }))}
              >
                <option value="">Selecione...</option>
                {opcoesFiltro.prioridade.map(pri => (
                  <option key={pri} value={pri}>{pri}</option>
                ))}
              </select>

              <label>Nova Secretaria:</label>
              <select
                value={dados.novaSecretaria || ''}
                onChange={(e) => setModalAcao(prev => ({
                  ...prev,
                  dados: { ...prev.dados, novaSecretaria: e.target.value }
                }))}
              >
                <option value="">Selecione...</option>
                {secretarias.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>

              <label>Motivo da Reclassificação:</label>
              <textarea
                value={dados.motivo || ''}
                onChange={(e) => setModalAcao(prev => ({
                  ...prev,
                  dados: { ...prev.dados, motivo: e.target.value }
                }))}
                rows={3}
                placeholder="Motivo da reclassificação"
              />
            </div>
          )}

          <div className="modal-actions">
            <button onClick={executarAcao} className="btn-primary">
              Confirmar
            </button>
            <button 
              onClick={() => setModalAcao({ aberto: false, tipo: '', demanda: null, dados: {} })}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const popularDadosExemplo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/demandas/popular-exemplo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(data.mensagem);
        carregarDemandas();
      } else {
        alert('Erro ao popular dados de exemplo');
      }
    } catch (error) {
      console.error('Erro ao popular dados:', error);
      alert('Erro ao popular dados de exemplo');
    }
  };

  return (
    <div className="lista-demandas">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Lista de Demandas das Secretarias</h2>
        <button 
          onClick={popularDadosExemplo}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📊 Popular Dados de Exemplo
        </button>
      </div>
      
      {/* Informação de Controle de Acesso */}
      {secretarias.length === 1 && (
        <div className="info-acesso">
          <p>🔒 <strong>Controle de Acesso:</strong> Você está visualizando apenas as demandas da sua secretaria.</p>
        </div>
      )}
      
      {/* Filtros */}
      <div className="filtros">
        <div className="filtro-grupo">
          <label>Protocolo:</label>
          <input
            type="text"
            placeholder="Digite o protocolo..."
            value={filtros.protocolo}
            onChange={(e) => handleFiltroChange('protocolo', e.target.value)}
          />
        </div>
        <div className="filtro-grupo">
          <label>Secretaria:</label>
          <select
            value={filtros.secretaria}
            onChange={(e) => handleFiltroChange('secretaria', e.target.value)}
          >
            <option value="">Todas</option>
            {secretarias.map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>Status:</label>
          <select
            value={filtros.status}
            onChange={(e) => handleFiltroChange('status', e.target.value)}
          >
            <option value="">Todos</option>
            {opcoesFiltro.status.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>Prioridade:</label>
          <select
            value={filtros.prioridade}
            onChange={(e) => handleFiltroChange('prioridade', e.target.value)}
          >
            <option value="">Todas</option>
            {opcoesFiltro.prioridade.map(pri => (
              <option key={pri} value={pri}>{pri}</option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>Categoria:</label>
          <select
            value={filtros.categoria}
            onChange={(e) => handleFiltroChange('categoria', e.target.value)}
          >
            <option value="">Todas</option>
            {opcoesFiltro.categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>Data Inicial:</label>
          <input
            type="date"
            value={filtros.dataInicial}
            onChange={(e) => handleFiltroChange('dataInicial', e.target.value)}
          />
        </div>

        <div className="filtro-grupo">
          <label>Data Final:</label>
          <input
            type="date"
            value={filtros.dataFinal}
            onChange={(e) => handleFiltroChange('dataFinal', e.target.value)}
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="tabela-container">
        {carregando ? (
          <div className="carregando">Carregando demandas...</div>
        ) : (
          <table className="tabela-demandas">
            <thead>
              <tr>
                <th onClick={() => handleOrdenacao('id')}>
                  ID {ordenacao.campo === 'id' && (ordenacao.ordem === 'ASC' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleOrdenacao('protocolo')}>
                  Protocolo {ordenacao.campo === 'protocolo' && (ordenacao.ordem === 'ASC' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleOrdenacao('data_criacao')}>
                  Data/Hora {ordenacao.campo === 'data_criacao' && (ordenacao.ordem === 'ASC' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleOrdenacao('usuario_anonimizado')}>
                  Usuário {ordenacao.campo === 'usuario_anonimizado' && (ordenacao.ordem === 'ASC' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleOrdenacao('categoria')}>
                  Categoria {ordenacao.campo === 'categoria' && (ordenacao.ordem === 'ASC' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleOrdenacao('status')}>
                  Status {ordenacao.campo === 'status' && (ordenacao.ordem === 'ASC' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleOrdenacao('prioridade')}>
                  Prioridade {ordenacao.campo === 'prioridade' && (ordenacao.ordem === 'ASC' ? '↑' : '↓')}
                </th>
                <th>Resumo da Mensagem</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {demandas.map(demanda => (
                <tr key={demanda.id}>
                  <td>{demanda.id}</td>
                  <td>{demanda.protocolo}</td>
                  <td>{formatarData(demanda.data_criacao)}</td>
                  <td>{demanda.usuario_anonimizado || 'Anônimo'}</td>
                  <td>{demanda.categoria}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(demanda.status) }}
                    >
                      {demanda.status}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="prioridade-badge"
                      style={{ backgroundColor: getPrioridadeColor(demanda.prioridade) }}
                    >
                      {demanda.prioridade}
                    </span>
                  </td>
                  <td className="resumo-mensagem">
                    {demanda.resumo_mensagem || 'Sem resumo'}
                  </td>
                  <td className="acoes">
                    <button
                      onClick={() => abrirDetalhesDemanda(demanda.id)}
                      className="btn-acao btn-detalhes"
                      title="Ver Detalhes"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => handleAcaoRapida('responder', demanda)}
                      className="btn-acao btn-responder"
                      title="Responder"
                    >
                      📝
                    </button>
                    <button
                      onClick={() => handleAcaoRapida('arquivar', demanda)}
                      className="btn-acao btn-arquivar"
                      title="Arquivar"
                    >
                      📁
                    </button>
                    <button
                      onClick={() => handleAcaoRapida('reclassificar', demanda)}
                      className="btn-acao btn-reclassificar"
                      title="Reclassificar"
                    >
                      🔄
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginação */}
      {paginacao.totalPaginas > 1 && (
        <div className="paginacao">
          <button
            onClick={() => setPaginacao(prev => ({ ...prev, pagina: prev.pagina - 1 }))}
            disabled={paginacao.pagina === 1}
            className="btn-pagina"
          >
            Anterior
          </button>
          
          <span className="info-pagina">
            Página {paginacao.pagina} de {paginacao.totalPaginas} 
            ({paginacao.total} registros)
          </span>
          
          <button
            onClick={() => setPaginacao(prev => ({ ...prev, pagina: prev.pagina + 1 }))}
            disabled={paginacao.pagina === paginacao.totalPaginas}
            className="btn-pagina"
          >
            Próxima
          </button>
        </div>
      )}

      {renderModalAcao()}

      {/* Modal de Detalhes da Demanda */}
      {detalhesDemanda.aberto && (
        <DetalhesDemanda 
          demandaId={detalhesDemanda.demandaId}
          onClose={fecharDetalhesDemanda}
        />
      )}
    </div>
  );
}

export default ListaDemandas; 