const { db } = require('../db/database');

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows);
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row);
    });
  });

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function handleResult(error) {
      if (error) {
        reject(error);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

class ProductosRepository {
  findAll() {
    return all('SELECT * FROM productos ORDER BY id ASC');
  }

  findById(id) {
    return get('SELECT * FROM productos WHERE id = ?', [id]);
  }

  findByCodigoBarras(codigoBarras) {
    return get('SELECT * FROM productos WHERE codigo_barras = ?', [codigoBarras]);
  }

  async create(producto) {
    const { nombre, categoria, precio, stock, codigo_barras: codigoBarras } = producto;
    const result = await run(
      'INSERT INTO productos (nombre, categoria, precio, stock, codigo_barras) VALUES (?, ?, ?, ?, ?)',
      [nombre, categoria, precio, stock, codigoBarras]
    );
    return this.findById(result.lastID);
  }

  async update(id, producto) {
    const { nombre, categoria, precio, stock, codigo_barras: codigoBarras } = producto;
    await run(
      'UPDATE productos SET nombre = ?, categoria = ?, precio = ?, stock = ?, codigo_barras = ? WHERE id = ?',
      [nombre, categoria, precio, stock, codigoBarras, id]
    );
    return this.findById(id);
  }

  async remove(id) {
    const result = await run('DELETE FROM productos WHERE id = ?', [id]);
    return result.changes;
  }
}

module.exports = new ProductosRepository();
