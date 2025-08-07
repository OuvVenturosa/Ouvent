# Sincronização de Protocolos - Chatbot e Interface Web

## Visão Geral

O sistema agora possui **sincronização completa** entre o chatbot WhatsApp e a interface web, garantindo que todos os protocolos gerados no chatbot apareçam automaticamente na interface web e vice-versa.

## 🔄 Como Funciona a Sincronização

### 1. **Geração Centralizada de Protocolos**
- **API Única**: Todos os protocolos são gerados através da API centralizada
- **Verificação de Unicidade**: Sistema verifica se o protocolo já existe antes de gerar
- **Fallback**: Se a API não estiver disponível, usa geração local como backup

### 2. **Fluxo do Chatbot para Interface Web**
```
WhatsApp → Gera Protocolo → Salva no Banco → Interface Web
```

1. **Usuário inicia conversa** no WhatsApp
2. **Chatbot gera protocolo** via API centralizada
3. **Protocolo é salvo** no banco de dados
4. **Histórico de interações** é registrado
5. **Interface web** exibe automaticamente o novo protocolo

### 3. **Fluxo da Interface Web para Chatbot**
```
Interface Web → Atualiza Protocolo → Banco de Dados → Chatbot
```

1. **Atendente atualiza** protocolo na interface web
2. **Mudanças são salvas** no banco de dados
3. **Chatbot pode consultar** atualizações via API
4. **Sincronização bidirecional** completa

## 🛠️ Implementação Técnica

### Backend - API Centralizada

#### Endpoints de Protocolos
```javascript
// Gerar protocolo único
POST /api/protocolos/gerar
Response: { protocolo: "OUV011524/1234", timestamp: "..." }

// Verificar se protocolo existe
GET /api/protocolos/:protocolo/verificar
Response: { existe: true/false, protocolo: "..." }

// Buscar demanda por protocolo
GET /api/demandas/protocolo/:protocolo
Response: { dados completos da demanda }

// Salvar demanda do chatbot
POST /api/demandas/salvar-chatbot
Body: { protocolo, secretaria, categoria, ... }
```

#### Funções Centralizadas
```javascript
// Geração de protocolo único
async function generateUniqueProtocolNumber() {
  let protocolo;
  do {
    protocolo = generateProtocolNumber();
    const existe = await protocoloExiste(protocolo);
  } while (existe);
  return protocolo;
}

// Verificação de unicidade
function protocoloExiste(protocolo) {
  return db.get('SELECT id FROM demandas WHERE protocolo = ?', [protocolo]);
}
```

### Chatbot - Integração com API

#### Geração de Protocolo
```javascript
// Função modificada para usar API centralizada
async function generateProtocolNumber() {
  try {
    const response = await makeHttpRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/protocolos/gerar',
      method: 'POST'
    });
    return response.protocolo;
  } catch (error) {
    // Fallback para geração local
    return generateLocalProtocol();
  }
}
```

#### Salvamento de Demanda
```javascript
// Salvar demanda no banco quando protocolo é finalizado
async function salvarDemandaNoBanco(protocolo, atendimento) {
  const data = {
    protocolo: protocolo,
    secretaria: atendimento.secretaria,
    categoria: atendimento.servicoSelecionado,
    status: 'pendente',
    prioridade: 'normal',
    usuario_anonimizado: atendimento.nome,
    data_criacao: new Date().toISOString(),
    resumo_mensagem: atendimento.descricao,
    sender_id: atendimento.senderId
  };
  
  return await makeHttpRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/demandas/salvar-chatbot',
    method: 'POST'
  }, data);
}
```

### Interface Web - Busca e Filtros

#### Filtro por Protocolo
```javascript
// Campo de busca por protocolo
<input
  type="text"
  placeholder="Digite o protocolo..."
  value={filtros.protocolo}
  onChange={(e) => handleFiltroChange('protocolo', e.target.value)}
/>
```

#### Coluna de Protocolo na Tabela
```javascript
// Cabeçalho ordenável
<th onClick={() => handleOrdenacao('protocolo')}>
  Protocolo {ordenacao.campo === 'protocolo' && (ordenacao.ordem === 'ASC' ? '↑' : '↓')}
</th>

// Célula com protocolo
<td>{demanda.protocolo}</td>
```

## 📊 Estrutura do Banco de Dados

### Tabela `demandas`
```sql
CREATE TABLE demandas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  protocolo TEXT UNIQUE,           -- Protocolo único
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

### Tabela `historico_interacoes`
```sql
CREATE TABLE historico_interacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  demanda_id INTEGER,
  protocolo TEXT,                   -- Referência ao protocolo
  usuario_id TEXT,
  mensagem TEXT,
  origem TEXT,                      -- 'usuário', 'bot', 'atendente'
  timestamp TEXT,
  tipo_midia TEXT,
  caminho_arquivo TEXT,
  FOREIGN KEY (demanda_id) REFERENCES demandas(id)
);
```

## 🔍 Funcionalidades de Busca

### 1. **Busca por Protocolo na Interface Web**
- Campo de texto para digitar protocolo
- Busca em tempo real
- Filtro combinado com outros critérios

### 2. **Consulta de Protocolo no Chatbot**
- Comando: `CONSULTAR#PROTOCOLO`
- Resposta com detalhes completos
- Histórico de interações

### 3. **Verificação de Existência**
- API verifica se protocolo existe
- Evita duplicação
- Garante unicidade

## 📱 Integração WhatsApp

### Comandos Disponíveis
```
CONSULTAR#PROTOCOLO    - Consultar protocolo
RESP#PROTOCOLO#MSG     - Responder protocolo
STATUS#PROTOCOLO#NOVO  - Alterar status
ENC#PROTOCOLO#SETOR    - Encaminhar
```

### Notificações Automáticas
- **Nova demanda**: Secretaria recebe notificação
- **Atualização**: Todos os envolvidos são notificados
- **Resposta**: Usuário recebe resposta via WhatsApp

## 🔄 Sincronização em Tempo Real

### 1. **Chatbot → Interface Web**
- Protocolo gerado no WhatsApp
- Salvo automaticamente no banco
- Aparece imediatamente na interface

### 2. **Interface Web → Chatbot**
- Atendente atualiza na interface
- Mudanças refletidas no banco
- Chatbot pode consultar atualizações

### 3. **Histórico Completo**
- Todas as interações são salvas
- Transcript disponível em ambos
- Cronologia temporal preservada

## 🛡️ Segurança e Validação

### 1. **Validação de Protocolos**
- Verificação de unicidade
- Formato padronizado: `OUVMMDDYY/XXXX`
- Validação de dados obrigatórios

### 2. **Controle de Acesso**
- Autenticação para interface web
- Autorização baseada em perfis
- Log de todas as operações

### 3. **Backup e Recuperação**
- Dados salvos no banco SQLite
- Backup automático
- Recuperação em caso de falha

## 📈 Benefícios da Sincronização

### Para o Atendente
- ✅ **Visão unificada**: Todos os protocolos em um lugar
- ✅ **Atualização em tempo real**: Mudanças refletidas imediatamente
- ✅ **Histórico completo**: Conversa completa disponível
- ✅ **Continuidade**: Pode continuar atendimento de onde parou

### Para o Usuário
- ✅ **Transparência**: Pode ver status atualizado
- ✅ **Continuidade**: Não precisa repetir informações
- ✅ **Rastreabilidade**: Sabe exatamente o que foi dito

### Para a Gestão
- ✅ **Controle centralizado**: Todos os dados em um sistema
- ✅ **Relatórios unificados**: Estatísticas completas
- ✅ **Auditoria**: Histórico completo para análise
- ✅ **Eficiência**: Redução de duplicação e erros

## 🚀 Como Testar

### 1. **Teste de Geração de Protocolo**
1. Inicie conversa no WhatsApp
2. Complete um atendimento
3. Verifique se protocolo aparece na interface web

### 2. **Teste de Busca por Protocolo**
1. Digite um protocolo no campo de busca
2. Verifique se a demanda é encontrada
3. Teste ordenação por protocolo

### 3. **Teste de Sincronização**
1. Atualize status na interface web
2. Consulte protocolo no WhatsApp
3. Verifique se mudanças são refletidas

### 4. **Teste de Histórico**
1. Abra detalhes de uma demanda
2. Verifique histórico de interações
3. Teste exportação de transcript

## 🔧 Configuração

### Variáveis de Ambiente
```bash
# Backend
PORT=3001
DB_PATH=./ouvidoria.db

# Frontend
REACT_APP_API_URL=http://localhost:3001/api
```

### Dependências
```json
{
  "whatsapp-web.js": "^1.23.0",
  "sqlite3": "^5.1.6",
  "express": "^4.18.2",
  "nodemailer": "^6.9.7"
}
```

## 📞 Suporte

Para dúvidas sobre a sincronização de protocolos:
- **Desenvolvimento**: Equipe técnica
- **Operacional**: Administradores do sistema
- **Usuários**: Atendentes e gestores

A sincronização garante que todos os protocolos sejam rastreados e gerenciados de forma eficiente, proporcionando uma experiência unificada entre o chatbot WhatsApp e a interface web. 