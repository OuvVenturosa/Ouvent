# Chatbot de WhatsApp para Ouvidoria Municipal

Este é um chatbot de WhatsApp desenvolvido para a Ouvidoria Municipal, permitindo que os cidadãos façam solicitações, consultem protocolos e obtenham informações sobre a ouvidoria.

## Estrutura do Projeto

```
chatbot/
├── src/
│   ├── config/         # Configurações do chatbot
│   ├── controllers/    # Controladores para gerenciar eventos
│   ├── models/         # Modelos de dados
│   ├── services/       # Serviços para funcionalidades específicas
│   ├── utils/          # Utilitários diversos
│   └── index.js        # Ponto de entrada do chatbot
├── logs/               # Logs do sistema
├── anexos/             # Anexos enviados pelos usuários
├── relatorios/         # Relatórios gerados pelo sistema
├── relatorios_mensais/ # Relatórios mensais automáticos
├── package.json        # Dependências do projeto
└── README.md           # Documentação
```

## Requisitos

- Node.js >= 14.0.0
- NPM >= 6.0.0

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
cd chatbot
npm install
```

## Configuração

Edite o arquivo `src/config/config.js` para configurar:

- Administradores do sistema
- Emails das secretarias
- Números de WhatsApp das secretarias
- Configurações de email

## Execução

Para iniciar o chatbot:

```bash
npm start
```

Para desenvolvimento com reinicialização automática:

```bash
npm run dev
```

## Funcionalidades

- Recebimento de solicitações via WhatsApp
- Consulta de protocolos
- Notificação automática para secretarias
- Geração de relatórios mensais
- Painel administrativo via comandos de WhatsApp

## Comandos de Administrador

- `/status` - Verificar status do sistema

## Fluxo de Atendimento

1. Usuário inicia conversa com o chatbot
2. Chatbot apresenta menu principal
3. Usuário seleciona opção desejada
4. Chatbot processa a solicitação
5. Secretaria responsável é notificada
6. Usuário recebe número de protocolo para acompanhamento

## Contribuição

Para contribuir com o projeto, siga estas etapas:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request