# Sistema de Avaliação da Ouvidoria Municipal de Venturosa

## 📋 Visão Geral

O sistema de avaliação da Ouvidoria foi implementado para coletar feedback dos usuários sobre a qualidade do atendimento recebido. Após finalizar um atendimento, o usuário é automaticamente convidado a avaliar o serviço.

## 🎯 Objetivos

- Coletar feedback qualitativo dos usuários
- Medir a satisfação com o atendimento
- Avaliar a eficácia na resolução de problemas
- Identificar pontos de melhoria
- Gerar relatórios mensais com estatísticas de avaliação

## 📊 Estrutura da Avaliação

### 1. Avaliação do Atendimento (1-5)
- **1** - 😞 Muito Ruim
- **2** - 😕 Ruim
- **3** - 😐 Regular
- **4** - 🙂 Bom
- **5** - 😊 Excelente

### 2. Avaliação da Resolução (1-3)
- **1** - ❌ Não foi resolvido
- **2** - ⚠️ Parcialmente resolvido
- **3** - ✅ Totalmente resolvido

### 3. Satisfação Geral (1-5)
- **1** - 😞 Muito Insatisfeito
- **2** - 😕 Insatisfeito
- **3** - 😐 Neutro
- **4** - 🙂 Satisfeito
- **5** - 😊 Muito Satisfeito

### 4. Comentários Opcionais
- Campo de texto livre para sugestões e comentários
- Opção de finalizar sem comentário (digite "1")

## 🔄 Fluxo de Avaliação

1. **Finalização do Atendimento**: Usuário digita "00" para finalizar
2. **Pergunta de Avaliação**: Sistema pergunta se deseja avaliar o serviço
3. **Escolha do Usuário**: 
   - **"1" - Sim**: Inicia processo de avaliação
   - **"2" - Não**: Envia agradecimento e encerra
4. **Perguntas Sequenciais**: Sistema apresenta as perguntas uma por vez
5. **Validação**: Cada resposta é validada antes de prosseguir
6. **Finalização**: Avaliação é salva e registrada no relatório mensal

## 📈 Estatísticas Coletadas

### Médias Calculadas
- **Média de Atendimento**: Soma das notas / Total de avaliações
- **Média de Resolução**: Soma das notas / Total de avaliações
- **Média de Satisfação**: Soma das notas / Total de avaliações

### Distribuições
- **Distribuição por Nota**: Quantidade de cada nota (1-5)
- **Percentuais**: Porcentagem de cada nota em relação ao total
- **Tendências**: Identificação de padrões de avaliação

## 📋 Relatório Mensal

### Seção de Avaliação
O relatório mensal inclui uma seção dedicada às avaliações com:

1. **Estatísticas Gerais**
   - Total de avaliações no período
   - Médias das três dimensões avaliadas

2. **Distribuições Detalhadas**
   - Gráficos de distribuição por nota
   - Percentuais de cada categoria

3. **Comentários dos Usuários**
   - Últimos 5 comentários registrados
   - Análise qualitativa dos feedbacks

4. **Análise Comparativa**
   - Comparação com períodos anteriores
   - Identificação de tendências

## 🔐 Acesso Administrativo

### Menu de Avaliações
Os administradores podem acessar as estatísticas de avaliação através do menu administrativo:

- **Opção 6**: Ver Avaliações da Ouvidoria (para secretarias)
- **Opção 7**: Ver Avaliações da Ouvidoria (para ouvidor)

### Informações Disponíveis
- Estatísticas do mês atual
- Médias e distribuições
- Comparativos percentuais
- Resumo executivo

## 💾 Armazenamento de Dados

### Estrutura de Dados
```javascript
avaliacoesOuvidoria = {
    senderId: {
        protocolNumber: "OUVMMDDYY/XXXX",
        dataInicio: "2024-01-01T10:00:00.000Z",
        etapa: "atendimento|resolucao|satisfacao|comentario",
        respostas: {
            atendimento: 5,
            resolucao: 3,
            satisfacao: 5,
            comentario: "Texto opcional"
        },
        finalizada: true,
        dataFinalizacao: "2024-01-01T10:05:00.000Z"
    }
}
```

### Integração com Relatórios
- Avaliações são automaticamente incluídas no relatório mensal
- Dados são agregados por período (mês/ano)
- Estatísticas são calculadas em tempo real

## 🎨 Interface do Usuário

### Mensagens do Sistema
- **Pergunta Inicial**: "Deseja avaliar nosso serviço?" (opcional)
- **Início**: Apresentação clara do processo (apenas se escolher avaliar)
- **Progresso**: Indicação da etapa atual
- **Validação**: Mensagens de erro para entradas inválidas
- **Finalização**: Confirmação e agradecimento

### Vantagens da Abordagem Opcional
- **Respeito ao usuário**: Não força a avaliação
- **Maior taxa de participação**: Quem avalia realmente quer participar
- **Feedback mais qualitativo**: Avaliações mais sinceras
- **Experiência menos intrusiva**: Usuário tem controle sobre o processo
- **Flexibilidade**: Permite encerramento rápido para quem não quer avaliar

### Emojis e Formatação
- Uso de emojis para facilitar compreensão
- Formatação em negrito para destaque
- Numeração clara das etapas
- Instruções objetivas

## 🔧 Funcionalidades Técnicas

### Validação de Entrada
- Verificação de números válidos
- Mensagens de erro específicas
- Possibilidade de repetir entrada

### Persistência de Dados
- Armazenamento em memória durante sessão
- Integração com sistema de relatórios
- Backup automático em relatórios mensais

### Processamento Assíncrono
- Não bloqueia o sistema principal
- Tratamento de erros robusto
- Recuperação de estado em caso de falha

## 📊 Métricas de Qualidade

### Indicadores Principais
- **NPS (Net Promoter Score)**: Baseado na satisfação geral
- **Taxa de Resolução**: Percentual de problemas resolvidos
- **Satisfação do Atendimento**: Qualidade do serviço prestado

### Metas Sugeridas
- **Atendimento**: Média ≥ 4.0/5.0
- **Resolução**: ≥ 80% totalmente resolvidos
- **Satisfação**: Média ≥ 4.0/5.0

## 🔄 Melhorias Futuras

### Funcionalidades Planejadas
- Dashboard em tempo real
- Alertas para baixas avaliações
- Análise de sentimento dos comentários
- Comparação entre secretarias
- Relatórios trimestrais e anuais

### Integrações
- Sistema de notificações automáticas
- Exportação para planilhas
- API para integração externa
- Backup em banco de dados

## 📞 Suporte

Para dúvidas sobre o sistema de avaliação:
- Consulte a documentação técnica
- Entre em contato com a equipe de desenvolvimento
- Verifique os logs do sistema para troubleshooting

---

**Versão**: 1.0  
**Data de Implementação**: Janeiro 2024  
**Responsável**: Equipe de Desenvolvimento da Ouvidoria Municipal 