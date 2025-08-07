# Controle de Acesso por Secretarias

## Visão Geral

O sistema implementa **controle de acesso rigoroso** por secretarias, garantindo que cada secretaria só possa visualizar e responder às demandas que lhe foram destinadas. Isso garante **confidencialidade** e **segurança** das informações.

## 🔒 Como Funciona o Controle de Acesso

### 1. **Princípio de Segregação**
- **Secretaria X** → Acesso apenas às demandas da Secretaria X
- **Secretaria Y** → Acesso apenas às demandas da Secretaria Y
- **Master** → Acesso a todas as secretarias (administrador)

### 2. **Níveis de Acesso**

#### **Usuário Comum (Secretaria Específica)**
- ✅ Visualiza apenas demandas da sua secretaria
- ✅ Responde apenas demandas da sua secretaria
- ✅ Filtros limitados à sua secretaria
- ❌ Não pode acessar outras secretarias
- ❌ Não pode ver demandas de outras secretarias

#### **Usuário Master (Administrador)**
- ✅ Visualiza todas as demandas
- ✅ Acesso a todas as secretarias
- ✅ Pode responder qualquer demanda
- ✅ Filtros completos
- ✅ Gerenciamento de usuários

## 🛠️ Implementação Técnica

### Backend - Middlewares de Autorização

#### **Middleware de Autenticação**
```javascript
function autenticarUsuario(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
}
```

#### **Middleware de Autorização por Secretaria**
```javascript
function autorizarPorSecretaria(req, res, next) {
  const { secretaria } = req.params;
  const usuarioSecretaria = req.usuario.secretaria;
  
  // Master pode acessar todas as secretarias
  if (req.usuario.is_master) {
    return next();
  }
  
  // Usuário só pode acessar sua própria secretaria
  if (usuarioSecretaria !== secretaria) {
    return res.status(403).json({ 
      erro: 'Acesso negado. Você só pode acessar demandas da sua secretaria.' 
    });
  }
  
  next();
}
```

#### **Middleware de Verificação de Demanda**
```javascript
function autorizarAcessoDemanda(req, res, next) {
  const { id } = req.params;
  
  // Master pode acessar todas as demandas
  if (req.usuario.is_master) {
    return next();
  }
  
  // Buscar a demanda para verificar a secretaria
  db.get('SELECT secretaria FROM demandas WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
    
    if (!row) {
      return res.status(404).json({ erro: 'Demanda não encontrada' });
    }
    
    // Verificar se o usuário tem acesso à secretaria da demanda
    if (req.usuario.secretaria !== row.secretaria) {
      return res.status(403).json({ 
        erro: 'Acesso negado. Você só pode acessar demandas da sua secretaria.' 
      });
    }
    
    next();
  });
}
```

### Endpoints Protegidos

#### **Lista de Demandas**
```javascript
app.get('/api/demandas/lista', autenticarUsuario, (req, res) => {
  // Controle de acesso por secretaria
  if (!req.usuario.is_master) {
    query += ' AND d.secretaria = ?';
    params.push(req.usuario.secretaria);
  }
  // ... resto da lógica
});
```

#### **Ações Rápidas**
```javascript
app.post('/api/demandas/:id/responder', autenticarUsuario, autorizarAcessoDemanda, (req, res) => {
  // Só executa se o usuário tem acesso à demanda
});

app.post('/api/demandas/:id/arquivar', autenticarUsuario, autorizarAcessoDemanda, (req, res) => {
  // Só executa se o usuário tem acesso à demanda
});

app.post('/api/demandas/:id/reclassificar', autenticarUsuario, autorizarAcessoDemanda, (req, res) => {
  // Só executa se o usuário tem acesso à demanda
});
```

#### **Detalhes e Histórico**
```javascript
app.get('/api/demandas/:id/detalhes-completos', autenticarUsuario, autorizarAcessoDemanda, (req, res) => {
  // Só executa se o usuário tem acesso à demanda
});

app.get('/api/demandas/:id/historico', autenticarUsuario, autorizarAcessoDemanda, (req, res) => {
  // Só executa se o usuário tem acesso à demanda
});
```

### Frontend - Interface Adaptativa

#### **Carregamento de Secretarias**
```javascript
const carregarSecretarias = async () => {
  const response = await fetch(`${API_URL}/secretarias`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  setSecretarias(data);
  
  // Se o usuário só tem acesso a uma secretaria, definir como filtro padrão
  if (data.length === 1) {
    setFiltros(prev => ({ ...prev, secretaria: data[0] }));
  }
};
```

#### **Informação de Controle de Acesso**
```javascript
{secretarias.length === 1 && (
  <div className="info-acesso">
    <p>🔒 <strong>Controle de Acesso:</strong> Você está visualizando apenas as demandas da sua secretaria.</p>
  </div>
)}
```

## 📊 Estrutura de Dados

### **Tabela `usuarios`**
```sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cpf TEXT UNIQUE,
  telefone TEXT,
  email TEXT,
  senha_hash TEXT,
  secretaria TEXT,           -- Secretaria do usuário
  is_master BOOLEAN DEFAULT 0,  -- Se é administrador
  data_criacao TEXT
);
```

### **Tabela `demandas`**
```sql
CREATE TABLE demandas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  protocolo TEXT UNIQUE,
  secretaria TEXT,           -- Secretaria responsável
  categoria TEXT,
  status TEXT DEFAULT 'pendente',
  prioridade TEXT DEFAULT 'normal',
  usuario_anonimizado TEXT,
  data_criacao TEXT,
  data_atualizacao TEXT,
  resumo_mensagem TEXT,
  descricao_completa TEXT,
  responsavel_id INTEGER,
  FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
);
```

## 🔍 Funcionalidades de Controle

### 1. **Filtros Automáticos**
- Usuário comum: Filtros limitados à sua secretaria
- Master: Filtros completos para todas as secretarias

### 2. **Lista de Secretarias**
- Usuário comum: Vê apenas sua secretaria
- Master: Vê todas as secretarias

### 3. **Ações Rápidas**
- Verificação automática de acesso antes de executar
- Erro 403 se tentar acessar demanda de outra secretaria

### 4. **Detalhes e Histórico**
- Verificação de acesso antes de mostrar detalhes
- Histórico protegido por secretaria

## 🚨 Mensagens de Erro

### **Acesso Negado (403)**
```json
{
  "erro": "Acesso negado. Você só pode acessar demandas da sua secretaria."
}
```

### **Demanda Não Encontrada (404)**
```json
{
  "erro": "Demanda não encontrada"
}
```

### **Token Inválido (401)**
```json
{
  "erro": "Token inválido"
}
```

## 📱 Interface do Usuário

### **Usuário Comum**
- 🔒 **Indicador visual**: Mensagem informativa sobre controle de acesso
- 📋 **Filtros limitados**: Apenas opções da sua secretaria
- 🎯 **Foco automático**: Secretaria pré-selecionada
- ⚠️ **Alertas**: Mensagens claras sobre restrições

### **Usuário Master**
- 🌐 **Acesso completo**: Todas as secretarias disponíveis
- 📊 **Visão geral**: Estatísticas de todas as secretarias
- 🔧 **Gerenciamento**: Controle de usuários e configurações

## 🔐 Segurança

### 1. **Validação em Múltiplas Camadas**
- **Frontend**: Interface adaptativa
- **Backend**: Middlewares de autorização
- **Banco de Dados**: Filtros automáticos

### 2. **Verificação de Token**
- Autenticação obrigatória
- Verificação de validade
- Decodificação de permissões

### 3. **Controle de Sessão**
- Token JWT com expiração
- Logout automático
- Renovação de sessão

### 4. **Log de Acesso**
- Registro de tentativas de acesso
- Auditoria de ações
- Monitoramento de segurança

## 📈 Benefícios

### **Para a Secretaria**
- ✅ **Confidencialidade**: Dados protegidos
- ✅ **Foco**: Apenas demandas relevantes
- ✅ **Eficiência**: Interface simplificada
- ✅ **Segurança**: Acesso controlado

### **Para a Gestão**
- ✅ **Controle**: Visão completa para administradores
- ✅ **Auditoria**: Rastreamento de ações
- ✅ **Segurança**: Proteção de dados sensíveis
- ✅ **Compliance**: Atendimento a requisitos legais

### **Para o Sistema**
- ✅ **Performance**: Consultas otimizadas
- ✅ **Escalabilidade**: Fácil adição de secretarias
- ✅ **Manutenibilidade**: Código organizado
- ✅ **Confiabilidade**: Validações robustas

## 🚀 Como Testar

### 1. **Teste de Usuário Comum**
1. Faça login com usuário de secretaria específica
2. Verifique se só vê demandas da sua secretaria
3. Teste ações rápidas em demandas da sua secretaria
4. Tente acessar demanda de outra secretaria (deve dar erro)

### 2. **Teste de Usuário Master**
1. Faça login com usuário master
2. Verifique se vê todas as secretarias
3. Teste ações em demandas de qualquer secretaria
4. Verifique funcionalidades de gerenciamento

### 3. **Teste de Segurança**
1. Tente acessar endpoint sem token
2. Tente acessar com token inválido
3. Tente acessar demanda de outra secretaria
4. Verifique mensagens de erro apropriadas

## 🔧 Configuração

### **Variáveis de Ambiente**
```bash
# JWT Secret
JWT_SECRET=sua_chave_secreta_aqui

# Tempo de expiração do token (8 horas)
JWT_EXPIRES_IN=8h
```

### **Estrutura de Secretarias**
```javascript
const SECRETARIAS = [
  'Secretaria de Desenvolvimento Rural e Meio Ambiente',
  'Secretaria de Assistência Social',
  'Secretaria de Educação e Esporte',
  'Secretaria de Infraestrutura e Segurança Pública',
  'Secretaria de Saúde e Direitos da Mulher',
  'Hospital e Maternidade Justa Maria Bezerra',
  'Programa Mulher Segura',
  'Secretaria de Finanças - Setor de Tributos',
  'Secretaria de Administração - Servidores Municipais'
];
```

## 📞 Suporte

Para dúvidas sobre controle de acesso:
- **Desenvolvimento**: Equipe técnica
- **Operacional**: Administradores do sistema
- **Usuários**: Atendentes e gestores

O controle de acesso garante que cada secretaria trabalhe apenas com suas demandas, mantendo a **confidencialidade** e **organização** do sistema. 