const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Conectar ao banco de dados
const db = new sqlite3.Database('../database/ouvidoria.db');

// Dados do usuário master
const masterData = {
  cpf: '07971378408', // CPF do master (altere conforme necessário)
  telefone: '558791215280',
  email: 'ouvidoria.venturosa@gmail.com',
  secretaria: 'Ouvidoria Geral',
  senha: 'Ouv#ven2025_' // Senha inicial (será alterada no primeiro login)
};

// Função para cadastrar o master
function cadastrarMaster() {
  const senha_hash = bcrypt.hashSync(masterData.senha, 10);
  
  db.run(
    'INSERT OR REPLACE INTO usuarios (cpf, telefone, email, senha_hash, secretaria, is_master) VALUES (?, ?, ?, ?, ?, 1)',
    [masterData.cpf, masterData.telefone, masterData.email, senha_hash, masterData.secretaria],
    function(err) {
      if (err) {
        console.error('Erro ao cadastrar master:', err);
      } else {
        console.log('✅ Master cadastrado com sucesso!');
        console.log('📋 Dados de acesso:');
        console.log(`   CPF: ${masterData.cpf}`);
        console.log(`   Senha: ${masterData.senha}`);
        console.log(`   Email: ${masterData.email}`);
        console.log(`   Secretaria: ${masterData.secretaria}`);
        console.log('\n⚠️  IMPORTANTE: Altere a senha no primeiro login!');
      }
      db.close();
    }
  );
}

// Executar cadastro
console.log('🔧 Cadastrando usuário master...');
cadastrarMaster(); 