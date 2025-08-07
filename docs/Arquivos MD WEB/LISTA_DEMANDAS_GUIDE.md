# Lista de Demandas das Secretarias

## Visão Geral

A funcionalidade de **Lista de Demandas das Secretarias** foi implementada para fornecer uma visão completa e organizada de todas as demandas municipais, permitindo gerenciamento eficiente e ações rápidas.

## Funcionalidades Principais

### 📊 Tabela de Demandas
- **ID/Protocolo**: Identificação única da demanda
- **Data/Hora**: Data e hora de criação da demanda
- **Usuário**: Informações do usuário (anonimizado ou identificado)
- **Categoria**: Tipo de serviço/demanda
- **Status**: Estado atual da demanda (pendente, em andamento, respondida, resolvida, arquivada)
- **Prioridade**: Nível de urgência (baixa, normal, alta, urgente)
- **Resumo da Mensagem**: Descrição resumida da demanda

### 🔍 Filtros Avançados
- **Secretaria**: Filtrar por secretaria específica
- **Status**: Filtrar por status da demanda
- **Prioridade**: Filtrar por nível de prioridade
- **Categoria**: Filtrar por tipo de serviço
- **Período**: Filtrar por data de criação (início e fim)

### 📈 Ordenação
- Ordenação por qualquer coluna (clique no cabeçalho)
- Ordem crescente/decrescente
- Campos ordenáveis:
  - ID/Protocolo
  - Data/Hora
  - Usuário
  - Categoria
  - Status
  - Prioridade

### ⚡ Ações Rápidas
- **📝 Responder**: Adicionar resposta à demanda
- **📁 Arquivar**: Arquivar demanda com motivo
- **🔄 Reclassificar**: Alterar categoria, prioridade ou secretaria

## Como Usar

### 1. Acessar a Lista de Demandas
1. Faça login no sistema como usuário master
2. Clique no botão **"📋 Lista de Demandas"** no painel principal
3. A lista será carregada automaticamente

### 2. Aplicar Filtros
1. Use os filtros na parte superior da tela
2. Selecione as opções desejadas
3. Os resultados serão atualizados automaticamente

### 3. Ordenar Dados
1. Clique no cabeçalho da coluna desejada
2. Clique novamente para alternar entre ordem crescente/decrescente
3. A seta (↑/↓) indica a direção da ordenação

### 4. Executar Ações Rápidas
1. Localize a demanda desejada na tabela
2. Clique no botão de ação correspondente:
   - **📝** para responder
   - **📁** para arquivar
   - **🔄** para reclassificar
3. Preencha as informações solicitadas no modal
4. Clique em "Confirmar" para executar a ação

### 5. Navegar pelas Páginas
- Use os botões "Anterior" e "Próxima" para navegar
- Informações de paginação são exibidas no centro

## Estrutura do Banco de Dados

### Tabela `demandas`
```sql
CREATE TABLE demandas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  protocolo TEXT UNIQUE,
  secretaria TEXT,
  categoria TEXT,
  status TEXT DEFAULT 'pendente',
  prioridade TEXT DEFAULT 'normal',
  usuario_id TEXT,
  usuario_anonimizado TEXT,
  data_criacao TEXT,
  data_atualizacao TEXT,
  resumo_mensagem TEXT,
  descricao_completa TEXT,
  responsavel_id INTEGER,
  prazo_resposta TEXT,
  FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
);
```

## Endpoints da API

### GET `/api/demandas/lista`
Lista todas as demandas com filtros e paginação

**Parâmetros:**
- `secretaria`: Filtrar por secretaria
- `status`: Filtrar por status
- `prioridade`: Filtrar por prioridade
- `categoria`: Filtrar por categoria
- `dataInicial`: Data inicial do período
- `dataFinal`: Data final do período
- `ordenarPor`: Campo para ordenação
- `ordem`: ASC ou DESC
- `pagina`: Número da página
- `limite`: Itens por página

### GET `/api/demandas/:id`
Obtém detalhes de uma demanda específica

### POST `/api/demandas/:id/responder`
Responde a uma demanda

**Body:**
```json
{
  "resposta": "Texto da resposta",
  "anexo": "caminho_do_anexo"
}
```

### POST `/api/demandas/:id/arquivar`
Arquiva uma demanda

**Body:**
```json
{
  "motivo": "Motivo do arquivamento"
}
```

### POST `/api/demandas/:id/reclassificar`
Reclassifica uma demanda

**Body:**
```json
{
  "novaCategoria": "Nova categoria",
  "novaPrioridade": "Nova prioridade",
  "novaSecretaria": "Nova secretaria",
  "motivo": "Motivo da reclassificação"
}
```

### GET `/api/demandas/filtros`
Obtém opções de filtro disponíveis

### POST `/api/demandas/popular-exemplo`
Popula a tabela com dados de exemplo (apenas master)

## Dados de Exemplo

O sistema inclui dados de exemplo para demonstração:

1. **Protocolo 2024-001**: Poste de luz quebrado (Infraestrutura)
2. **Protocolo 2024-002**: Consulta médica urgente (Saúde)
3. **Protocolo 2024-003**: Dúvida sobre matrícula (Educação)
4. **Protocolo 2024-004**: Atualização Bolsa Família (Assistência Social)
5. **Protocolo 2024-005**: Consulta IPTU (Finanças)

## Responsividade

A interface é totalmente responsiva e funciona em:
- ✅ Desktop (tela completa)
- ✅ Tablet (layout adaptado)
- ✅ Mobile (layout compacto)

## Segurança

- ✅ Autenticação obrigatória para todos os endpoints
- ✅ Controle de acesso baseado em perfil de usuário
- ✅ Validação de dados em todas as operações
- ✅ Log de todas as ações realizadas

## Próximas Melhorias

- [ ] Exportação de dados (PDF, Excel, CSV)
- [ ] Notificações em tempo real
- [ ] Dashboard com métricas
- [ ] Integração com WhatsApp para notificações
- [ ] Sistema de tags para categorização avançada
- [ ] Relatórios automáticos por email

## Suporte

Para dúvidas ou problemas com a funcionalidade, entre em contato com a equipe de desenvolvimento. 