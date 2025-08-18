/**
 * Conexão com o banco de dados SQLite
 * Gerencia a conexão e operações com o banco de dados
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Configurar caminho do banco de dados
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/ouvidoria.db'
  : path.join(__dirname, '..', '..', '..', 'backend', 'ouvidoria.db');

// Verificar se o diretório existe
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Criar conexão com o banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados SQLite');
  }
});

/**
 * Executa uma consulta SQL que retorna múltiplas linhas
 * @param {string} sql Consulta SQL
 * @param {Array} params Parâmetros da consulta
 * @returns {Promise<Array>} Resultado da consulta
 */
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('❌ Erro na consulta SQL:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Executa uma consulta SQL que retorna uma única linha
 * @param {string} sql Consulta SQL
 * @param {Array} params Parâmetros da consulta
 * @returns {Promise<Object>} Resultado da consulta
 */
function queryOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('❌ Erro na consulta SQL:', err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Executa uma consulta SQL que não retorna resultados
 * @param {string} sql Consulta SQL
 * @param {Array} params Parâmetros da consulta
 * @returns {Promise<void>} Resultado da operação
 */
function execute(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('❌ Erro na execução SQL:', err.message);
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

module.exports = {
  db,
  query,
  queryOne,
  execute
};