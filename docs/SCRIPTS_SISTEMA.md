# Documentação dos Scripts do Sistema

Este documento descreve todos os scripts presentes na pasta `scripts/` do sistema de Ouvidoria, explicando a funcionalidade de cada um.

---

## Scripts de Inicialização

### iniciar_sistema_completo.bat
Inicia o sistema completo (backend e frontend) em ambiente Windows. Verifica Node.js, instala dependências se necessário, encerra processos antigos e executa o sistema.

### iniciar_sistema_completo.ps1
Inicia backend, frontend e nginx em janelas separadas no PowerShell.

### iniciar_sistema_simples.ps1
Menu simples para iniciar chatbot, backend, frontend ou sistema completo via PowerShell.

### iniciar_sistema_corrigido.ps1
Menu de inicialização semelhante ao simples, mas com melhorias e opções para iniciar componentes separadamente ou juntos.

### iniciar_sistema.bat
Menu interativo em batch para iniciar chatbot, backend, frontend, sistema completo ou testar QR Code.

### iniciar_sistema.ps1
Inicia backend e frontend em janelas separadas no PowerShell, exibindo informações de acesso e logins de teste.

### iniciar_ouvadmin.bat
Compila o frontend, inicia backend e frontend em janelas separadas, útil para ambiente de administração.

### iniciar_backend.js
Script Node.js para iniciar o backend e monitorar seu encerramento.

### iniciar_whatsapp.js
Inicia o chatbot WhatsApp carregando o arquivo principal `chat.js`.

### iniciar_sistema_completo.js
Script Node.js para iniciar o sistema completo via JavaScript.

---

## Scripts de Execução e Utilitários

### executar_sistema_completo.ps1
Executa o sistema completo no PowerShell, instala dependências, encerra processos antigos, inicia backend e frontend, e exibe informações de acesso.

### executar_sistema_completo.bat
Executa o sistema completo em batch, instala dependências, encerra processos antigos, inicia backend e frontend, e exibe informações de acesso.

### mover_estrutura_projeto.ps1
Organiza a estrutura do projeto, movendo arquivos e pastas para os diretórios corretos (backend, scripts, nginx, docs).

### cadastrar_master.js
Cadastra o usuário master no banco de dados SQLite, útil para configuração inicial do sistema.

---

## Scripts de Encerramento

### fechar_sistema_completo.ps1
Encerra todos os processos do sistema (Node.js, backend, frontend, janelas do sistema) no PowerShell.

### fechar_sistema_completo.bat
Encerra todos os processos do sistema (Node.js, backend, frontend, janelas do sistema) em batch.

### fechar_sistema.ps1
Encerra apenas backend, frontend e processos Node.js.

---

## Scripts de Nginx

### iniciar_nginx_manual.ps1
Script interativo para iniciar o Nginx manualmente, testando configuração, verificando porta 80 e exibindo status.

### preparar_nginx.ps1
Prepara o ambiente do Nginx, criando diretórios necessários, copiando configuração e testando.

### configurar_nginx.ps1
Copia configuração, testa e inicia o Nginx.

### testar_nginx.ps1
Testa a instalação, configuração e funcionamento do Nginx.

### verificar_nginx.ps1
Verifica se o Nginx está instalado, configurado, rodando e se a porta 80 está em uso.

---

## Scripts de WhatsApp

### test_qr.js
Testa a geração de QR Code para autenticação do WhatsApp Web.

### gerar_qr.js
Força a geração de um novo QR Code para autenticação do WhatsApp, removendo sessões antigas.

---

## Observações
- Todos os scripts devem ser executados a partir da raiz do projeto ou conforme instruções específicas.
- Scripts PowerShell (.ps1) devem ser executados com permissões adequadas.
- Scripts batch (.bat) são para uso em ambiente Windows.
- Scripts JavaScript (.js) requerem Node.js instalado.

---

**Atualize este documento sempre que novos scripts forem adicionados ou modificados.** 