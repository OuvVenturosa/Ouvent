# 🔄 Comandos Git para o Sistema de Ouvidoria

Este guia contém os comandos Git mais utilizados para o desenvolvimento e manutenção do Sistema de Ouvidoria Municipal. Atualizado com as práticas mais recentes do Git e GitHub.

## 🚀 Comandos Básicos

### Inicialização e Configuração

```bash
# Inicializar um repositório Git
git init

# Inicializar um repositório Git com branch principal chamada 'main' (recomendado)
git init -b main

# Inicializar um repositório Git em um diretório específico
git init /caminho/para/repositorio

# Inicializar um repositório Git com template específico
git init --template=/caminho/para/template

# Configurar nome de usuário
git config --global user.name "Seu Nome"

# Configurar email
git config --global user.email "seu.email@exemplo.com"

# Configurar editor padrão
git config --global core.editor "code --wait"

# Configurar branch padrão para 'main'
git config --global init.defaultBranch main

# Verificar configurações
git config --list
```

### Operações de Commit

```bash
# Verificar status das alterações
git status

# Verificar status em formato curto
git status -s

# Adicionar arquivos específicos para commit
git add nome_do_arquivo.js

# Adicionar todos os arquivos modificados
git add .

# Adicionar arquivos por padrão
git add *.js    # Adiciona todos os arquivos .js

# Adicionar arquivos interativamente (selecionar partes específicas)
git add -p

# Realizar commit com mensagem
git commit -m "Descrição clara da alteração realizada"

# IMPORTANTE: Não existe 'git add -m', o correto é usar 'git commit -m'
# O comando 'git add' apenas prepara os arquivos para o commit

# Adicionar e commitar em um único comando (apenas para arquivos já rastreados)
git commit -am "Descrição da alteração"

# Alterar a mensagem do último commit (antes de enviar para o repositório remoto)
git commit --amend -m "Nova mensagem para o último commit"

# Adicionar mais alterações ao último commit (antes de enviar para o repositório remoto)
git add arquivo_esquecido.js
git commit --amend --no-edit    # Mantém a mesma mensagem de commit

# Criar commit vazio (útil para disparar CI/CD)
git commit --allow-empty -m "Trigger CI/CD pipeline"
```

### Boas Práticas para Mensagens de Commit

Utilize prefixos para categorizar seus commits:

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Alterações na documentação
- `style:` - Formatação, ponto e vírgula, etc; sem alteração de código
- `refactor:` - Refatoração de código
- `test:` - Adição ou correção de testes
- `chore:` - Atualizações de tarefas de build, configurações, etc

Exemplos:
```bash
git commit -m "feat: adiciona integração com WhatsApp"
git commit -m "fix: corrige erro na exibição de protocolos"
git commit -m "docs: atualiza README com instruções de deploy"
```

## 🌿 Branches

```bash
# Listar branches
git branch

# Criar nova branch
git branch nome-da-branch

# Mudar para uma branch
git checkout nome-da-branch

# Criar e mudar para nova branch em um único comando
git checkout -b nome-da-branch

# Mesclar branch atual com outra branch
git merge nome-da-branch

# Excluir branch local
git branch -d nome-da-branch
```

## 🔄 Sincronização com Repositório Remoto

```bash
# Adicionar repositório remoto
git remote add origin https://github.com/usuario/repositorio.git

# Adicionar repositório remoto usando SSH (recomendado para desenvolvimento)
git remote add origin git@github.com:usuario/repositorio.git

# Listar repositórios remotos configurados
git remote -v

# Alterar URL do repositório remoto
git remote set-url origin https://github.com/usuario/novo-repositorio.git

# Enviar alterações para o repositório remoto
git push origin nome-da-branch

# Enviar branch local para o repositório remoto pela primeira vez (configura tracking)
git push -u origin nome-da-branch

# Enviar todas as branches locais para o remoto
git push --all origin

# Enviar todas as tags para o remoto
git push --tags origin

# Forçar push (use com cuidado - apenas quando necessário)
git push -f origin nome-da-branch

# Forçar push mais seguro (rejeita se alguém atualizou o remoto)
git push --force-with-lease origin nome-da-branch

# Baixar alterações do repositório remoto
git pull origin nome-da-branch

# Baixar alterações com rebase em vez de merge
git pull --rebase origin nome-da-branch

# Baixar alterações sem mesclar automaticamente
git fetch origin

# Clonar repositório
git clone https://github.com/usuario/repositorio.git

# Clonar repositório em um diretório específico
git clone https://github.com/usuario/repositorio.git nome-da-pasta

# Clonar apenas uma branch específica
git clone -b nome-da-branch --single-branch https://github.com/usuario/repositorio.git

# Clonar repositório de forma rasa (apenas commits recentes - mais rápido)
git clone --depth=1 https://github.com/usuario/repositorio.git
```

## 📋 Histórico e Logs

```bash
# Visualizar histórico de commits
git log

# Visualizar histórico resumido em uma linha
git log --oneline

# Visualizar histórico com gráfico
git log --graph --oneline --all

# Visualizar alterações em um arquivo específico
git log -p nome_do_arquivo.js
```

## ↩️ Desfazer Alterações

```bash
# Desfazer alterações em um arquivo não adicionado ao stage
git checkout -- nome_do_arquivo.js

# Remover arquivo do stage (mantém alterações no arquivo)
git reset HEAD nome_do_arquivo.js

# Desfazer último commit mantendo as alterações
git reset --soft HEAD~1

# Desfazer último commit descartando as alterações
git reset --hard HEAD~1

# Criar novo commit que desfaz alterações de um commit anterior
git revert ID_DO_COMMIT
```

## 🏷️ Tags

```bash
# Criar tag
git tag v1.0.0

# Criar tag anotada (recomendado)
git tag -a v1.0.0 -m "Versão 1.0.0 - Lançamento inicial"

# Listar tags
git tag

# Enviar tags para o repositório remoto
git push origin --tags
```

## 🧹 Manutenção

```bash
# Verificar integridade do repositório
git fsck

# Limpar arquivos não rastreados
git clean -fd

# Compactar repositório
git gc
```

## 🔍 Fluxo de Trabalho Recomendado

1. Sincronize com o repositório remoto: `git pull origin main`
2. Crie uma branch para sua tarefa: `git checkout -b feature/nova-funcionalidade`
3. Faça as alterações necessárias
4. Adicione os arquivos: `git add .`
5. Faça o commit: `git commit -m "feat: implementa nova funcionalidade"`
6. Envie para o repositório remoto: `git push -u origin feature/nova-funcionalidade`
7. Crie um Pull Request no GitHub
8. Após aprovação, faça o merge com a branch principal

## 🌐 GitHub e Funcionalidades Modernas

### Conectando um Projeto Existente ao GitHub

```bash
# 1. Inicialize o Git no seu projeto (se ainda não estiver inicializado)
git init

# 2. Adicione todos os arquivos ao stage
git add .

# 3. Faça o commit inicial
git commit -m "commit inicial"

# 4. Crie um novo repositório no GitHub (via navegador ou CLI)
# Via GitHub CLI:
gh repo create nome-do-repositorio --public

# 5. Adicione o repositório remoto
git remote add origin https://github.com/usuario/nome-do-repositorio.git

# 6. Envie seu código para o GitHub
git push -u origin main
```

### Configurando Atualizações Automáticas

Para configurar seu projeto para atualizar automaticamente após commits:

#### Método 1: GitHub Actions (Recomendado)

1. Crie a pasta `.github/workflows` no seu repositório
2. Adicione um arquivo de workflow (como `deploy.yml`) conforme os exemplos na seção de GitHub Actions
3. Faça commit e push dessas alterações para o GitHub
4. Configure os secrets necessários nas configurações do repositório
5. Agora, cada novo commit na branch principal acionará o workflow de deploy

#### Método 2: Webhooks

Você também pode configurar webhooks para acionar atualizações automáticas:

1. Acesse seu repositório no GitHub
2. Vá para "Settings" > "Webhooks" > "Add webhook"
3. Configure:
   - Payload URL: URL do seu servidor que receberá as notificações (ex: https://seu-servidor.com/webhook)
   - Content type: application/json
   - Secret: Uma senha secreta para validar as solicitações
   - Eventos: Selecione "Just the push event"
4. No seu servidor, crie um script que:
   - Valide a assinatura do webhook
   - Execute um pull do repositório
   - Execute os comandos de build/deploy necessários

Exemplo de script para receber webhook (Node.js):

```javascript
// webhook.js - Salve no seu servidor
const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');

const SECRET = 'seu_secret_configurado_no_github';
const REPO_PATH = '/caminho/para/seu/repositorio';

http.createServer((req, res) => {
  req.on('data', (chunk) => {
    const signature = req.headers['x-hub-signature'];
    const hmac = crypto.createHmac('sha1', SECRET);
    const digest = 'sha1=' + hmac.update(chunk).digest('hex');
    
    if (signature === digest) {
      // Executa o pull e deploy
      exec(`cd ${REPO_PATH} && git pull && npm install && npm run build`, 
        (error, stdout, stderr) => {
          console.log('Atualização automática executada!');
          console.log(stdout);
          if (error) console.error(error);
        });
      res.end('Webhook recebido com sucesso!');
    } else {
      res.end('Assinatura inválida');
    }
  });
}).listen(3000);
```

### Comandos Úteis do GitHub CLI

```bash
# Instalar GitHub CLI
# Windows (com Chocolatey)
choco install gh
# Windows (com winget)
winget install GitHub.cli

# Autenticar com GitHub CLI
gh auth login

# Criar um novo repositório no GitHub
gh repo create nome-do-repositorio --public

# Clonar seu repositório
gh repo clone usuario/repositorio

# Listar pull requests
gh pr list

# Criar um pull request
gh pr create --title "Título do PR" --body "Descrição do PR"

# Verificar status das Actions do GitHub
gh workflow list

# Executar um workflow manualmente
gh workflow run workflow-name.yml

# Ver logs de execução de workflow
gh run view <run-id>
```

### GitHub Actions e Integração Contínua

GitHub Actions permite automatizar fluxos de trabalho diretamente no GitHub, incluindo atualização automática após commits:

#### Configuração de Integração Contínua/Entrega Contínua (CI/CD)

1. Crie um diretório `.github/workflows` no seu repositório
2. Adicione arquivos YAML para definir seus workflows

#### Exemplo: Atualização Automática após Commit

Crie um arquivo `.github/workflows/deploy.yml` com o seguinte conteúdo:

```yaml
name: Atualização Automática

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configurar Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Instalar dependências
        run: npm ci
        
      - name: Executar testes
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy para servidor
        uses: easingthemes/ssh-deploy@main
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          ARGS: "-avz --delete"
          SOURCE: "dist/"
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: ${{ secrets.REMOTE_TARGET }}
```

#### Configuração de Secrets no GitHub

Para o workflow acima funcionar, você precisa configurar secrets no GitHub:

1. Acesse seu repositório no GitHub
2. Vá para "Settings" > "Secrets and variables" > "Actions"
3. Adicione os seguintes secrets:
   - `SSH_PRIVATE_KEY`: Sua chave SSH privada
   - `REMOTE_HOST`: Endereço do servidor (ex: exemplo.com)
   - `REMOTE_USER`: Usuário SSH (ex: usuario)
   - `REMOTE_TARGET`: Caminho de destino no servidor (ex: /var/www/html/)

#### Deploy Automático para Vercel

Para projetos que usam Vercel, crie um arquivo `.github/workflows/vercel-deploy.yml`:

```yaml
name: Deploy para Vercel

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Instalar Vercel CLI
        run: npm install -g vercel
        
      - name: Deploy para Vercel
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

Adicione o secret `VERCEL_TOKEN` nas configurações do repositório.

#### Deploy Automático para Netlify

Para projetos que usam Netlify, crie um arquivo `.github/workflows/netlify-deploy.yml`:

```yaml
name: Deploy para Netlify

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configurar Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Instalar dependências
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy para Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy do GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

Adicione os secrets `NETLIFY_AUTH_TOKEN` e `NETLIFY_SITE_ID` nas configurações do repositório.

#### Exemplo: Testes Automatizados

```yaml
name: Testes Automatizados

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Configurar Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Instalar dependências
        run: npm ci
      - name: Executar testes
        run: npm test
```

### GitHub Codespaces e Desenvolvimento Remoto

O GitHub Codespaces permite desenvolver diretamente no navegador ou no VS Code:

1. Acesse seu repositório no GitHub
2. Clique no botão "Code" e selecione "Open with Codespaces"
3. Crie um novo codespace ou selecione um existente
4. Configure seu ambiente com um arquivo `.devcontainer/devcontainer.json`

### GitHub Copilot

O GitHub Copilot é uma ferramenta de IA que ajuda a escrever código mais rapidamente:

1. Instale a extensão GitHub Copilot no VS Code
2. Ative sua assinatura do GitHub Copilot
3. Comece a codificar e receba sugestões inteligentes
4. Use comandos como `Ctrl+Enter` para ver sugestões alternativas

### GitHub Advanced Security

O GitHub oferece recursos avançados de segurança para proteger seu código:

1. **Dependabot**: Alertas e atualizações automáticas de dependências vulneráveis
2. **Code scanning**: Análise de código para identificar vulnerabilidades de segurança
3. **Secret scanning**: Detecção de credenciais e tokens expostos no código

Para ativar:
1. Acesse as configurações do repositório
2. Navegue até "Security & analysis"
3. Ative os recursos desejados

## 📚 Recursos Adicionais

- [Git - Documentação Oficial](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com/)
- [GitHub Skills](https://skills.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://danielkummer.github.io/git-flow-cheatsheet/)
- [GitHub CLI](https://cli.github.com/)
- [GitHub Actions](https://github.com/features/actions)
- [GitHub Codespaces](https://github.com/features/codespaces)
- [GitHub Copilot](https://github.com/features/copilot)
- [GitHub Advanced Security](https://github.com/features/security)