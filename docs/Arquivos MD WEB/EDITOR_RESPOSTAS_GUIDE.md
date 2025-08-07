# Guia do Editor de Respostas - Sistema de Ouvidoria

## 📝 Visão Geral

O Editor de Respostas é uma ferramenta avançada para criar e enviar respostas formatadas aos cidadãos através do sistema de ouvidoria. Ele oferece recursos de formatação, modelos pré-definidos e múltiplas opções de envio.

## 🚀 Funcionalidades Principais

### 1. Editor de Texto com Formatação

O editor suporta formatação rica para criar respostas profissionais:

- **Negrito**: `*texto*` → **texto**
- **Itálico**: `_texto_` → *texto*
- **Riscado**: `~texto~` → ~~texto~~
- **Monospace**: `` `texto` `` → `texto`
- **Links**: `[texto](url)` → [texto](url)
- **Listas**: 
  - Com marcadores: `• item`
  - Numeradas: `1. item`

### 2. Variáveis Dinâmicas

Inserir automaticamente informações da demanda:

- `{protocolo}` - Número do protocolo
- `{data}` - Data atual
- `{nome}` - Nome do cidadão
- `{secretaria}` - Secretaria responsável

### 3. Modelos Pré-definidos

Templates prontos para situações comuns:

#### 📋 Dúvida Frequente
```
Olá! 

Agradecemos seu contato com a Ouvidoria Municipal.

Sua solicitação foi registrada e está sendo analisada pela equipe responsável. Em breve entraremos em contato com mais informações.

Protocolo: {protocolo}
Data: {data}

Atenciosamente,
Equipe da Ouvidoria Municipal
```

#### ℹ️ Informação Geral
```
Prezado(a) cidadão(ã),

Informamos que sua solicitação foi recebida e está sendo processada.

Para acompanhar o status, você pode consultar através do número de protocolo: {protocolo}

Qualquer dúvida, entre em contato conosco.

Obrigado pela confiança!
```

#### 🔧 Resposta Técnica
```
Sobre sua solicitação protocolada sob o número {protocolo}, informamos:

ANÁLISE TÉCNICA:
- Situação identificada: [DESCREVER]
- Medidas necessárias: [LISTAR]
- Prazo estimado: [INFORMAR]

CONCLUSÃO:
[RESPOSTA FINAL]

Em caso de dúvidas, estamos à disposição.
```

#### 🙏 Agradecimento
```
Agradecemos seu contato e a confiança depositada na Ouvidoria Municipal.

Sua contribuição é fundamental para melhorarmos nossos serviços.

Protocolo: {protocolo}

Continuamos à disposição!
```

### 4. Opções de Envio

#### 🤖 Via Chatbot (WhatsApp)
- Envio automático via WhatsApp
- Formatação preservada
- Notificação instantânea

#### 📧 Via E-mail
- Envio para e-mail específico
- Assunto personalizado
- Formatação HTML preservada

#### 📱 Via SMS
- Envio para telefone específico
- Texto simplificado
- Notificação rápida

## 🎯 Como Usar

### 1. Acessar o Editor

1. Faça login no sistema
2. Na lista de demandas, clique no botão **"✏️ Editor"**
3. O editor será aberto em uma nova janela

### 2. Criar a Resposta

#### Usando Formatação:
1. Clique em **"🎨 Formatação"**
2. Selecione o texto desejado
3. Clique nos botões de formatação:
   - **B** para negrito
   - **I** para itálico
   - **S** para riscado
   - **M** para monospace
   - **🔗** para links
   - **•** para listas
   - **1.** para numeração

#### Usando Variáveis:
1. Clique em **"🎨 Formatação"**
2. Na seção "Variáveis", clique nos botões:
   - **Protocolo** - insere `{protocolo}`
   - **Data** - insere `{data}`
   - **Nome** - insere `{nome}`
   - **Secretaria** - insere `{secretaria}`

#### Usando Modelos:
1. Clique em **"📋 Modelos"**
2. Escolha um modelo:
   - Dúvida Frequente
   - Informação Geral
   - Resposta Técnica
   - Agradecimento
3. O modelo será inserido automaticamente

### 3. Configurar Envio

1. Clique em **"📤 Envio"**
2. Escolha o modo de envio:
   - **Via Chatbot (WhatsApp)** - envio automático
   - **Via E-mail** - informe e-mail e assunto
   - **Via SMS** - informe telefone

### 4. Visualizar e Enviar

1. A resposta aparece em tempo real na **Visualização**
2. Revise o conteúdo
3. Clique em **"📤 Enviar Resposta"**

## 💾 Recursos Adicionais

### Salvar Rascunho
- Clique em **"💾 Salvar Rascunho"**
- O texto é salvo localmente
- Útil para trabalhos longos

### Carregar Rascunho
- Clique em **"📄 Carregar Rascunho"**
- Restaura o último rascunho salvo

### Visualização em Tempo Real
- Veja como a resposta ficará formatada
- Atualização automática conforme digita

## 🔧 Configurações Técnicas

### Formatação Suportada
- **Markdown básico** para formatação
- **HTML** para visualização
- **Emojis** para melhor comunicação

### Integração com Sistema
- **Banco de dados** - salva histórico
- **WhatsApp** - envio automático
- **E-mail** - via SMTP configurado
- **SMS** - via API (configurável)

### Segurança
- **Autenticação** obrigatória
- **Autorização** por secretaria
- **Logs** de todas as ações
- **Backup** automático

## 📊 Relatórios e Estatísticas

### Métricas Disponíveis
- Tempo médio de resposta
- Taxa de satisfação
- Tipos de resposta mais usados
- Eficiência por secretaria

### Exportação
- Relatórios em PDF
- Dados em Excel
- Gráficos interativos

## 🆘 Suporte e Dúvidas

### Problemas Comuns

**Q: A formatação não aparece no WhatsApp?**
R: O WhatsApp suporta formatação básica. Use *negrito*, _itálico_ e `monospace`.

**Q: Como personalizar os modelos?**
R: Os modelos estão no código do componente. Entre em contato com o administrador.

**Q: O e-mail não está sendo enviado?**
R: Verifique as configurações SMTP no arquivo de configuração.

**Q: Como adicionar novas variáveis?**
R: As variáveis são definidas no código. Consulte a documentação técnica.

### Contato
- **Suporte técnico**: suporte@ouvidoria.venturosa.gov.br
- **Administrador**: admin@ouvidoria.venturosa.gov.br
- **Telefone**: (87) 99999-9999

## 🔄 Atualizações Futuras

### Próximas Funcionalidades
- [ ] Assinatura digital
- [ ] Templates personalizáveis
- [ ] Integração com WhatsApp Business API
- [ ] Sistema de aprovação de respostas
- [ ] Automação baseada em IA
- [ ] Multi-idioma

### Melhorias Planejadas
- [ ] Interface mais intuitiva
- [ ] Mais opções de formatação
- [ ] Sistema de revisão
- [ ] Integração com CRM
- [ ] Analytics avançados

---

**Versão**: 1.0.0  
**Data**: Dezembro 2024  
**Desenvolvido por**: Equipe de TI - Prefeitura de Venturosa 