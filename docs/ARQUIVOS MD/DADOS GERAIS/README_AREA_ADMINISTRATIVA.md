# 🔐 ÁREA ADMINISTRATIVA - OUVIDORIA MUNICIPAL DE VENTUROSA

## 📋 Visão Geral

A Área Administrativa (opção 88) permite que responsáveis das secretarias municipais acessem o sistema para gerenciar protocolos de atendimento, responder solicitações e acompanhar o status das demandas.

## 🚀 Como Acessar

1. **Digite "88"** no menu principal
2. **Digite seu CPF** (apenas números, sem pontos ou traços)
3. O sistema verificará se o CPF está autorizado
4. Se autorizado, você terá acesso ao menu administrativo da sua secretaria

## 📊 Funcionalidades Disponíveis

### 1. 📋 Protocolos Pendentes
- Lista todos os protocolos com status "ABERTO" da sua secretaria
- Mostra informações básicas: número, solicitante, tipo, data
- Permite selecionar protocolo para visualizar detalhes completos

### 2. 🔍 Consultar Protocolo Específico
- Consulta detalhada de qualquer protocolo da sua secretaria
- Mostra histórico completo de atualizações
- Exibe todas as informações do atendimento

### 3. ✏ Responder Protocolo
- Permite adicionar resposta oficial da secretaria
- Altera automaticamente status para "EM ANDAMENTO"
- Notifica automaticamente o usuário via WhatsApp

### 4. 📊 Relatório de Atendimentos
- Estatísticas da secretaria
- Distribuição por status
- Total de protocolos

### 5. ⚙ Alterar Status de Protocolo
- Permite alterar status manualmente
- Notifica automaticamente o usuário
- Registra alteração no histórico

## 📈 Status dos Protocolos

### 🟡 ABERTO
- Protocolo criado, aguardando primeiro acesso da secretaria
- Após 24 horas sem acesso, a secretaria recebe notificação de alerta

### 🔵 ANDAMENTO
- Responsável pela secretaria acessou e está em comunicação com usuário
- Protocolo está sendo trabalhado

### 🟠 TRAMITAÇÃO
- Responsável respondeu, mas usuário não retornou
- Após 24 horas sem acesso do usuário, entra em execução

### 🟢 RESOLVIDO
- Solicitação foi atendida com sucesso
- Demanda do usuário foi satisfeita

### 🔴 REJEITADO
- Solicitação não pode ser atendida
- Motivo deve ser justificado na resposta

## 🔔 Sistema de Notificações

### Notificações Automáticas para Usuários
- **Mudança de Status**: Usuário é notificado quando status é alterado
- **Resposta da Secretaria**: Usuário recebe resposta oficial via WhatsApp
- **Atualizações**: Qualquer alteração no protocolo gera notificação

### Notificações de Alerta para Secretarias
- **24h sem acesso**: Protocolos abertos há mais de 24h geram alerta
- **Via WhatsApp e Email**: Notificação dupla para garantir recebimento
- **Mensagem urgente**: Solicita acesso imediato ao protocolo

## 🛠 Configuração para o Programador

### Adicionando CPFs de Administradores

1. Abra o arquivo `chat.js`
2. Localize o objeto `ADMIN_CPFS` (linha ~50)
3. Adicione CPFs no formato:

```javascript
const ADMIN_CPFS = {
    "12345678901": {
        secretaria: 4, // Número da secretaria
        nome: "João Silva",
        cargo: "Secretário de Infraestrutura"
    }
};
```

### Números das Secretarias
- **1**: Sec. Desenv. Rural e Meio Ambiente
- **2**: Sec. Assistência Social
- **3**: Sec. Educação e Esporte
- **4**: Sec. Infraestrutura e Seg. Pública
- **5**: Sec. Saúde e Direitos da Mulher
- **6**: Hosp. e Matern. Justa Maria Bezerra
- **7**: Programa Mulher Segura
- **8**: Sec. Finanças - Setor de Tributos
- **9**: Sec. Administração - Servidores Municipais

## 📱 Navegação no Sistema

### Comandos de Navegação
- **"0"**: Voltar ao menu anterior (não sai da área administrativa)
- **"00"**: Finalizar atendimento e sair do sistema

### Exemplo de Fluxo
1. Usuário digita "88" → Menu principal
2. Digita CPF → Acesso à área administrativa
3. Escolhe opção "1" → Protocolos pendentes
4. Seleciona protocolo → Visualiza detalhes
5. Digita "0" → Volta ao menu administrativo
6. Escolhe opção "3" → Responder protocolo
7. Digita "00" → Finaliza atendimento

## 🔒 Segurança

### Validação de Acesso
- CPF deve estar cadastrado no sistema
- Acesso restrito apenas à secretaria do responsável
- Log de todas as ações realizadas

### Proteção de Dados
- Apenas responsáveis autorizados podem acessar
- Cada CPF está vinculado a uma secretaria específica
- Não é possível acessar protocolos de outras secretarias

## 📞 Suporte

### Para Responsáveis das Secretarias
- Entre em contato com o programador para cadastrar seu CPF
- Informe: CPF, Nome Completo, Cargo e Secretaria

### Para Usuários
- Use a opção "99" para consultar seus protocolos
- Receberá notificações automáticas sobre atualizações

## 🚨 Funcionalidades Especiais

### Verificação Automática de Protocolos Pendentes
- Sistema verifica a cada hora protocolos abertos há mais de 24h
- Envia notificações automáticas para secretarias
- Registra alertas no sistema

### Histórico Completo
- Todas as alterações são registradas
- Inclui data, hora e responsável
- Mantém rastreabilidade completa

---

**Desenvolvido para a Ouvidoria Municipal de Venturosa**  
*Sistema de Gestão de Protocolos e Atendimento ao Cidadão* 