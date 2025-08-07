# Detalhes da Demanda - Histórico Completo

## Visão Geral

A funcionalidade de **Detalhes da Demanda** fornece uma visão completa e detalhada de cada demanda, incluindo o histórico completo de todas as interações entre o usuário e o chatbot, permitindo um acompanhamento completo do atendimento.

## Funcionalidades Principais

### 📋 Informações Completas da Demanda
- **Protocolo**: Identificação única da demanda
- **Secretaria**: Setor responsável
- **Categoria**: Tipo de serviço/demanda
- **Status**: Estado atual (pendente, em andamento, respondida, resolvida, arquivada)
- **Prioridade**: Nível de urgência (baixa, normal, alta, urgente)
- **Usuário**: Informações do solicitante (anonimizado)
- **Datas**: Criação e última atualização
- **Responsável**: Funcionário responsável pelo atendimento
- **Resumo**: Descrição resumida da demanda
- **Descrição Completa**: Detalhes adicionais (quando disponível)

### 💬 Histórico de Interações (Transcript)
- **Conversa Completa**: Todas as mensagens trocadas
- **Cronologia**: Ordem temporal das interações
- **Identificação**: Usuário vs. Atendente/Bot
- **Timestamps**: Data e hora de cada interação
- **Responsável**: Quem enviou cada mensagem
- **Mídia**: Anexos e arquivos compartilhados

### 📤 Exportação de Transcript
- **Formato TXT**: Transcript em texto simples
- **Formato JSON**: Dados estruturados
- **Download Automático**: Arquivo salvo localmente
- **Cabeçalho Informativo**: Dados da demanda no início

### ➕ Adição de Interações
- **Nova Interação**: Adicionar comentário ou resposta
- **Origem Atendente**: Registro de interação do funcionário
- **Timestamp Automático**: Data/hora registrada automaticamente
- **Histórico Atualizado**: Lista atualizada em tempo real

## Como Usar

### 1. Acessar Detalhes da Demanda
1. Na lista de demandas, clique no botão **"👁️"** na coluna de ações
2. O modal de detalhes será aberto com todas as informações

### 2. Visualizar Histórico de Interações
1. Role para baixo até a seção "Histórico de Interações"
2. As interações são exibidas em ordem cronológica
3. Cada interação mostra:
   - **Origem**: 👤 Usuário ou 🤖 Atendente
   - **Timestamp**: Data e hora
   - **Responsável**: Quem enviou (quando aplicável)
   - **Mensagem**: Conteúdo da interação
   - **Mídia**: Tipo de arquivo (quando aplicável)

### 3. Adicionar Nova Interação
1. Clique no botão **"➕ Adicionar Interação"**
2. Digite sua mensagem no campo de texto
3. Clique em **"Adicionar"** para salvar
4. A nova interação aparecerá no histórico

### 4. Exportar Transcript
1. No cabeçalho, clique em **"📄 Exportar TXT"** ou **"📊 Exportar JSON"**
2. O arquivo será baixado automaticamente
3. O nome do arquivo inclui o protocolo da demanda

## Estrutura do Banco de Dados

### Tabela `historico_interacoes`
```sql
CREATE TABLE historico_interacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  demanda_id INTEGER,
  protocolo TEXT,
  usuario_id TEXT,
  mensagem TEXT,
  origem TEXT,
  timestamp TEXT,
  tipo_midia TEXT,
  caminho_arquivo TEXT,
  FOREIGN KEY (demanda_id) REFERENCES demandas(id)
);
```

## Endpoints da API

### GET `/api/demandas/:id/detalhes-completos`
Obtém detalhes completos da demanda com histórico

**Resposta:**
```json
{
  "demanda": {
    "id": 1,
    "protocolo": "2024-001",
    "secretaria": "Secretaria de Infraestrutura",
    "categoria": "Iluminação Pública",
    "status": "pendente",
    "prioridade": "alta",
    "usuario_anonimizado": "Usuário 001",
    "data_criacao": "2024-01-15T10:30:00.000Z",
    "data_atualizacao": "2024-01-15T10:35:00.000Z",
    "resumo_mensagem": "Poste de luz quebrado",
    "descricao_completa": "Detalhes adicionais...",
    "responsavel": "João Silva",
    "responsavel_email": "joao@prefeitura.gov.br"
  },
  "historico": {
    "total_interacoes": 4,
    "interacoes": [
      {
        "id": 1,
        "mensagem": "Olá! Preciso de ajuda...",
        "origem": "usuário",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "tipo_midia": null,
        "caminho_arquivo": null,
        "responsavel": "Sistema"
      }
    ]
  }
}
```

### POST `/api/demandas/:id/interacao`
Adiciona uma nova interação ao histórico

**Body:**
```json
{
  "mensagem": "Nova mensagem do atendente",
  "origem": "atendente",
  "tipo_midia": "imagem",
  "caminho_arquivo": "/anexos/foto.jpg"
}
```

### GET `/api/demandas/:id/transcript`
Exporta o histórico em formato de transcript

**Parâmetros:**
- `formato`: "txt" ou "json"

## Exemplo de Transcript

### Formato TXT
```
TRANSCRIPT - PROTOCOLO 2024-001
Secretaria: Secretaria de Infraestrutura e Segurança Pública
Categoria: Iluminação Pública
Usuário: Usuário 001
Data de Criação: 15/01/2024 10:30:00
Total de Interações: 4

==================================================

[15/01/2024 10:30:00] USUÁRIO: Olá! Preciso de ajuda com um poste de luz quebrado na Rua das Flores.

[15/01/2024 10:31:00] ATENDENTE: Olá! Vou ajudá-lo com essa questão. Qual é o número da casa ou ponto de referência?

[15/01/2024 10:32:00] USUÁRIO: É próximo ao número 123, em frente à padaria.

[15/01/2024 10:33:00] ATENDENTE: Entendi! Vou encaminhar sua solicitação para a Secretaria de Infraestrutura. Seu protocolo é 2024-001.
```

### Formato JSON
```json
{
  "demanda": {
    "protocolo": "2024-001",
    "secretaria": "Secretaria de Infraestrutura e Segurança Pública",
    "categoria": "Iluminação Pública",
    "usuario": "Usuário 001",
    "data_criacao": "2024-01-15T10:30:00.000Z"
  },
  "interacoes": [
    {
      "mensagem": "Olá! Preciso de ajuda com um poste de luz quebrado na Rua das Flores.",
      "origem": "usuário",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "tipo_midia": null,
      "responsavel": "Sistema"
    }
  ]
}
```

## Dados de Exemplo

O sistema inclui dados de exemplo com histórico completo:

### Protocolo 2024-001 - Iluminação Pública
- **4 interações** simulando conversa sobre poste quebrado
- **Usuário** e **Bot** interagindo
- **Encaminhamento** para secretaria

### Protocolo 2024-002 - Atendimento Médico
- **5 interações** incluindo resposta de atendente
- **Consulta urgente** com cardiologista
- **Agendamento** de consulta

### Protocolo 2024-003 - Matrícula Escolar
- **5 interações** com orientações completas
- **Processo de matrícula** explicado
- **Documentos necessários** listados

## Benefícios

### Para o Atendente
- ✅ **Visão Completa**: Histórico completo da conversa
- ✅ **Contexto**: Entendimento total da situação
- ✅ **Continuidade**: Pode continuar o atendimento de onde parou
- ✅ **Documentação**: Registro completo para auditoria

### Para o Usuário
- ✅ **Transparência**: Pode ver todo o histórico
- ✅ **Continuidade**: Não precisa repetir informações
- ✅ **Rastreabilidade**: Sabe exatamente o que foi dito

### Para a Gestão
- ✅ **Auditoria**: Histórico completo para análise
- ✅ **Qualidade**: Avaliação do atendimento
- ✅ **Treinamento**: Base para melhorias
- ✅ **Compliance**: Documentação para requisitos legais

## Responsividade

A interface é totalmente responsiva:
- ✅ **Desktop**: Layout completo com todas as informações
- ✅ **Tablet**: Layout adaptado mantendo funcionalidade
- ✅ **Mobile**: Layout compacto otimizado para toque

## Segurança

- ✅ **Autenticação**: Acesso restrito a usuários logados
- ✅ **Autorização**: Controle baseado em perfil
- ✅ **Validação**: Dados validados antes de salvar
- ✅ **Log**: Todas as ações registradas

## Próximas Melhorias

- [ ] **Busca no Histórico**: Pesquisar por palavras-chave
- [ ] **Filtros**: Filtrar por tipo de interação
- [ ] **Marcação**: Marcar interações importantes
- [ ] **Compartilhamento**: Compartilhar transcript por email
- [ ] **Análise**: Métricas de tempo de resposta
- [ ] **Notificações**: Alertas para novas interações
- [ ] **Templates**: Respostas pré-definidas
- [ ] **Integração**: Sincronização com WhatsApp

## Suporte

Para dúvidas ou problemas com a funcionalidade de detalhes da demanda, entre em contato com a equipe de desenvolvimento. 