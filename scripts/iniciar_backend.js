// iniciar_backend.js
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando Backend...');

// Inicia o backend
const backend = spawn('node', ['backend.js'], {
    stdio: 'inherit',
    cwd: __dirname
});

backend.on('error', (error) => {
    console.error('❌ Erro ao iniciar backend:', error);
});

backend.on('exit', (code) => {
    console.log(`Backend encerrado com código: ${code}`);
});

// Aguarda 3 segundos para o backend inicializar
setTimeout(() => {
    console.log('✅ Backend iniciado em http://localhost:3001');
}, 3000);

// Tratamento de sinais para encerrar graciosamente
process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando backend...');
    backend.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Encerrando backend...');
    backend.kill('SIGTERM');
    process.exit(0);
}); 