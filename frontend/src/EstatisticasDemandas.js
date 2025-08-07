import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

function EstatisticasDemandas() {
  const [porCategoria, setPorCategoria] = useState([]);
  const [tempoMedio, setTempoMedio] = useState(null);
  const [demandas, setDemandas] = useState([]);
  const [filtros, setFiltros] = useState({
    status: '',
    prioridade: '',
    categoria: '',
    dataInicial: '',
    dataFinal: ''
  });

  useEffect(() => {
    fetch('/api/demandas/por-categoria')
      .then(res => res.json())
      .then(setPorCategoria);

    fetch('/api/demandas/tempo-medio-resposta')
      .then(res => res.json())
      .then(data => setTempoMedio(data.tempo_medio));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(filtros);
    fetch('/api/demandas?' + params.toString())
      .then(res => res.json())
      .then(setDemandas);
  }, [filtros]);

  const pieData = {
    labels: porCategoria.map(c => c.categoria),
    datasets: [{
      data: porCategoria.map(c => c.total),
      backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF']
    }]
  };

  return (
    <div>
      <h2>Estatísticas das Demandas</h2>
      <div style={{ width: 400, margin: 'auto' }}>
        <Pie data={pieData} />
      </div>
      <p><b>Tempo médio de resposta:</b> {tempoMedio ? `${tempoMedio.toFixed(2)} dias` : 'Carregando...'}</p>

      <h3>Filtros rápidos</h3>
      <form style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select value={filtros.status} onChange={e => setFiltros(f => ({ ...f, status: e.target.value }))}>
          <option value="">Status</option>
          <option value="pendente">Pendente</option>
          <option value="andamento">Em andamento</option>
          <option value="resolvida">Resolvida</option>
        </select>
        <select value={filtros.prioridade} onChange={e => setFiltros(f => ({ ...f, prioridade: e.target.value }))}>
          <option value="">Prioridade</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>
        <select value={filtros.categoria} onChange={e => setFiltros(f => ({ ...f, categoria: e.target.value }))}>
          <option value="">Categoria</option>
          <option value="reclamação">Reclamação</option>
          <option value="denuncia">Denúncia</option>
          <option value="sugestão">Sugestão</option>
          <option value="elogio">Elogio</option>
        </select>
        <input type="date" value={filtros.dataInicial} onChange={e => setFiltros(f => ({ ...f, dataInicial: e.target.value }))} />
        <input type="date" value={filtros.dataFinal} onChange={e => setFiltros(f => ({ ...f, dataFinal: e.target.value }))} />
      </form>

      <h3>Demandas filtradas</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Prioridade</th>
            <th>Categoria</th>
            <th>Data Criação</th>
            <th>Data Resposta</th>
          </tr>
        </thead>
        <tbody>
          {demandas.map(d => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.status}</td>
              <td>{d.prioridade}</td>
              <td>{d.categoria}</td>
              <td>{d.data_criacao}</td>
              <td>{d.data_resposta || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EstatisticasDemandas; 