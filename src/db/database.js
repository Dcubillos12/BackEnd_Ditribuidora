const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const projectRoot = path.resolve(__dirname, '..', '..');
require('dotenv').config({ path: path.join(projectRoot, '.env') });

const configuredPath = process.env.DB_FILE || './data/app.db';
const dbPath = path.isAbsolute(configuredPath)
  ? configuredPath
  : path.resolve(projectRoot, configuredPath);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error('Error al conectar con SQLite:', error.message);
    return;
  }
  console.log(`Base de datos SQLite conectada en: ${dbPath}`);
});

const CREATE_TABLE_PRODUCTOS = `
  CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    precio REAL NOT NULL,
    stock INTEGER NOT NULL,
    codigo_barras TEXT UNIQUE NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

const dbReady = new Promise((resolve, reject) => {
  db.run(CREATE_TABLE_PRODUCTOS, (error) => {
    if (error) {
      console.error('Error al inicializar la tabla productos:', error.message);
      reject(error);
      return;
    }
    console.log('Tabla "productos" lista.');
    resolve();
  });
});

module.exports = {
  db,
  dbReady,
  dbPath
};
