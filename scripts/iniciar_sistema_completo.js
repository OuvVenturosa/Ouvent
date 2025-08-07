// iniciar_sistema_completo.js
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando Sistema Completo...');
console.log('=====================================');

// Função para aguardar
const aguardar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para iniciar processo
const iniciarProcesso = (comando, args, nome) => {
    console.log(`📦 Iniciando ${nome}...`);
    const processo = spawn(comando, args, {
        stdio: 'inherit',
        cwd: __dirname
    });

    processo.on('error', (error) => {
        console.error(`❌ Erro ao iniciar ${nome}:`, error);
    });

    processo.on('exit', (code) => {
        console.log(`🛑 ${nome} encerrado com código: ${code}`);
    });

    return processo;
};

// Inicia o backend
console.log('[1/3] Iniciando Backend...');
const backend = iniciarProcesso('node', ['backend.js'], 'Backend');

// Aguarda 5 segundos para o backend inicializar
console.log('[2/3] Aguardando inicialização do backend...');
await aguardar(5000);

// Inicia o chat
console.log('[3/3] Iniciando Chat WhatsApp...');
const chat = iniciarProcesso('node', ['chat.js'], 'Chat WhatsApp');

console.log('');
console.log('======================================');
console.log('    SISTEMA INICIADO COM SUCESSO!');
console.log('======================================');
console.log('');
console.log('URLs de Acesso:');
console.log('Backend: http://localhost:3001');
console.log('URL Principal: http://ouvadmin/venturosa');
console.log('');
console.log('PARA FINALIZAR O SISTEMA:');
console.log('Pressione Ctrl+C ou feche os terminais');
console.log('');

// Tratamento de sinais para encerrar graciosamente
process.on('SIGINT', async () => {
    console.log('\n🛑 Encerrando sistema...');
    backend.kill('SIGINT');
    chat.kill('SIGINT');
    await aguardar(2000);
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Encerrando sistema...');
    backend.kill('SIGTERM');
    chat.kill('SIGTERM');
    await aguardar(2000);
    process.exit(0);
}); 