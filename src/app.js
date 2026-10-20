const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const productosRoutes = require('./routes/productos.routes');
const { dbReady } = require('./db/database');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/productos', productosRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'El cuerpo de la solicitud no es un JSON válido.' });
    return;
  }

  const status = error.status || 500;

  if (status >= 500) {
    console.error('Error interno no controlado:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
    return;
  }

  res.status(status).json({ error: error.message });
});

if (require.main === module) {
  dbReady
    .then(() => {
      const server = app.listen(PORT, () => {
        console.log(`Servidor escuchando en http://localhost:${PORT}`);
        console.log(`API de productos disponible en http://localhost:${PORT}/api/productos`);
      });

      server.on('error', (error) => {
        console.error('Error al iniciar el servidor:', error.message);
        process.exit(1);
      });
    })
    .catch((error) => {
      console.error('No se pudo inicializar la base de datos:', error.message);
      process.exit(1);
    });
}

module.exports = app;
