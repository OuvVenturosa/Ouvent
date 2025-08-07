# 📋 Instruções para Cadastro de Usuários

## 🎯 Objetivo
Este documento explica como cadastrar responsáveis pelas secretarias e o ouvidor master no sistema de Ouvidoria Municipal.

## 👤 Usuário Master (Ouvidor Geral)

### Dados de Acesso Inicial
- **CPF:** 12345678901
- **Senha:** admin123
- **Email:** ouvidoria.venturosa@gmail.com
- **Secretaria:** Ouvidoria Geral
- **Tipo:** Master (Acesso total)

### Como Acessar
1. Acesse o sistema: `http://ouvadmin/venturosa`
2. Faça login com os dados acima
3. **IMPORTANTE:** Altere a senha no primeiro acesso

## 🏛️ Secretarias Disponíveis

### Lista Completa de Secretarias
1. **Secretaria de Desenvolvimento Rural e Meio Ambiente**
2. **Secretaria de Assistência Social**
3. **Secretaria de Educação e Esporte**
4. **Secretaria de Infraestrutura e Segurança Pública**
5. **Secretaria de Saúde e Direitos da Mulher**
6. **Hospital e Maternidade Justa Maria Bezerra**
7. **Programa Mulher Segura**
8. **Secretaria de Finanças - Setor de Tributos**
9. **Secretaria de Administração - Servidores Municipais**
10. **Ouvidoria Geral**

## 📝 Como Cadastrar Responsáveis

### Método 1: Via Interface Web (Recomendado)

1. **Faça login como Master**
   - CPF: 12345678901
   - Senha: admin123

2. **Acesse o Gerenciamento de Usuários**
   - Clique no botão "👥 Gerenciar Usuários"

3. **Preencha os dados do responsável**
   - **CPF:** Apenas números (11 dígitos)
   - **Telefone:** Formato: 558788290579
   - **Email:** Email válido para receber notificações
   - **Secretaria:** Selecione da lista
   - **Tipo:** Marque se for Master (geralmente não)

4. **Clique em "Cadastrar"**
   - Uma senha será gerada automaticamente
   - A senha será enviada por email

### Método 2: Via Script (Para Administradores)

1. **Edite o arquivo `cadastrar_master.js`**
2. **Modifique os dados conforme necessário**
3. **Execute o script:**
   ```bash
   node cadastrar_master.js
   ```

## 🔧 Funcionalidades do Sistema

### Para Usuários Master
- ✅ Cadastrar responsáveis de secretarias
- ✅ Editar dados de usuários
- ✅ Excluir usuários
- ✅ Redefinir senhas
- ✅ Visualizar todas as solicitações
- ✅ Verificar alertas de prazo
- ✅ Resolver solicitações encaminhadas
- ✅ Gerar relatórios

### Para Responsáveis de Secretarias
- ✅ Visualizar solicitações da secretaria
- ✅ Responder solicitações
- ✅ Atualizar status
- ✅ Adicionar comentários
- ✅ Encaminhar ao ouvidor geral

## 📧 Notificações por Email

### Configuração Atual
- **Servidor:** SMTP Gmail
- **Email:** ouvidoria.venturosa@gmail.com
- **Função:** Envio automático de senhas e notificações

### Tipos de Notificação
1. **Nova senha gerada**
2. **Redefinição de senha**
3. **Alertas de prazo**
4. **Solicitações encaminhadas**

## 🔒 Segurança

### Boas Práticas
1. **Altere a senha inicial** no primeiro login
2. **Use senhas fortes** (mínimo 8 caracteres)
3. **Não compartilhe credenciais**
4. **Faça logout** ao sair do sistema
5. **Monitore acessos** regularmente

### Recuperação de Senha
- Use a função "Esqueci a senha" na tela de login
- Nova senha será enviada por email
- Altere a senha no próximo login

## 📊 Monitoramento

### Logs do Sistema
- Todas as ações são registradas
- Histórico de alterações mantido
- Relatórios de atividade disponíveis

### Alertas Automáticos
- Prazos vencidos
- Prazos que vencem hoje
- Prazos que vencem amanhã

## 🆘 Suporte

### Em caso de problemas:
1. **Verifique a conexão** com o banco de dados
2. **Confirme as credenciais** de email
3. **Teste o login** com dados corretos
4. **Consulte os logs** do sistema

### Contatos
- **Email:** ouvidoria.venturosa@gmail.com
- **Telefone:** 558788290579

---

**⚠️ IMPORTANTE:** Mantenha as credenciais seguras e altere as senhas iniciais! 