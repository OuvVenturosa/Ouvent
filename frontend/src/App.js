import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import logoOuvidoria from './logo_ouvidoria.png';
import logoPrefeitura from './logo_prefeitura.png';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import EstatisticasDemandas from './EstatisticasDemandas';
import ListaDemandas from './ListaDemandas';
import EditorResposta from './EditorResposta';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function App() {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [tela, setTela] = useState('login'); // 'login' | 'esqueci' | 'logado' | 'responder'
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [resposta, setResposta] = useState('');
  const [solSelecionada, setSolSelecionada] = useState(null);

  // Estado para cadastro de responsável
  const [novoResp, setNovoResp] = useState({ cpf: '', telefone: '', email: '', secretaria: '' });
  const [msgCadastro, setMsgCadastro] = useState('');
  const [mostrarFormCadastro, setMostrarFormCadastro] = useState(false);
  const [credenciaisCadastro, setCredenciaisCadastro] = useState(null);
  const [carregandoCadastro, setCarregandoCadastro] = useState(false);

  // Estado para solicitações de todas as secretarias (master)
  const [todasSolicitacoes, setTodasSolicitacoes] = useState({});
  const [carregandoTodas, setCarregandoTodas] = useState(false);

  // Estado para filtro de relatório
  const [relPeriodo, setRelPeriodo] = useState({ inicio: '', fim: '' });
  const [relSecretarias, setRelSecretarias] = useState([]);
  const [relSecretariasDisponiveis, setRelSecretariasDisponiveis] = useState([]);
  const [relFiltrado, setRelFiltrado] = useState([]);
  const [relCarregando, setRelCarregando] = useState(false);

  // Estado para histórico
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [historicoSolicitacao, setHistoricoSolicitacao] = useState([]);
  const [historicoCarregando, setHistoricoCarregando] = useState(false);
  const [historicoProtocolo, setHistoricoProtocolo] = useState('');

  // Estado para detalhes completos
  const [detalhesAberto, setDetalhesAberto] = useState(false);
  const [detalhesSolicitacao, setDetalhesSolicitacao] = useState(null);
  const [detalhesHistorico, setDetalhesHistorico] = useState([]);
  const [detalhesCarregando, setDetalhesCarregando] = useState(false);
  const [respostaDetalhe, setRespostaDetalhe] = useState('');
  const [comentarioDetalhe, setComentarioDetalhe] = useState('');
  const [anexoDetalhe, setAnexoDetalhe] = useState(null);

  // Estado para encaminhamento ao ouvidor
  const [mostrarModalEncaminhamento, setMostrarModalEncaminhamento] = useState(false);
  const [solicitacaoEncaminhamento, setSolicitacaoEncaminhamento] = useState(null);
  const [motivoEncaminhamento, setMotivoEncaminhamento] = useState('');
  const [solicitacoesEncaminhadas, setSolicitacoesEncaminhadas] = useState([]);
  const [mostrarModalResolucaoOuvidor, setMostrarModalResolucaoOuvidor] = useState(false);
  const [solicitacaoResolucao, setSolicitacaoResolucao] = useState(null);
  const [respostaOuvidor, setRespostaOuvidor] = useState('');
  const [statusFinal, setStatusFinal] = useState('Finalizado');

  // Estado para gerenciamento de usuários
  const [usuarios, setUsuarios] = useState([]);
  const [secretarias, setSecretarias] = useState([]);
  const [mostrarGerenciarUsuarios, setMostrarGerenciarUsuarios] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [novoUsuario, setNovoUsuario] = useState({ cpf: '', telefone: '', email: '', secretaria: '', is_master: false });

  // Estado para lista de demandas
  const [mostrarListaDemandas, setMostrarListaDemandas] = useState(false);

  // Estado para editor de respostas
  const [mostrarEditorResposta, setMostrarEditorResposta] = useState(false);
  const [demandaEditorResposta, setDemandaEditorResposta] = useState(null);

  // Login real com backend
  const handleLogin = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const resp = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, senha })
      });
      const data = await resp.json();
      if (resp.ok) {
        setToken(data.token);
        setUsuario(data.usuario);
        setTela('logado');
      } else {
        setMensagem(data.erro || 'Erro ao fazer login.');
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor.');
    }
  };

  // Esqueci a senha real com backend
  const handleEsqueciSenha = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const resp = await fetch(`${API_URL}/esqueci-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await resp.json();
      if (resp.ok) {
        setMensagem(data.mensagem || 'Se o email estiver cadastrado, você receberá uma nova senha.');
      } else {
        setMensagem(data.erro || 'Erro ao solicitar nova senha.');
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor.');
    }
  };

  // Função para cadastrar responsável (apenas master)
  const handleCadastroResp = async (e) => {
    e.preventDefault();
    setMsgCadastro('');
    setCarregandoCadastro(true);
    try {
      const resp = await fetch(`${API_URL}/cadastrar-responsavel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(novoResp)
      });
      const data = await resp.json();
      if (resp.ok) {
        setCredenciaisCadastro(data.dados_cadastro);
        setMsgCadastro(data.mensagem);
        setNovoResp({ cpf: '', telefone: '', email: '', secretaria: '' });
        setMostrarFormCadastro(false);
      } else {
        setMsgCadastro(data.erro || 'Erro ao cadastrar responsável.');
      }
    } catch (err) {
      setMsgCadastro('Erro de conexão com o servidor.');
    } finally {
      setCarregandoCadastro(false);
    }
  };

  // Buscar solicitações ao logar
  useEffect(() => {
    if (tela === 'logado' && token) {
      fetch(`${API_URL}/solicitacoes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(resp => resp.json())
        .then(data => {
          setSolicitacoes(Array.isArray(data) ? data : []);
        });
    }
  }, [tela, token]);

  // Buscar todas as solicitações se master
  useEffect(() => {
    if (tela === 'logado' && usuario?.is_master === 1 && token) {
      setCarregandoTodas(true);
      fetch(`${API_URL}/solicitacoes-todas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(resp => resp.json())
        .then(data => {
          setTodasSolicitacoes(data);
          setCarregandoTodas(false);
        });
    }
  }, [tela, usuario, token]);

  // Atualizar secretarias disponíveis ao carregar todasSolicitacoes
  useEffect(() => {
    if (usuario?.is_master === 1 && todasSolicitacoes) {
      setRelSecretariasDisponiveis(Object.keys(todasSolicitacoes));
    }
  }, [todasSolicitacoes, usuario]);

  // Filtrar relatório
  const filtrarRelatorio = () => {
    setRelCarregando(true);
    let resultado = [];
    relSecretarias.forEach(sec => {
      if (todasSolicitacoes[sec]) {
        resultado = resultado.concat(
          todasSolicitacoes[sec].filter(sol => {
            const data = sol.data ? new Date(sol.data) : null;
            const inicio = relPeriodo.inicio ? new Date(relPeriodo.inicio) : null;
            const fim = relPeriodo.fim ? new Date(relPeriodo.fim) : null;
            let ok = true;
            if (inicio && data) ok = ok && data >= inicio;
            if (fim && data) ok = ok && data <= fim;
            return ok;
          })
        );
      }
    });
    setRelFiltrado(resultado);
    setRelCarregando(false);
  };

  // Enviar resposta
  const handleResponder = async (e, sol, resposta) => {
    e.preventDefault();
    if (!resposta.trim()) return;
    try {
      const resp = await fetch(`${API_URL}/solicitacoes/${sol.id}/responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resposta })
      });
      const data = await resp.json();
      if (resp.ok) {
        setMensagem('Solicitação respondida com sucesso!');
        setTela('logado');
        setResposta('');
        setSolSelecionada(null);
        // Atualizar lista
        fetch(`${API_URL}/solicitacoes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(resp => resp.json())
          .then(data => {
            setSolicitacoes(Array.isArray(data) ? data : []);
          });
      } else {
        setMensagem(data.erro || 'Erro ao responder.');
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor.');
    }
  };

  // Função para exportar dados
  const exportarTabela = (lista, secretaria, tipo) => {
    const dados = lista.map(sol => ({
      Protocolo: sol.protocolo,
      Pergunta: sol.pergunta,
      Status: sol.status,
      Resposta: sol.resposta || '-'
    }));
    if (tipo === 'excel' || tipo === 'csv' || tipo === 'html') {
      const ws = XLSX.utils.json_to_sheet(dados);
      let wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, secretaria);
      if (tipo === 'excel') {
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `solicitacoes_${secretaria}.xlsx`);
      } else if (tipo === 'csv') {
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv' });
        saveAs(blob, `solicitacoes_${secretaria}.csv`);
      } else if (tipo === 'html') {
        const html = XLSX.utils.sheet_to_html(ws);
        const blob = new Blob([html], { type: 'text/html' });
        saveAs(blob, `solicitacoes_${secretaria}.html`);
      }
    } else if (tipo === 'pdf') {
      const doc = new jsPDF();
      doc.text(`Solicitações - ${secretaria}`, 14, 14);
      doc.autoTable({
        head: [['Protocolo', 'Pergunta', 'Status', 'Resposta']],
        body: dados.map(d => [d.Protocolo, d.Pergunta, d.Status, d.Resposta]),
        startY: 22
      });
      doc.save(`solicitacoes_${secretaria}.pdf`);
    }
  };

  // Exportar relatório filtrado
  const exportarRelatorio = (tipo) => {
    const dados = relFiltrado.map(sol => ({
      Secretaria: sol.secretaria,
      Protocolo: sol.protocolo,
      Pergunta: sol.pergunta,
      Status: sol.status,
      Resposta: sol.resposta || '-',
      Data: sol.data || '-'
    }));
    if (dados.length === 0) return;
    if (tipo === 'excel' || tipo === 'csv' || tipo === 'html') {
      const ws = XLSX.utils.json_to_sheet(dados);
      let wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Relatorio');
      if (tipo === 'excel') {
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `relatorio_atendimentos.xlsx`);
      } else if (tipo === 'csv') {
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv' });
        saveAs(blob, `relatorio_atendimentos.csv`);
      } else if (tipo === 'html') {
        const html = XLSX.utils.sheet_to_html(ws);
        const blob = new Blob([html], { type: 'text/html' });
        saveAs(blob, `relatorio_atendimentos.html`);
      }
    } else if (tipo === 'pdf') {
      const doc = new jsPDF();
      doc.text(`Relatório de Atendimentos`, 14, 14);
      doc.autoTable({
        head: [['Secretaria', 'Protocolo', 'Pergunta', 'Status', 'Resposta', 'Data']],
        body: dados.map(d => [d.Secretaria, d.Protocolo, d.Pergunta, d.Status, d.Resposta, d.Data]),
        startY: 22
      });
      doc.save(`relatorio_atendimentos.pdf`);
    }
  };

  // Estatísticas do relatório filtrado
  const estatisticas = useMemo(() => {
    const porSecretaria = {};
    relFiltrado.forEach(sol => {
      if (!porSecretaria[sol.secretaria]) {
        porSecretaria[sol.secretaria] = { total: 0, respondidas: 0, pendentes: 0 };
      }
      porSecretaria[sol.secretaria].total++;
      if (sol.resposta && sol.resposta.trim() !== '-') {
        porSecretaria[sol.secretaria].respondidas++;
      } else {
        porSecretaria[sol.secretaria].pendentes++;
      }
    });
    return porSecretaria;
  }, [relFiltrado]);

  // Sugestão de solução para pendências (exemplo simples)
  const sugestaoSolucao = (secretaria) => {
    if (!estatisticas[secretaria] || estatisticas[secretaria].pendentes === 0) return null;
    return `Sugestão: Realizar força-tarefa para responder as pendências da secretaria ${secretaria}. Avaliar recursos, equipe e prazos.`;
  };

  // Dados para gráfico
  const chartData = useMemo(() => {
    const labels = Object.keys(estatisticas);
    return {
      labels,
      datasets: [
        {
          label: 'Total',
          data: labels.map(sec => estatisticas[sec].total),
          backgroundColor: '#003366',
        },
        {
          label: 'Respondidas',
          data: labels.map(sec => estatisticas[sec].respondidas),
          backgroundColor: '#4caf50',
        },
        {
          label: 'Pendentes',
          data: labels.map(sec => estatisticas[sec].pendentes),
          backgroundColor: '#f44336',
        },
      ],
    };
  }, [estatisticas]);

  const pieData = useMemo(() => {
    const pendentes = Object.keys(estatisticas).map(sec => estatisticas[sec].pendentes).reduce((a,b) => a+b, 0);
    const respondidas = Object.keys(estatisticas).map(sec => estatisticas[sec].respondidas).reduce((a,b) => a+b, 0);
    return {
      labels: ['Pendentes', 'Respondidas'],
      datasets: [
        {
          data: [pendentes, respondidas],
          backgroundColor: ['#f44336', '#4caf50'],
        },
      ],
    };
  }, [estatisticas]);

  // Função para atualizar status
  const atualizarStatus = async (sol, novoStatus) => {
    try {
      const resp = await fetch(`${API_URL}/solicitacoes/${sol.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: novoStatus })
      });
      const data = await resp.json();
      if (resp.ok) {
        // Atualizar lista após mudança
        fetch(`${API_URL}/solicitacoes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(resp => resp.json())
          .then(data => {
            setSolicitacoes(Array.isArray(data) ? data : []);
          });
      } else {
        alert(data.erro || 'Erro ao atualizar status.');
      }
    } catch (err) {
      alert('Erro de conexão com o servidor.');
    }
  };

  // Função para abrir histórico
  const abrirHistorico = async (sol) => {
    setHistoricoAberto(true);
    setHistoricoCarregando(true);
    setHistoricoProtocolo(sol.protocolo);
    try {
      const resp = await fetch(`${API_URL}/solicitacoes/${sol.id}/historico`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();
      setHistoricoSolicitacao(Array.isArray(data) ? data : []);
    } catch {
      setHistoricoSolicitacao([]);
    }
    setHistoricoCarregando(false);
  };

  // Função para abrir detalhes completos
  const abrirDetalhes = async (sol) => {
    setDetalhesAberto(true);
    setDetalhesCarregando(true);
    setRespostaDetalhe('');
    setComentarioDetalhe('');
    setAnexoDetalhe(null);
    try {
      const resp = await fetch(`${API_URL}/solicitacoes/${sol.id}/detalhes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();
      setDetalhesSolicitacao(data.solicitacao);
      setDetalhesHistorico(Array.isArray(data.historico) ? data.historico : []);
    } catch {
      setDetalhesSolicitacao(null);
      setDetalhesHistorico([]);
    }
    setDetalhesCarregando(false);
  };

  // Função para responder direto do modal de detalhes
  const responderDetalhes = async (e) => {
    e.preventDefault();
    if (!respostaDetalhe.trim()) return;
    await handleResponder({ preventDefault: () => {} }, detalhesSolicitacao, respostaDetalhe);
    setRespostaDetalhe('');
    setDetalhesAberto(false);
  };

  // Função para adicionar comentário
  const comentarDetalhes = async (e) => {
    e.preventDefault();
    if (!comentarioDetalhe.trim()) return;
    const formData = new FormData();
    formData.append('comentario', comentarioDetalhe);
    if (anexoDetalhe) formData.append('anexo', anexoDetalhe);
    await fetch(`${API_URL}/solicitacoes/${detalhesSolicitacao.id}/comentario`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    setComentarioDetalhe('');
    setAnexoDetalhe(null);
    abrirDetalhes(detalhesSolicitacao); // Recarrega detalhes
  };

  // Função para validar tipo de arquivo
  const tiposPermitidos = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const handleAnexoChange = (e) => {
    const file = e.target.files[0];
    if (file && !tiposPermitidos.includes(file.type)) {
      alert('Tipo de arquivo não permitido. Envie PDF, DOC, JPG, JPEG, PNG, XLS ou XLSX.');
      e.target.value = '';
      setAnexoDetalhe(null);
      return;
    }
    setAnexoDetalhe(file);
  };

  // Função para obter cor do prazo
  const getPrazoColor = (statusPrazo) => {
    switch (statusPrazo) {
      case 'vencida': return '#ff4444';
      case 'vence_hoje': return '#ffaa00';
      case 'dentro_prazo': return '#44aa44';
      default: return '#666666';
    }
  };

  // Função para obter texto do prazo
  const getPrazoText = (statusPrazo, diasRestantes) => {
    switch (statusPrazo) {
      case 'vencida': return `Vencida há ${Math.abs(diasRestantes)} dias`;
      case 'vence_hoje': return 'Vence hoje';
      case 'dentro_prazo': return `${diasRestantes} dias restantes`;
      default: return 'Prazo não definido';
    }
  };

  // Função para verificar alertas manualmente
  const verificarAlertas = async () => {
    try {
      const response = await fetch(`${API_URL}/verificar-alertas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      alert('Verificação de alertas executada com sucesso!');
    } catch (error) {
      alert('Erro ao verificar alertas');
    }
  };

  // Função para carregar todas as solicitações (master)
  const carregarSolicitacoesTodas = async () => {
    if (usuario?.is_master === 1 && token) {
      setCarregandoTodas(true);
      try {
        const response = await fetch(`${API_URL}/solicitacoes-todas`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setTodasSolicitacoes(data);
        setCarregandoTodas(false);
      } catch (error) {
        console.error('Erro ao carregar todas as solicitações:', error);
        setCarregandoTodas(false);
      }
    }
  };

  // Função para carregar solicitações da secretaria
  const carregarSolicitacoes = async () => {
    if (token) {
      try {
        const response = await fetch(`${API_URL}/solicitacoes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setSolicitacoes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erro ao carregar solicitações:', error);
      }
    }
  };

  // Função para redefinir alertas
  const redefinirAlertas = async (solicitacaoId) => {
    try {
      const response = await fetch(`${API_URL}/redefinir-alertas/${solicitacaoId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      alert('Alertas redefinidos com sucesso!');
      carregarSolicitacoesTodas();
    } catch (error) {
      alert('Erro ao redefinir alertas');
    }
  };

  // Função para marcar encaminhamento ao ouvidor
  const marcarEncaminhamento = async (solicitacao, encaminhar) => {
    if (encaminhar) {
      setSolicitacaoEncaminhamento(solicitacao);
      setMostrarModalEncaminhamento(true);
    } else {
      await executarEncaminhamento(solicitacao.id, false);
    }
  };

  // Função para executar o encaminhamento
  const executarEncaminhamento = async (solicitacaoId, encaminhar, motivo = '') => {
    try {
      const response = await fetch(`${API_URL}/solicitacoes/${solicitacaoId}/encaminhar-ouvidor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ encaminhar, motivo })
      });
      const data = await response.json();
      alert(data.mensagem);
      carregarSolicitacoes();
      setMostrarModalEncaminhamento(false);
      setMotivoEncaminhamento('');
    } catch (error) {
      alert('Erro ao marcar encaminhamento');
    }
  };

  // Função para ver detalhes de uma solicitação
  const verSolicitacao = (solicitacao) => {
    setDetalhesSolicitacao(solicitacao);
    setDetalhesAberto(true);
  };

  // Função para carregar solicitações encaminhadas
  const carregarSolicitacoesEncaminhadas = async () => {
    try {
      const response = await fetch(`${API_URL}/solicitacoes-encaminhadas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSolicitacoesEncaminhadas(data);
    } catch (error) {
      console.error('Erro ao carregar solicitações encaminhadas:', error);
    }
  };

  // Função para resolver solicitação encaminhada
  const resolverEncaminhamento = async () => {
    try {
      const response = await fetch(`${API_URL}/solicitacoes/${solicitacaoResolucao.id}/resolver-encaminhamento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resposta_ouvidor: respostaOuvidor, status_final: statusFinal })
      });
      const data = await response.json();
      alert(data.mensagem);
      setMostrarModalResolucaoOuvidor(false);
      setRespostaOuvidor('');
      setStatusFinal('Finalizado');
      carregarSolicitacoesEncaminhadas();
    } catch (error) {
      alert('Erro ao resolver solicitação');
    }
  };

  // =============================================
  // FUNÇÕES DE GERENCIAMENTO DE USUÁRIOS
  // =============================================

  // Função para carregar usuários
  const carregarUsuarios = async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  // Função para carregar secretarias
  const carregarSecretarias = async () => {
    try {
      const response = await fetch(`${API_URL}/secretarias`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSecretarias(data);
    } catch (error) {
      console.error('Erro ao carregar secretarias:', error);
    }
  };

  // Função para salvar usuário
  const salvarUsuario = async (e) => {
    e.preventDefault();
    try {
      const url = usuarioEditando 
        ? `${API_URL}/usuarios/${usuarioEditando.id}`
        : `${API_URL}/cadastrar-responsavel`;
      
      const method = usuarioEditando ? 'PUT' : 'POST';
      const body = usuarioEditando 
        ? { ...novoUsuario, is_master: novoUsuario.is_master ? 1 : 0 }
        : novoUsuario;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      if (response.ok) {
        alert(data.mensagem || 'Usuário salvo com sucesso!');
        setNovoUsuario({ cpf: '', telefone: '', email: '', secretaria: '', is_master: false });
        setUsuarioEditando(null);
        carregarUsuarios();
      } else {
        alert(data.erro || 'Erro ao salvar usuário');
      }
    } catch (error) {
      alert('Erro de conexão com o servidor');
    }
  };

  // Função para editar usuário
  const editarUsuario = (usuario) => {
    setUsuarioEditando(usuario);
    setNovoUsuario({
      cpf: usuario.cpf,
      telefone: usuario.telefone,
      email: usuario.email,
      secretaria: usuario.secretaria,
      is_master: usuario.is_master === 1
    });
  };

  // Função para excluir usuário
  const excluirUsuario = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.mensagem);
        carregarUsuarios();
      } else {
        alert(data.erro || 'Erro ao excluir usuário');
      }
    } catch (error) {
      alert('Erro de conexão com o servidor');
    }
  };

  // Função para redefinir senha
  const redefinirSenha = async (id) => {
    if (!window.confirm('Tem certeza que deseja redefinir a senha deste usuário?')) return;
    
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}/redefinir-senha`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.mensagem);
      } else {
        alert(data.erro || 'Erro ao redefinir senha');
      }
    } catch (error) {
      alert('Erro de conexão com o servidor');
    }
  };

  // Funções para editor de respostas
  const abrirEditorResposta = (demanda) => {
    setDemandaEditorResposta(demanda);
    setMostrarEditorResposta(true);
  };

  const fecharEditorResposta = () => {
    setMostrarEditorResposta(false);
    setDemandaEditorResposta(null);
  };

  const handleRespostaEnviada = () => {
    carregarSolicitacoes();
    if (usuario?.is_master) {
      carregarSolicitacoesTodas();
    }
  };

  useEffect(() => {
    if (tela === 'logado' && usuario?.is_master === 1) {
      carregarSecretarias();
    }
  }, [tela, usuario]);

  // Função para copiar credenciais para área de transferência
  const copiarCredenciais = () => {
    if (credenciaisCadastro) {
      const texto = `Credenciais de Acesso - Sistema da Ouvidoria

CPF: ${credenciaisCadastro.cpf}
Email: ${credenciaisCadastro.email}
Secretaria: ${credenciaisCadastro.secretaria}
Senha: ${credenciaisCadastro.senha}
URL do Sistema: ${credenciaisCadastro.url_sistema}

⚠️ IMPORTANTE: Guarde essas informações em local seguro!`;
      
      navigator.clipboard.writeText(texto).then(() => {
        alert('Credenciais copiadas para a área de transferência!');
      }).catch(() => {
        alert('Erro ao copiar credenciais. Copie manualmente.');
      });
    }
  };

  // Função para reenviar email com credenciais
  const reenviarEmail = async () => {
    if (credenciaisCadastro) {
      try {
        const resp = await fetch(`${API_URL}/reenviar-email-credenciais`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            email: credenciaisCadastro.email,
            cpf: credenciaisCadastro.cpf,
            secretaria: credenciaisCadastro.secretaria,
            senha: credenciaisCadastro.senha
          })
        });
        
        if (resp.ok) {
          alert('Email reenviado com sucesso!');
        } else {
          alert('Erro ao reenviar email.');
        }
      } catch (error) {
        alert('Erro de conexão ao reenviar email.');
      }
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <img src={logoPrefeitura} alt="Logo Prefeitura" className="logo-prefeitura" />
        <div className="titulo-ouvidoria">
          <h1>Ouvidoria Municipal de Venturosa</h1>
        </div>
        <img src={logoOuvidoria} alt="Logo Ouvidoria" className="logo-ouvidoria" />
      </header>
      <main className="app-main">
        {tela === 'login' && (
          <form className="login-form" onSubmit={handleLogin}>
            <h2>Login</h2>
            <input
              type="text"
              placeholder="CPF (somente números)"
              value={cpf}
              onChange={e => setCpf(e.target.value.replace(/\D/g, ''))}
              maxLength={11}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
            />
            <button type="submit">Entrar</button>
            <button type="button" className="link-btn" onClick={() => setTela('esqueci')}>Esqueci a senha</button>
            {mensagem && <div className="mensagem-erro">{mensagem}</div>}
          </form>
        )}
        {tela === 'esqueci' && (
          <form className="login-form" onSubmit={handleEsqueciSenha}>
            <h2>Redefinir Senha</h2>
            <input
              type="email"
              placeholder="Email cadastrado"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button type="submit">Enviar nova senha</button>
            <button type="button" className="link-btn" onClick={() => setTela('login')}>Voltar ao login</button>
            {mensagem && <div className="mensagem-erro">{mensagem}</div>}
          </form>
        )}
        {tela === 'logado' && (
          <div>
            <h2>Solicitações da Secretaria</h2>
            {solicitacoes.length === 0 ? (
              <p>Nenhuma solicitação encontrada.</p>
            ) : (
              <table className="tabela-solicitacoes">
                <thead>
                  <tr>
                                          <th>Protocolo</th>
                      <th>Pergunta</th>
                      <th>Status</th>
                      <th>Prazo</th>
                      <th>Resposta</th>
                      <th>Encaminhar</th>
                      <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitacoes.map(sol => (
                    <tr key={sol.id}>
                      <td>{sol.protocolo}</td>
                      <td>{sol.pergunta}</td>
                      <td>
                        <select value={sol.status} onChange={e => atualizarStatus(sol, e.target.value)} style={{minWidth:120}}>
                          <option value="Em aberto">Em aberto</option>
                          <option value="Em andamento">Em andamento</option>
                          <option value="Finalizado">Finalizado</option>
                        </select>
                      </td>
                      <td style={{color: getPrazoColor(sol.status_prazo), fontWeight: 'bold'}}>
                        {getPrazoText(sol.status_prazo, sol.dias_restantes)}
                      </td>
                      <td>{sol.resposta || '-'}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={sol.encaminhar_ouvidor === 1}
                          onChange={(e) => marcarEncaminhamento(sol, e.target.checked)}
                          title="Marcar para encaminhamento ao ouvidor geral"
                        />
                      </td>
                      <td>
                        {!sol.resposta && (
                          <button onClick={() => { setSolSelecionada(sol); setTela('responder'); setMensagem(''); }}>Responder</button>
                        )}
                        <button onClick={() => abrirEditorResposta(sol)} style={{marginLeft:8, backgroundColor: '#667eea', color: 'white'}}>✏️ Editor</button>
                        <button onClick={() => abrirHistorico(sol)} style={{marginLeft:8}}>Ver histórico</button>
                        <button onClick={() => abrirDetalhes(sol)} style={{marginLeft:8}}>Ver detalhes</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button className="link-btn" onClick={() => { setToken(null); setUsuario(null); setTela('login'); }}>Sair</button>
            {mensagem && <div className="mensagem-erro">{mensagem}</div>}
          </div>
        )}
        {tela === 'logado' && usuario?.is_master === 1 && (
          <div className="painel-master">
            <h2>Painel do Programador Master</h2>
            <button onClick={verificarAlertas} style={{backgroundColor: '#ff6b35', marginBottom: '10px'}}>
              🔔 Verificar Alertas de Prazo
            </button>
            <button onClick={() => { setMostrarGerenciarUsuarios(!mostrarGerenciarUsuarios); carregarUsuarios(); carregarSecretarias(); }} style={{backgroundColor: '#4caf50', marginBottom: '10px', marginLeft: '10px'}}>
              👥 Gerenciar Usuários
            </button>
            <button onClick={() => setMostrarListaDemandas(!mostrarListaDemandas)} style={{backgroundColor: '#2196f3', marginBottom: '10px', marginLeft: '10px'}}>
              📋 Lista de Demandas
            </button>
            
            {/* Área de Cadastro de Responsáveis */}
            <div style={{marginBottom: '24px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                <h3 style={{margin: 0, color: '#003366'}}>👥 Cadastro de Responsáveis</h3>
                <button 
                  onClick={() => {
                    setMostrarFormCadastro(!mostrarFormCadastro);
                    if (!mostrarFormCadastro) {
                      carregarSecretarias();
                    }
                  }}
                  style={{
                    backgroundColor: mostrarFormCadastro ? '#dc3545' : '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  {mostrarFormCadastro ? '❌ Fechar' : '➕ Novo Responsável'}
                </button>
              </div>
              
              {mostrarFormCadastro && (
                <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ced4da'}}>
                  <form onSubmit={handleCadastroResp}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                      <div>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057'}}>
                          CPF (somente números)
                        </label>
                        <input
                          type="text"
                          placeholder="00000000000"
                          value={novoResp.cpf}
                          onChange={e => setNovoResp({ ...novoResp, cpf: e.target.value.replace(/\D/g, '') })}
                          maxLength={11}
                          required
                          style={{width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px'}}
                        />
                      </div>
                      
                      <div>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057'}}>
                          Telefone
                        </label>
                        <input
                          type="text"
                          placeholder="(00) 00000-0000"
                          value={novoResp.telefone}
                          onChange={e => setNovoResp({ ...novoResp, telefone: e.target.value })}
                          required
                          style={{width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px'}}
                        />
                      </div>
                      
                      <div>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057'}}>
                          Email
                        </label>
                        <input
                          type="email"
                          placeholder="email@exemplo.com"
                          value={novoResp.email}
                          onChange={e => setNovoResp({ ...novoResp, email: e.target.value })}
                          required
                          style={{width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px'}}
                        />
                      </div>
                      
                      <div>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057'}}>
                          Secretaria
                        </label>
                        <select
                          value={novoResp.secretaria}
                          onChange={e => setNovoResp({ ...novoResp, secretaria: e.target.value })}
                          required
                          style={{width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px'}}
                        >
                          <option value="">Selecione a Secretaria</option>
                          {secretarias.map(sec => (
                            <option key={sec} value={sec}>{sec}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div style={{textAlign: 'center'}}>
                      <button 
                        type="submit" 
                        disabled={carregandoCadastro}
                        style={{
                          backgroundColor: carregandoCadastro ? '#6c757d' : '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '12px 30px',
                          borderRadius: '5px',
                          cursor: carregandoCadastro ? 'not-allowed' : 'pointer',
                          fontSize: '16px'
                        }}
                      >
                        {carregandoCadastro ? '⏳ Cadastrando...' : '✅ Cadastrar Responsável'}
                      </button>
                    </div>
                  </form>
                  
                  {msgCadastro && (
                    <div style={{
                      marginTop: '15px',
                      padding: '10px',
                      borderRadius: '5px',
                      backgroundColor: msgCadastro.includes('sucesso') ? '#d4edda' : '#f8d7da',
                      color: msgCadastro.includes('sucesso') ? '#155724' : '#721c24',
                      border: `1px solid ${msgCadastro.includes('sucesso') ? '#c3e6cb' : '#f5c6cb'}`
                    }}>
                      {msgCadastro}
                    </div>
                  )}
                </div>
              )}
              
              {/* Exibição das Credenciais após Cadastro */}
              {credenciaisCadastro && (
                <div style={{
                  marginTop: '20px',
                  backgroundColor: '#e7f3ff',
                  border: '2px solid #007bff',
                  borderRadius: '8px',
                  padding: '20px'
                }}>
                  <h4 style={{margin: '0 0 15px 0', color: '#0056b3', display: 'flex', alignItems: 'center'}}>
                    🔐 Credenciais de Acesso Geradas
                  </h4>
                  
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                    <div>
                      <strong>CPF:</strong> {credenciaisCadastro.cpf}
                    </div>
                    <div>
                      <strong>Email:</strong> {credenciaisCadastro.email}
                    </div>
                    <div>
                      <strong>Secretaria:</strong> {credenciaisCadastro.secretaria}
                    </div>
                    <div>
                      <strong>Senha:</strong> 
                      <span style={{
                        backgroundColor: '#fff3cd',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        fontFamily: 'monospace',
                        marginLeft: '5px'
                      }}>
                        {credenciaisCadastro.senha}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '5px', padding: '15px', marginBottom: '15px'}}>
                    <h5 style={{margin: '0 0 10px 0', color: '#856404'}}>📧 Email Enviado</h5>
                    <p style={{margin: 0, fontSize: '14px'}}>
                      As credenciais foram enviadas para <strong>{credenciaisCadastro.email}</strong>.
                      O responsável receberá um email com todas as informações de acesso.
                    </p>
                  </div>
                  
                  <div style={{textAlign: 'center'}}>
                    <button 
                      onClick={copiarCredenciais}
                      style={{
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginRight: '10px'
                      }}
                    >
                      📋 Copiar Credenciais
                    </button>
                    <button 
                      onClick={reenviarEmail}
                      style={{
                        backgroundColor: '#ff9800',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginRight: '10px'
                      }}
                    >
                      📬 Reenviar Email
                    </button>
                    <button 
                      onClick={() => setCredenciaisCadastro(null)}
                      style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      ✖️ Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>
            <h3 style={{marginTop:32}}>Solicitações de Todas as Secretarias</h3>
            {carregandoTodas ? (
              <p>Carregando solicitações...</p>
            ) : (
              Object.keys(todasSolicitacoes).length === 0 ? (
                <p>Nenhuma solicitação encontrada.</p>
              ) : (
                Object.entries(todasSolicitacoes).map(([secretaria, lista]) => (
                  <div key={secretaria} style={{marginBottom: 32}}>
                    <h4 style={{color:'#003366', marginBottom:8}}>{secretaria}</h4>
                    <div style={{display:'flex', gap:8, marginBottom:8}}>
                      <button onClick={() => exportarTabela(lista, secretaria, 'pdf')}>Exportar PDF</button>
                      <button onClick={() => exportarTabela(lista, secretaria, 'excel')}>Exportar Excel</button>
                      <button onClick={() => exportarTabela(lista, secretaria, 'csv')}>Exportar CSV</button>
                      <button onClick={() => exportarTabela(lista, secretaria, 'html')}>Exportar HTML</button>
                    </div>
                    <table className="tabela-solicitacoes">
                      <thead>
                        <tr>
                          <th>Protocolo</th>
                          <th>Pergunta</th>
                          <th>Status</th>
                          <th>Resposta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lista.map(sol => (
                          <tr key={sol.id}>
                            <td>{sol.protocolo}</td>
                            <td>{sol.pergunta}</td>
                            <td>{sol.status}</td>
                            <td>{sol.resposta || '-'}</td>
                            <td>
                              <button onClick={() => verSolicitacao(sol)} style={{marginRight: '5px'}}>
                                Ver
                              </button>
                              <button onClick={() => redefinirAlertas(sol.id)} style={{backgroundColor: '#ff6b35'}}>
                                🔄 Redefinir Alertas
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              )
            )}
            <div className="relatorio-filtro">
              <h3>Gerar Relatório de Atendimentos</h3>
              <div style={{display:'flex', gap:12, flexWrap:'wrap', alignItems:'center', justifyContent:'center'}}>
                <label>Início: <input type="date" value={relPeriodo.inicio} onChange={e => setRelPeriodo({...relPeriodo, inicio: e.target.value})} /></label>
                <label>Fim: <input type="date" value={relPeriodo.fim} onChange={e => setRelPeriodo({...relPeriodo, fim: e.target.value})} /></label>
                <label>Secretarias:
                  <select multiple value={relSecretarias} onChange={e => setRelSecretarias(Array.from(e.target.selectedOptions, o => o.value))} style={{minWidth:120, minHeight:40}}>
                    {relSecretariasDisponiveis.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                  </select>
                </label>
                <button onClick={filtrarRelatorio} type="button">Filtrar</button>
              </div>
              {relFiltrado.length > 0 && (
                <div style={{marginTop:16}}>
                  <button onClick={() => exportarRelatorio('pdf')}>Exportar PDF</button>
                  <button onClick={() => exportarRelatorio('excel')}>Exportar Excel</button>
                  <button onClick={() => exportarRelatorio('csv')}>Exportar CSV</button>
                  <button onClick={() => exportarRelatorio('html')}>Exportar HTML</button>
                </div>
              )}
              {relCarregando && <p>Carregando...</p>}
              {relFiltrado.length > 0 && (
                <table className="tabela-solicitacoes" style={{marginTop:16}}>
                  <thead>
                    <tr>
                      <th>Secretaria</th>
                      <th>Protocolo</th>
                      <th>Pergunta</th>
                      <th>Status</th>
                      <th>Resposta</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relFiltrado.map((sol, i) => (
                      <tr key={i}>
                        <td>{sol.secretaria}</td>
                        <td>{sol.protocolo}</td>
                        <td>{sol.pergunta}</td>
                        <td>{sol.status}</td>
                        <td>{sol.resposta || '-'}</td>
                        <td>{sol.data || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {relFiltrado.length > 0 && (
              <div style={{marginTop:24, marginBottom:24}}>
                <h4>Estatísticas do Relatório</h4>
                <div style={{maxWidth:600, margin:'0 auto'}}>
                  <Bar data={chartData} options={{responsive:true, plugins:{legend:{position:'top'},title:{display:true,text:'Atendimentos por Secretaria'}}}} />
                </div>
                <div style={{maxWidth:300, margin:'24px auto'}}>
                  <Pie data={pieData} options={{responsive:true, plugins:{legend:{position:'bottom'},title:{display:true,text:'Proporção Geral'}}}} />
                </div>
                <div style={{marginTop:16}}>
                  {Object.keys(estatisticas).map(sec => (
                    estatisticas[sec].pendentes > 0 && (
                      <div key={sec} style={{color:'#b30000', marginBottom:8}}>
                        <b>{sec}:</b> {estatisticas[sec].pendentes} pendente(s). {sugestaoSolucao(sec)}
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
            <h3>Solicitações Encaminhadas ao Ouvidor Geral</h3>
            <table className="solicitacoes-table">
              <thead>
                <tr>
                  <th>Protocolo</th>
                  <th>Secretaria</th>
                  <th>Status</th>
                  <th>Motivo</th>
                  <th>Pergunta</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {solicitacoesEncaminhadas.map(sol => (
                  <tr key={sol.id}>
                    <td>{sol.protocolo}</td>
                    <td>{sol.secretaria}</td>
                    <td>{sol.status}</td>
                    <td>{sol.motivo_encaminhamento || '-'}</td>
                    <td>{sol.pergunta}</td>
                    <td>
                      <button onClick={() => {
                        setSolicitacaoResolucao(sol);
                        setMostrarModalResolucaoOuvidor(true);
                      }}>
                        Resolver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Interface de Gerenciamento de Usuários */}
        {tela === 'logado' && usuario?.is_master === 1 && mostrarGerenciarUsuarios && (
          <div className="gerenciar-usuarios" style={{marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px'}}>
            <h3>👥 Gerenciamento de Usuários</h3>
            
            {/* Formulário de Cadastro/Edição */}
            <form onSubmit={salvarUsuario} style={{marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px'}}>
              <h4>{usuarioEditando ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}</h4>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <input
                  type="text"
                  placeholder="CPF (somente números)"
                  value={novoUsuario.cpf}
                  onChange={e => setNovoUsuario({...novoUsuario, cpf: e.target.value.replace(/\D/g, '')})}
                  maxLength={11}
                  required
                />
                <input
                  type="text"
                  placeholder="Telefone"
                  value={novoUsuario.telefone}
                  onChange={e => setNovoUsuario({...novoUsuario, telefone: e.target.value})}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={novoUsuario.email}
                  onChange={e => setNovoUsuario({...novoUsuario, email: e.target.value})}
                  required
                />
                <select
                  value={novoUsuario.secretaria}
                  onChange={e => setNovoUsuario({...novoUsuario, secretaria: e.target.value})}
                  required
                >
                  <option value="">Selecione a Secretaria</option>
                  {secretarias.map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
                <label style={{gridColumn: '1 / -1'}}>
                  <input
                    type="checkbox"
                    checked={novoUsuario.is_master}
                    onChange={e => setNovoUsuario({...novoUsuario, is_master: e.target.checked})}
                  />
                  Usuário Master (Acesso total ao sistema)
                </label>
              </div>
              <div style={{marginTop: '10px'}}>
                <button type="submit" style={{backgroundColor: '#4caf50', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', marginRight: '10px'}}>
                  {usuarioEditando ? 'Atualizar' : 'Cadastrar'}
                </button>
                {usuarioEditando && (
                  <button type="button" onClick={() => { setUsuarioEditando(null); setNovoUsuario({ cpf: '', telefone: '', email: '', secretaria: '', is_master: false }); }} style={{backgroundColor: '#ff9800', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px'}}>
                    Cancelar Edição
                  </button>
                )}
              </div>
            </form>

            {/* Lista de Usuários */}
            <div>
              <h4>Usuários Cadastrados</h4>
              <table className="tabela-solicitacoes" style={{width: '100%'}}>
                <thead>
                  <tr>
                    <th>CPF</th>
                    <th>Nome/Email</th>
                    <th>Telefone</th>
                    <th>Secretaria</th>
                    <th>Tipo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(user => (
                    <tr key={user.id}>
                      <td>{user.cpf}</td>
                      <td>{user.email}</td>
                      <td>{user.telefone}</td>
                      <td>{user.secretaria}</td>
                      <td>
                        <span style={{color: user.is_master ? '#ff6b35' : '#4caf50', fontWeight: 'bold'}}>
                          {user.is_master ? 'Master' : 'Responsável'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => editarUsuario(user)} style={{backgroundColor: '#2196f3', color: 'white', padding: '4px 8px', border: 'none', borderRadius: '4px', marginRight: '5px', fontSize: '12px'}}>
                          Editar
                        </button>
                        <button onClick={() => redefinirSenha(user.id)} style={{backgroundColor: '#ff9800', color: 'white', padding: '4px 8px', border: 'none', borderRadius: '4px', marginRight: '5px', fontSize: '12px'}}>
                          Redefinir Senha
                        </button>
                        <button onClick={() => excluirUsuario(user.id)} style={{backgroundColor: '#f44336', color: 'white', padding: '4px 8px', border: 'none', borderRadius: '4px', fontSize: '12px'}}>
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tela === 'responder' && solSelecionada && (
          <form className="login-form" onSubmit={handleResponder}>
            <h2>Responder Solicitação</h2>
            <div><b>Protocolo:</b> {solSelecionada.protocolo}</div>
            <div><b>Pergunta:</b> {solSelecionada.pergunta}</div>
            <textarea
              placeholder="Digite sua resposta aqui..."
              value={resposta}
              onChange={e => setResposta(e.target.value)}
              rows={5}
              required
              style={{ resize: 'vertical', marginTop: 12 }}
            />
            <button type="submit">Enviar Resposta</button>
            <button type="button" className="link-btn" onClick={() => { setTela('logado'); setSolSelecionada(null); setResposta(''); }}>Cancelar</button>
            {mensagem && <div className="mensagem-erro">{mensagem}</div>}
          </form>
        )}
      </main>
      {historicoAberto && (
        <div className="modal-historico" onClick={() => setHistoricoAberto(false)}>
          <div className="modal-historico-content" onClick={e => e.stopPropagation()}>
            <h3>Histórico de Status - Protocolo {historicoProtocolo}</h3>
            {historicoCarregando ? <p>Carregando...</p> : (
              historicoSolicitacao.length === 0 ? <p>Nenhum histórico encontrado.</p> : (
                <table className="tabela-solicitacoes">
                  <thead>
                    <tr>
                      <th>Data/Hora</th>
                      <th>Status</th>
                      <th>Responsável (CPF)</th>
                      <th>Email</th>
                      <th>Anexo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicoSolicitacao.map((h, i) => (
                      <tr key={i}>
                        <td>{new Date(h.data).toLocaleString('pt-BR')}</td>
                        <td>{h.status}</td>
                        <td>{h.cpf || '-'}</td>
                        <td>{h.email || '-'}</td>
                        <td>
                          {h.anexo ? (
                            h.anexo.match(/\.(jpg|jpeg|png)$/i) ? (
                              <img src={h.anexo} alt="anexo" style={{maxWidth:60, maxHeight:60, borderRadius:6}} />
                            ) : h.anexo.match(/\.pdf$/i) ? (
                              <iframe src={h.anexo} title="PDF" style={{width:60, height:60, border:'none'}} />
                            ) : (
                              <a href={h.anexo} target="_blank" rel="noopener noreferrer">Baixar</a>
                            )
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
            <button onClick={() => setHistoricoAberto(false)} style={{marginTop:16}}>Fechar</button>
          </div>
        </div>
      )}
      {detalhesAberto && (
        <div className="modal-historico" onClick={() => setDetalhesAberto(false)}>
          <div className="modal-historico-content" onClick={e => e.stopPropagation()}>
            <h3>Detalhes da Solicitação</h3>
            {detalhesCarregando ? <p>Carregando...</p> : detalhesSolicitacao ? (
              <>
                <div style={{textAlign:'left', marginBottom:16}}>
                  <b>Protocolo:</b> {detalhesSolicitacao.protocolo}<br/>
                  <b>Solicitante:</b> {detalhesSolicitacao.nome || '-'}<br/>
                  <b>Email:</b> {detalhesSolicitacao.email || '-'}<br/>
                  <b>Telefone:</b> {detalhesSolicitacao.telefone || '-'}<br/>
                  <b>Status:</b> {detalhesSolicitacao.status}<br/>
                  <b>Prazo de Resposta:</b> {new Date(detalhesSolicitacao.prazo_resposta).toLocaleDateString('pt-BR')}<br/>
                  <b>Status do Prazo:</b> <span style={{color: getPrazoColor(detalhesSolicitacao.status_prazo), fontWeight: 'bold'}}>
                    {getPrazoText(detalhesSolicitacao.status_prazo, detalhesSolicitacao.dias_restantes)}
                  </span><br/>
                  <b>Pergunta:</b> {detalhesSolicitacao.pergunta || '-'}<br/>
                  <b>Descrição:</b> {detalhesSolicitacao.descricao || '-'}<br/>
                </div>
                <h4>Histórico, Mensagens e Comentários</h4>
                <table className="tabela-solicitacoes">
                  <thead>
                    <tr>
                      <th>Data/Hora</th>
                      <th>Status</th>
                      <th>Responsável (CPF)</th>
                      <th>Email</th>
                      <th>Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalhesHistorico.map((h, i) => (
                      <tr key={i}>
                        <td>{new Date(h.data).toLocaleString('pt-BR')}</td>
                        <td>{h.status}</td>
                        <td>{h.cpf || '-'}</td>
                        <td>{h.email || '-'}</td>
                        <td>{h.descricao || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <form className="login-form" onSubmit={responderDetalhes} style={{marginTop:16}}>
                  <textarea
                    placeholder="Responder à solicitação..."
                    value={respostaDetalhe}
                    onChange={e => setRespostaDetalhe(e.target.value)}
                    rows={4}
                    required
                  />
                  <button type="submit">Enviar Resposta</button>
                </form>
                <form className="login-form" onSubmit={comentarDetalhes} style={{marginTop:16}}>
                  <textarea
                    placeholder="Adicionar comentário (visível para todos da secretaria)"
                    value={comentarioDetalhe}
                    onChange={e => setComentarioDetalhe(e.target.value)}
                    rows={3}
                    required
                  />
                  <input type="file" onChange={handleAnexoChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx" />
                  <button type="submit">Adicionar Comentário</button>
                </form>
              </>
            ) : <p>Erro ao carregar detalhes.</p>}
            <button onClick={() => setDetalhesAberto(false)} style={{marginTop:16}}>Fechar</button>
          </div>
        </div>
      )}
      {/* Modal de Encaminhamento */}
      {mostrarModalEncaminhamento && (
        <div className="modal">
          <div className="modal-content">
            <h3>Encaminhar ao Ouvidor Geral</h3>
            <p><strong>Protocolo:</strong> {solicitacaoEncaminhamento?.protocolo}</p>
            <p><strong>Secretaria:</strong> {solicitacaoEncaminhamento?.secretaria}</p>
            <p><strong>Pergunta:</strong> {solicitacaoEncaminhamento?.pergunta}</p>
            <label>
              Motivo do Encaminhamento:
              <textarea
                value={motivoEncaminhamento}
                onChange={(e) => setMotivoEncaminhamento(e.target.value)}
                placeholder="Descreva o motivo do encaminhamento (alta complexidade, impossibilidade de resolução, etc.)"
                rows={4}
                style={{width: '100%', marginTop: '5px'}}
              />
            </label>
            <div style={{marginTop: '15px'}}>
              <button onClick={() => executarEncaminhamento(solicitacaoEncaminhamento.id, true, motivoEncaminhamento)}>
                Confirmar Encaminhamento
              </button>
              <button onClick={() => setMostrarModalEncaminhamento(false)} style={{backgroundColor: '#666'}}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resolução pelo Ouvidor */}
      {mostrarModalResolucaoOuvidor && (
        <div className="modal">
          <div className="modal-content">
            <h3>Resolver Solicitação Encaminhada</h3>
            <p><strong>Protocolo:</strong> {solicitacaoResolucao?.protocolo}</p>
            <p><strong>Secretaria:</strong> {solicitacaoResolucao?.secretaria}</p>
            <p><strong>Pergunta:</strong> {solicitacaoResolucao?.pergunta}</p>
            <p><strong>Motivo do Encaminhamento:</strong> {solicitacaoResolucao?.motivo_encaminhamento}</p>
            <label>
              Resposta do Ouvidor Geral:
              <textarea
                value={respostaOuvidor}
                onChange={(e) => setRespostaOuvidor(e.target.value)}
                placeholder="Digite a resposta oficial do ouvidor geral"
                rows={6}
                style={{width: '100%', marginTop: '5px'}}
              />
            </label>
            <label>
              Status Final:
              <select value={statusFinal} onChange={(e) => setStatusFinal(e.target.value)} style={{marginLeft: '10px'}}>
                <option value="Finalizado">Finalizado</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Em aberto">Em aberto</option>
              </select>
            </label>
            <div style={{marginTop: '15px'}}>
              <button onClick={resolverEncaminhamento}>
                Confirmar Resolução
              </button>
              <button onClick={() => setMostrarModalResolucaoOuvidor(false)} style={{backgroundColor: '#666'}}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Demandas */}
      {mostrarListaDemandas && (
        <ListaDemandas />
      )}

      {/* Editor de Respostas */}
      {mostrarEditorResposta && demandaEditorResposta && (
        <EditorResposta
          demandaId={demandaEditorResposta.id}
          onClose={fecharEditorResposta}
          onRespostaEnviada={handleRespostaEnviada}
        />
      )}

      {/* EstatisticasDemandas removido */}
    </div>
  );
}

export default App;
