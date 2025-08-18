### Teste local completo (Backend, Frontend e Chatbot)

Este guia mostra como executar o backend, (opcionalmente) o frontend e simular um fluxo do chatbot localmente.

Pré-requisitos:
- Node.js 18+
- Python 3 (apenas para o loop interativo opcional do workspace)
- Windows PowerShell

Passos rápidos:
1. Abra o PowerShell na pasta do projeto `J:\CHATBOT OUV`.
2. Execute o script de execução completa:
```
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File scripts\executar_tudo_local.ps1
```
3. Para incluir um teste automatizado do fluxo do chatbot (simulado, sem enviar WhatsApp real):
```
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File scripts\executar_tudo_local.ps1 -TestChatbot
```

O que o script faz:
- Sobe o Backend em `http://localhost:3001` e realiza healthcheck.
- Inicia o Frontend em `http://localhost:3000` (se existir) em modo dev.
- Opcionalmente executa um teste simulado de menu/submenu do chatbot com as etapas:
  - tela inicial -> 1 (Nova Solicitação) -> 1 (Reclamação) -> 2 (Sec. Assistência Social)
  - descrição -> 1 (Confirmar)

Variáveis de ambiente úteis:
- `PORT` (backend): altera a porta da API.
- `DB_PATH` (backend): caminho do arquivo SQLite (padrão: `backend/ouvidoria.db`).
- `CHATBOT_TEST=1`: ativa modo de teste, apenas loga mensagens ao invés de enviar via WhatsApp.

Endpoints úteis:
- Backend Health: `http://localhost:3001/api/health`

Solução de problemas:
- Porta 3001 em uso: feche processos na porta ou altere `PORT`.
- Falha ao enviar mensagens no teste: garanta `CHATBOT_TEST=1` para simulação.


