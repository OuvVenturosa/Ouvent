# 🏛️ SISTEMA DE OUVIDORIA MUNICIPAL DE VENTUROSA

## 📋 VISÃO GERAL

O Sistema de Ouvidoria Municipal é um chatbot inteligente desenvolvido para WhatsApp que permite aos cidadãos de Venturosa solicitar serviços, fazer reclamações, denúncias, sugestões e elogios de forma organizada e eficiente. O sistema também possui uma área administrativa para gestão de protocolos pelas secretarias municipais.

---

## 🚀 FUNCIONALIDADES PRINCIPAIS

### 👥 **PARA CIDADÃOS**
- ✅ Solicitação de serviços por secretaria
- ✅ Reclamações, denúncias, sugestões e elogios
- ✅ Consulta de protocolos em tempo real
- ✅ Anexo de documentos, fotos e vídeos
- ✅ Notificações automáticas de atualizações
- ✅ Histórico completo de atendimentos
- ✅ **Sistema de Avaliação da Ouvidoria** ⭐

### 🏛️ **PARA SECRETARIAS**
- ✅ Área administrativa restrita
- ✅ Gestão de protocolos pendentes
- ✅ Resposta oficial aos cidadãos
- ✅ Alteração de status de protocolos
- ✅ Relatórios de atendimentos
- ✅ Notificações automáticas
- ✅ **Visualização de Avaliações da Ouvidoria** ⭐

### 🔐 **PARA O OUVIDOR**
- ✅ Acesso total a todas as secretarias
- ✅ Visualização de todos os protocolos
- ✅ Seleção de secretaria específica
- ✅ Relatórios consolidados
- ✅ Supervisão completa do sistema
- ✅ **Gestão de Avaliações da Ouvidoria** ⭐

---

## 📱 COMO FUNCIONA

### **1. ACESSO AO SISTEMA**
```
Cidadão envia: "oi", "menu", "bom dia", etc.
↓
Sistema verifica se é número cadastrado
↓
Exibe menu apropriado
```

### **2. FLUXO PARA CIDADÃOS**
```
Menu Principal
↓
Escolha da Secretaria (1-9)
↓
Tipo de Atendimento (Reclamação/Denúncia/Sugestão/Elogio/Informação)
↓
Seleção de Serviço Específico
↓
Preenchimento de Dados
↓
Geração de Protocolo
↓
Notificação Automática para Secretaria
```

### **3. FLUXO PARA SECRETARIAS**
```
Digite "88" (apenas números cadastrados)
↓
Digite CPF autorizado
↓
Acesso à Área Administrativa
↓
Gestão de Protocolos
```

---

## 🔧 CONFIGURAÇÕES DO SISTEMA

### **NÚMEROS AUTORIZADOS**
```javascript
// Números que podem acessar área administrativa
const TELEFONES_CADASTRADOS = [
    '558791117150@c.us', 
    '558788414768@c.us',
    // Adicione mais números conforme necessário
];

// Administradores do sistema
const ADMINS = ['558791000000@c.us', '558799999999@c.us'];
```

### **CPFs AUTORIZADOS**
```javascript
// CPFs das Secretarias
const ADMIN_CPFS = {
    "00000000000": {
        secretaria: 4,
        nome: "João Silva",
        cargo: "Secretário de Infraestrutura"
    }
    // Adicione mais CPFs conforme necessário
};

// CPFs do Ouvidor (acesso total)
const OUVIDOR_CPFS = {
    "07971378408": {
        nome: "Ouvidor Municipal",
        cargo: "Ouvidor"
    }
};
```

### **SECRETARIAS CONFIGURADAS**
1. **Sec. Desenv. Rural e Meio Ambiente** - `558788414768@c.us`
2. **Sec. Assistência Social** - `558791522180@c.us`
3. **Sec. Educação e Esporte** - `558708414768@c.us`
4. **Sec. Infraestrutura e Seg. Pública** - `558708414768@c.us`
5. **Sec. Saúde e Direitos da Mulher** - `558708414768@c.us`
6. **Hosp. e Matern. Justa Maria Bezerra** - `558708414768@c.us`
7. **Programa Mulher Segura** - `558708414768@c.us`
8. **Sec. Finanças - Setor de Tributos** - `558708414768@c.us`
9. **Sec. Administração - Servidores Municipais** - `558708414768@c.us`

---

## 📊 ESTRUTURA DE PROTOCOLOS

### **FORMATO DO PROTOCOLO**
```
OUVMMDDYY/XXXX
Exemplo: OUV151224/0001
- OUV: Prefixo da Ouvidoria
- 15: Dia (15)
- 12: Mês (Dezembro)
- 24: Ano (2024)
- 0001: Número sequencial
```

### **STATUS DOS PROTOCOLOS**
- 🟡 **ABERTO**: Protocolo criado, aguardando secretaria
- 🔵 **ANDAMENTO**: Secretaria acessou e está trabalhando
- 🟠 **TRAMITAÇÃO**: Secretaria respondeu, aguardando usuário
- 🟢 **RESOLVIDO**: Solicitação atendida com sucesso
- 🔴 **REJEITADO**: Solicitação não pode ser atendida

---

## 🔔 SISTEMA DE NOTIFICAÇÕES

### **NOTIFICAÇÕES AUTOMÁTICAS**
- ✅ **Nova solicitação**: Secretaria recebe notificação imediata
- ✅ **Mudança de status**: Cidadão é notificado automaticamente
- ✅ **Resposta da secretaria**: Cidadão recebe resposta oficial
- ✅ **Alerta 24h**: Protocolos não acessados geram alerta

### **CANAIS DE NOTIFICAÇÃO**
- 📱 **WhatsApp**: Notificação direta para secretarias
- 📧 **E-mail**: Relatórios e notificações importantes
- 📊 **Relatórios**: Relatórios mensais automáticos

---

## 📈 RELATÓRIOS E ESTATÍSTICAS

### **RELATÓRIOS DISPONÍVEIS**
- 📊 **Relatório Mensal**: Estatísticas completas do mês
- 📋 **Protocolos Pendentes**: Lista de protocolos abertos
- 📈 **Estatísticas por Secretaria**: Dados específicos de cada setor
- 📝 **Histórico de Atendimentos**: Rastreabilidade completa

### **DADOS COLETADOS**
- 👥 Total de atendimentos
- 📊 Distribuição por tipo (reclamação, denúncia, etc.)
- 🏛️ Atendimentos por secretaria
- ⏱️ Tempo médio de resposta
- 📅 Tendências mensais
- ⭐ **Avaliações da Ouvidoria** (atendimento, resolução, satisfação)

---

## ⭐ SISTEMA DE AVALIAÇÃO DA OUVIDORIA

### **VISÃO GERAL**
O sistema de avaliação coleta feedback automático dos usuários após finalizar um atendimento, permitindo medir a qualidade do serviço prestado.

### **FLUXO DE AVALIAÇÃO**
```
Finalização do Atendimento (digite "00")
↓
Sistema pergunta: "Deseja avaliar nosso serviço?"
↓
Usuário escolhe: "1" (Sim) ou "2" (Não)
↓
Se "1" (Sim):
  1️⃣ Avaliação do Atendimento (1-5)
  2️⃣ Avaliação da Resolução (1-3)
  3️⃣ Satisfação Geral (1-5)
  4️⃣ Comentários Opcionais
  ↓
  Avaliação salva no relatório mensal

Se "2" (Não):
  ↓
  Mensagem de agradecimento e encerramento
```

### **DIMENSÕES AVALIADAS**
- **Atendimento**: Qualidade do serviço prestado (1-5)
- **Resolução**: Eficácia na solução do problema (1-3)
- **Satisfação**: Satisfação geral com a Ouvidoria (1-5)
- **Comentários**: Sugestões e feedback livre (opcional)

### **ACESSO ADMINISTRATIVO**
- **Secretarias**: Menu administrativo → Opção 6
- **Ouvidor**: Menu administrativo → Opção 7
- **Relatórios**: Incluídos automaticamente no relatório mensal

### **ESTATÍSTICAS DISPONÍVEIS**
- 📊 Médias por dimensão
- 📈 Distribuição percentual
- 📝 Comentários dos usuários
- 📅 Tendências mensais

---

## 🛠️ FUNCIONALIDADES TÉCNICAS

### **ARMAZENAMENTO DE DADOS**
- 📁 **Atendimentos Ativos**: Em memória para atendimentos em andamento
- 📊 **Atendimentos Mensais**: Armazenamento persistente por mês
- 📝 **Histórico de Conversas**: Log completo de interações
- 📎 **Anexos**: Suporte a documentos, fotos e vídeos

### **SEGURANÇA**
- 🔐 **Acesso Restrito**: Apenas números cadastrados acessam área administrativa
- 🔑 **Validação de CPF**: Verificação de CPFs autorizados
- 📱 **Validação de WhatsApp**: Verificação de números registrados
- 🔒 **Logs de Auditoria**: Registro de todas as ações

### **INTEGRAÇÕES**
- 📧 **SMTP Gmail**: Envio de e-mails automáticos
- 📱 **WhatsApp Business API**: Comunicação via WhatsApp
- 📊 **Geração de PDF**: Relatórios em formato PDF
- 📎 **Upload de Arquivos**: Suporte a múltiplos tipos de mídia

---

## 📋 MANUAL DE USO

### **PARA CIDADÃOS**

#### **Como Solicitar um Serviço:**
1. Envie "oi" ou "menu" para o WhatsApp da Ouvidoria
2. Escolha a secretaria desejada (1-9)
3. Selecione o tipo de atendimento
4. Escolha o serviço específico
5. Preencha os dados solicitados
6. Receba seu número de protocolo

#### **Como Consultar um Protocolo:**
1. Digite "99" no chat
2. Informe o número do protocolo
3. Visualize o status e histórico
4. Adicione informações se necessário

### **PARA SECRETARIAS**

#### **Como Acessar a Área Administrativa:**
1. Digite "88" no chat
2. Informe seu CPF autorizado
3. Acesse o menu administrativo
4. Gerencie os protocolos da sua secretaria

#### **Funcionalidades Disponíveis:**
- 📋 **Protocolos Pendentes**: Visualizar protocolos abertos
- 🔍 **Consultar Protocolo**: Buscar protocolo específico
- ✏️ **Responder Protocolo**: Adicionar resposta oficial
- 📊 **Relatório**: Ver estatísticas da secretaria
- ⚙️ **Alterar Status**: Mudar status do protocolo

### **PARA O OUVIDOR**

#### **Acesso Total:**
1. Digite "88" no chat
2. Informe CPF do ouvidor
3. Acesse todas as secretarias
4. Use opção 6 para selecionar secretaria específica

#### **Funcionalidades Especiais:**
- 🌐 **Visão Geral**: Todos os protocolos de todas as secretarias
- 📊 **Relatórios Consolidados**: Estatísticas gerais
- 🏛️ **Seleção de Secretaria**: Atuar como responsável de qualquer secretaria
- 📈 **Supervisão**: Acompanhamento completo do sistema

---

## 🔧 CONFIGURAÇÃO E MANUTENÇÃO

### **ADICIONAR NOVO NÚMERO AUTORIZADO:**
```javascript
const TELEFONES_CADASTRADOS = [
    '558791117150@c.us', 
    '558788414768@c.us',
    'NOVO_NUMERO@c.us', // Adicione aqui
];
```

### **ADICIONAR NOVO CPF DE SECRETARIA:**
```javascript
const ADMIN_CPFS = {
    "CPF_SEM_PONTOS": {
        secretaria: NUMERO_DA_SECRETARIA, // 1-9
        nome: "Nome Completo",
        cargo: "Cargo/Função"
    }
};
```

### **ADICIONAR NOVO CPF DE OUVIDOR:**
```javascript
const OUVIDOR_CPFS = {
    "CPF_SEM_PONTOS": {
        nome: "Nome do Ouvidor",
        cargo: "Ouvidor"
    }
};
```

### **ALTERAR NÚMERO DE SECRETARIA:**
```javascript
const SECRETARIAS_WHATSAPP = {
    1: "NOVO_NUMERO@c.us", // Secretaria 1
    2: "NOVO_NUMERO@c.us", // Secretaria 2
    // ...
};
```

---

## 📊 ESTATÍSTICAS DO SISTEMA

### **CAPACIDADE**
- 👥 **Usuários Simultâneos**: Ilimitado
- 📱 **Atendimentos por Dia**: Ilimitado
- 📊 **Protocolos por Mês**: Ilimitado
- 📎 **Tamanho de Anexos**: Até 16MB por arquivo

### **DISPONIBILIDADE**
- ⏰ **24/7**: Sistema disponível 24 horas por dia
- 🔄 **Automático**: Funcionamento sem intervenção manual
- 📱 **Multiplataforma**: Funciona em qualquer dispositivo WhatsApp
- 🌐 **Online**: Sem necessidade de instalação

---

## 🚀 BENEFÍCIOS DO SISTEMA

### **PARA O CIDADÃO**
- ✅ **Facilidade**: Atendimento rápido e simples
- ✅ **Transparência**: Acompanhamento em tempo real
- ✅ **Organização**: Protocolos organizados e rastreáveis
- ✅ **Acessibilidade**: Disponível 24/7 via WhatsApp

### **PARA A PREFEITURA**
- ✅ **Eficiência**: Redução de tempo de atendimento
- ✅ **Organização**: Gestão centralizada de demandas
- ✅ **Transparência**: Relatórios detalhados
- ✅ **Satisfação**: Melhoria na qualidade do atendimento

### **PARA AS SECRETARIAS**
- ✅ **Agilidade**: Notificações automáticas
- ✅ **Controle**: Gestão eficiente de protocolos
- ✅ **Relatórios**: Estatísticas detalhadas
- ✅ **Comunicação**: Resposta direta ao cidadão

---

## 📞 SUPORTE E CONTATO

### **Para Configurações:**
- 🔧 **Programador**: Entre em contato para alterações no sistema
- 📧 **E-mail**: ouvidoria.venturosa@gmail.com

### **Para Usuários:**
- 📱 **WhatsApp**: Use o próprio sistema para dúvidas
- 📧 **E-mail**: ouvidoria.venturosa@gmail.com

### **Para Secretarias:**
- 🔐 **Acesso**: Solicite cadastro do CPF
- 📱 **WhatsApp**: Use a opção 88 para acessar

---

## 🔄 ATUALIZAÇÕES E MELHORIAS

### **Versão Atual: 2.0**
- ✅ Área administrativa restrita
- ✅ Sistema de ouvidor com acesso total
- ✅ Notificações automáticas
- ✅ Relatórios mensais
- ✅ Suporte a anexos

### **Próximas Melhorias:**
- 📊 Dashboard web para administração
- 🤖 Integração com IA para respostas automáticas
- 📱 App mobile nativo
- 🔗 Integração com sistemas municipais
- 📈 Analytics avançados

---

**🏛️ Sistema desenvolvido para a Ouvidoria Municipal de Venturosa**  
**📱 Versão 2.0 - Dezembro 2024**  
**🔧 Desenvolvido com tecnologias modernas e segurança avançada** 