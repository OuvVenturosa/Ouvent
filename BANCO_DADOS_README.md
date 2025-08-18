# 🗄️ Sistema de Banco de Dados para Chatbot WhatsApp

## 📋 Visão Geral

Este sistema implementa o salvamento automático de **todas as conversas** do chatbot WhatsApp em um banco de dados SQLite localizado na **unidade N** do servidor. Todas as interações, mensagens, opções de menu selecionadas e anexos são armazenados de forma persistente.

## 🎯 Funcionalidades Implementadas

### ✅ **Salvamento Automático de:**
- **Conversas completas** com todos os dados do atendimento
- **Mensagens individuais** (usuário e bot)
- **Opções de menu** selecionadas pelo usuário
- **Anexos** (fotos, documentos, vídeos)
- **Histórico completo** de navegação
- **Respostas dos responsáveis** (secretarias e ouvidor)
- **Consultas de protocolos** (via WhatsApp e interface web)
- **Alterações de status** com histórico completo
- **Comentários e interações adicionais** dos usuários

### ✅ **Persistência de Dados:**
- Dados não são perdidos ao reiniciar o chatbot
- Histórico completo de todas as conversas
- Rastreamento de fluxo de atendimento
- Relatórios detalhados por protocolo

## 🗂️ Estrutura do Banco de Dados

### 📍 **Localização**
```
N:\ouvidoria.db
```

### 🗃️ **Tabelas Criadas**

#### 1. **`conversas_whatsapp`** - Conversas principais
```sql
CREATE TABLE conversas_whatsapp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  protocolo TEXT,                    -- Número do protocolo
  sender_id TEXT,                    -- ID do usuário WhatsApp
  nome_usuario TEXT,                 -- Nome do usuário
  secretaria INTEGER,                -- Secretaria selecionada
  tipo_atendimento INTEGER,          -- Tipo (1=Reclamação, 2=Denúncia, etc.)
  anonimo BOOLEAN DEFAULT 0,         -- Se é anônimo
  data_inicio TEXT,                  -- Data de início da conversa
  data_fim TEXT,                     -- Data de fim da conversa
  status TEXT DEFAULT 'ativo',       -- Status da conversa
  descricao TEXT,                    -- Descrição do problema
  servico_selecionado TEXT,          -- Serviço escolhido
  detalhes_servico TEXT,             -- Detalhes do serviço
  data_ocorrido TEXT,                -- Data do ocorrido
  local_ocorrido TEXT,               -- Local do ocorrido
  detalhes_adicionais TEXT,          -- Informações adicionais
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. **`mensagens_whatsapp`** - Mensagens individuais
```sql
CREATE TABLE mensagens_whatsapp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversa_id INTEGER,               -- ID da conversa
  protocolo TEXT,                    -- Número do protocolo
  sender_id TEXT,                    -- ID do usuário
  mensagem TEXT,                     -- Conteúdo da mensagem
  origem TEXT,                       -- 'usuário', 'bot', 'atendente'
  timestamp TEXT,                    -- Data/hora da mensagem
  tipo_midia TEXT,                   -- Tipo de mídia (se aplicável)
  caminho_arquivo TEXT,              -- Caminho do arquivo (se aplicável)
  mime_type TEXT,                    -- Tipo MIME (se aplicável)
  nome_original TEXT,                -- Nome original do arquivo
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversa_id) REFERENCES conversas_whatsapp(id)
);
```

#### 3. **`opcoes_menu_whatsapp`** - Opções de menu selecionadas
```sql
CREATE TABLE opcoes_menu_whatsapp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversa_id INTEGER,               -- ID da conversa
  protocolo TEXT,                    -- Número do protocolo
  sender_id TEXT,                    -- ID do usuário
  menu TEXT,                         -- Nome do menu
  opcao TEXT,                        -- Opção selecionada
  titulo TEXT,                       -- Título da opção
  timestamp TEXT,                    -- Data/hora da seleção
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversa_id) REFERENCES conversas_whatsapp(id)
);
```

#### 4. **`anexos_whatsapp`** - Arquivos anexados
```sql
CREATE TABLE anexos_whatsapp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversa_id INTEGER,               -- ID da conversa
  protocolo TEXT,                    -- Número do protocolo
  sender_id TEXT,                    -- ID do usuário
  tipo TEXT,                         -- Tipo do anexo (foto, vídeo, documento)
  caminho TEXT,                      -- Caminho do arquivo
  nome_original TEXT,                -- Nome original do arquivo
  mime_type TEXT,                    -- Tipo MIME
  data_envio TEXT,                   -- Data de envio
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversa_id) REFERENCES conversas_whatsapp(id)
);
```

#### 5. **`respostas_responsaveis`** - Respostas dos responsáveis
```sql
CREATE TABLE respostas_responsaveis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversa_id INTEGER,               -- ID da conversa
  protocolo TEXT,                    -- Número do protocolo
  responsavel_id TEXT,               -- ID do responsável
  responsavel_nome TEXT,             -- Nome do responsável
  responsavel_tipo TEXT,             -- 'secretaria' ou 'ouvidor'
  secretaria INTEGER,                -- Secretaria responsável
  resposta TEXT,                     -- Conteúdo da resposta
  anexo_caminho TEXT,                -- Caminho do anexo (se houver)
  anexo_nome TEXT,                   -- Nome do anexo
  anexo_mime TEXT,                   -- Tipo MIME do anexo
  data_resposta TEXT,                -- Data da resposta
  status_anterior TEXT,              -- Status anterior do protocolo
  status_novo TEXT,                  -- Novo status do protocolo
  observacoes TEXT,                  -- Observações adicionais
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversa_id) REFERENCES conversas_whatsapp(id)
);
```

#### 6. **`consultas_protocolos`** - Consultas de protocolos
```sql
CREATE TABLE consultas_protocolos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  protocolo TEXT,                    -- Número do protocolo consultado
  sender_id TEXT,                    -- ID do usuário (se via WhatsApp)
  nome_usuario TEXT,                 -- Nome do usuário
  tipo_consulta TEXT,                -- 'whatsapp', 'web', 'mobile'
  mensagem_consulta TEXT,            -- Mensagem da consulta
  resposta_sistema TEXT,             -- Resposta do sistema
  data_consulta TEXT,                -- Data da consulta
  ip_origem TEXT,                    -- IP de origem (se via web)
  user_agent TEXT,                   -- User agent (se via web)
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### 7. **`historico_status_protocolos`** - Histórico de alterações de status
```sql
CREATE TABLE historico_status_protocolos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  protocolo TEXT,                    -- Número do protocolo
  status_anterior TEXT,              -- Status anterior
  status_novo TEXT,                  -- Novo status
  responsavel_id TEXT,               -- ID do responsável
  responsavel_nome TEXT,             -- Nome do responsável
  responsavel_tipo TEXT,             -- 'secretaria', 'ouvidor', 'sistema'
  data_alteracao TEXT,               -- Data da alteração
  motivo TEXT,                       -- Motivo da alteração
  observacoes TEXT,                  -- Observações adicionais
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### 8. **`interacoes_adicionais`** - Comentários e interações
```sql
CREATE TABLE interacoes_adicionais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  protocolo TEXT,                    -- Número do protocolo
  sender_id TEXT,                    -- ID do usuário
  nome_usuario TEXT,                 -- Nome do usuário
  tipo_interacao TEXT,               -- 'comentario', 'pergunta', 'observacao'
  mensagem TEXT,                     -- Conteúdo da interação
  anexo_caminho TEXT,                -- Caminho do anexo (se houver)
  anexo_nome TEXT,                   -- Nome do anexo
  anexo_mime TEXT,                   -- Tipo MIME do anexo
  data_interacao TEXT,               -- Data da interação
  origem TEXT,                       -- 'usuario', 'admin', 'sistema'
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Como Funciona

### 1. **Início da Conversa**
- Quando um usuário inicia um atendimento, uma nova conversa é criada na tabela `conversas_whatsapp`
- O sistema gera um protocolo único
- Todos os dados básicos são armazenados

### 2. **Durante a Conversa**
- **Cada mensagem** é salva na tabela `mensagens_whatsapp`
- **Cada opção de menu** selecionada é salva na tabela `opcoes_menu_whatsapp`
- **Cada anexo** enviado é salvo na tabela `anexos_whatsapp`

### 3. **Finalização**
- Quando o atendimento termina, a conversa é marcada como "finalizada"
- Data de fim é registrada
- Todos os dados ficam disponíveis para consulta

## 📊 Consultas Úteis

### 🔍 **Buscar conversa por protocolo**
```sql
SELECT * FROM conversas_whatsapp WHERE protocolo = 'OUV010124/0001';
```

### 📝 **Ver todas as mensagens de uma conversa**
```sql
SELECT m.* FROM mensagens_whatsapp m
JOIN conversas_whatsapp c ON m.conversa_id = c.id
WHERE c.protocolo = 'OUV010124/0001'
ORDER BY m.timestamp ASC;
```

### 🎯 **Ver opções de menu selecionadas**
```sql
SELECT om.* FROM opcoes_menu_whatsapp om
JOIN conversas_whatsapp c ON om.conversa_id = c.id
WHERE c.protocolo = 'OUV010124/0001'
ORDER BY om.timestamp ASC;
```

### 📎 **Ver anexos de uma conversa**
```sql
SELECT a.* FROM anexos_whatsapp a
JOIN conversas_whatsapp c ON a.conversa_id = c.id
WHERE c.protocolo = 'OUV010124/0001'
ORDER BY a.data_envio ASC;
```

### 📈 **Estatísticas por secretaria**
```sql
SELECT 
  secretaria,
  COUNT(*) as total_conversas,
  COUNT(CASE WHEN status = 'finalizado' THEN 1 END) as finalizadas,
  COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativas
FROM conversas_whatsapp 
GROUP BY secretaria;
```

### 💬 **Ver respostas dos responsáveis**
```sql
SELECT r.*, c.nome_usuario as solicitante
FROM respostas_responsaveis r
JOIN conversas_whatsapp c ON r.conversa_id = c.id
WHERE r.protocolo = 'OUV010124/0001'
ORDER BY r.data_resposta DESC;
```

### 🔍 **Ver consultas de protocolo**
```sql
SELECT * FROM consultas_protocolos 
WHERE protocolo = 'OUV010124/0001'
ORDER BY data_consulta DESC;
```

### 📊 **Ver histórico de status**
```sql
SELECT * FROM historico_status_protocolos 
WHERE protocolo = 'OUV010124/0001'
ORDER BY data_alteracao DESC;
```

### 💭 **Ver comentários e interações**
```sql
SELECT * FROM interacoes_adicionais 
WHERE protocolo = 'OUV010124/0001'
ORDER BY data_interacao ASC;
```

### 📋 **Relatório completo de protocolo**
```sql
-- Este comando usa a função gerarRelatorioConversa() que retorna todos os dados
-- relacionados ao protocolo em uma única consulta
```

## 🚀 Como Usar

### 1. **Instalação**
```bash
# O sistema já está integrado ao chat.js
# Apenas certifique-se de que a unidade N está acessível
```

### 2. **Teste do Banco**
```bash
# Executar teste básico
node teste_banco.js

# Executar teste das novas funcionalidades
node teste_novas_funcionalidades.js

# Ou usar os scripts PowerShell
.\teste_banco.ps1
.\teste_novas_funcionalidades.ps1
```

### 3. **Verificação**
- O banco será criado automaticamente em `N:\ouvidoria.db`
- As tabelas serão criadas na primeira execução
- Logs mostrarão o status das operações

## 🔍 Monitoramento

### 📊 **Logs de Operações**
- ✅ Conversa criada no banco com ID: X
- ✅ Mensagem salva com ID: X
- ✅ Opção de menu salva com ID: X
- ✅ Anexo salvo com ID: X
- ✅ Conversa finalizada: PROTOCOLO

### ❌ **Logs de Erros**
- ❌ Erro ao conectar ao banco de dados: MENSAGEM
- ❌ Erro ao salvar mensagem: MENSAGEM
- ❌ Erro ao salvar opção de menu: MENSAGEM

## 📋 Funções Disponíveis

### **Core Functions**
- `salvarConversa(conversa)` - Cria nova conversa
- `salvarMensagem(mensagem)` - Salva mensagem individual
- `salvarOpcaoMenu(opcao)` - Salva opção de menu
- `salvarAnexo(anexo)` - Salva anexo

### **Functions para Responsáveis**
- `salvarRespostaResponsavel(resposta)` - Salva resposta de secretaria/ouvidor
- `buscarRespostasResponsaveis(protocolo)` - Busca respostas por protocolo

### **Functions para Consultas**
- `salvarConsultaProtocolo(consulta)` - Salva consulta de protocolo
- `buscarConsultasProtocolo(protocolo)` - Busca consultas por protocolo

### **Functions para Status**
- `salvarAlteracaoStatus(status)` - Salva alteração de status
- `buscarHistoricoStatus(protocolo)` - Busca histórico de status

### **Functions para Interações**
- `salvarInteracaoAdicional(interacao)` - Salva comentários/interações
- `buscarInteracoesAdicionais(protocolo)` - Busca interações por protocolo

### **Query Functions**
- `buscarConversaPorProtocolo(protocolo)` - Busca conversa
- `buscarMensagensConversa(conversaId)` - Busca mensagens
- `buscarOpcoesMenuConversa(conversaId)` - Busca opções
- `buscarAnexosConversa(conversaId)` - Busca anexos

### **Utility Functions**
- `finalizarConversa(protocolo, dataFim, status)` - Finaliza conversa
- `gerarRelatorioConversa(protocolo)` - Gera relatório completo
- `fecharConexao()` - Fecha conexão com banco

## 🛡️ Segurança e Privacidade

### ✅ **Proteções Implementadas**
- Dados anônimos são marcados como `anonimo = 1`
- Nomes de usuário podem ser "Anônimo" para solicitações anônimas
- Todas as operações são logadas para auditoria

### 🔒 **Conformidade LGPD**
- Sistema respeita escolha de anonimato do usuário
- Dados pessoais só são armazenados quando explicitamente permitido
- Histórico completo para transparência

## 🔧 Manutenção

### 📅 **Backup Recomendado**
```bash
# Backup diário do banco
copy "N:\ouvidoria.db" "N:\backup\ouvidoria_$(Get-Date -Format 'yyyyMMdd').db"
```

### 🧹 **Limpeza de Dados Antigos**
```sql
-- Remover conversas antigas (exemplo: mais de 2 anos)
DELETE FROM conversas_whatsapp 
WHERE created_at < datetime('now', '-1 years');

-- Limpar anexos de conversas removidas
DELETE FROM anexos_whatsapp 
WHERE conversa_id NOT IN (SELECT id FROM conversas_whatsapp);
```

## 📞 Suporte

### 🆘 **Problemas Comuns**
1. **Erro de conexão**: Verificar se a unidade N está acessível
2. **Tabelas não criadas**: Verificar permissões de escrita na unidade N
3. **Erro de salvamento**: Verificar espaço em disco na unidade N

### 📧 **Contato**
- Para suporte técnico, verificar logs do sistema
- Todas as operações são logadas para diagnóstico

---

## 🎉 **Resultado Final**

Com esta implementação, **todas as conversas do chatbot WhatsApp são automaticamente salvas no banco de dados SQLite na unidade N**, proporcionando:

- ✅ **Persistência completa** de dados
- ✅ **Histórico detalhado** de atendimentos
- ✅ **Rastreabilidade** de fluxos de menu
- ✅ **Armazenamento** de anexos
- ✅ **Relatórios completos** por protocolo
- ✅ **Conformidade** com LGPD
- ✅ **Auditoria** completa de operações

O sistema agora mantém um registro completo e persistente de todas as interações, permitindo análises detalhadas e relatórios completos de atendimento.
