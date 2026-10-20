# Diego Andres Cubillos
# Hector Velasco


## UNIVERSIDAD INCCA DE COLOMBIA
## INGENIERIA DE SOFWARE 3
## Guia_Avance_Backend_IngSoftware3

# Distribuidora La Española - Backend API REST

API REST para la gestión del inventario de **Distribuidora La Española**, una distribuidora especializada en productos de aseo, limpieza e higiene del hogar: detergentes, jabones, traperos, escobas, desinfectantes y artículos similares.

El sistema **no maneja alimentos ni comestibles**. Por esa razón, las categorías de productos están restringidas y cualquier intento de registrar un producto alimenticio es rechazado con `400 Bad Request`.

## Tecnologías

- Node.js
- Express
- SQLite (`sqlite3`)
- dotenv
- cors
- nodemon (desarrollo)

## Arquitectura por capas

```text
src/
├── app.js                         # Servidor Express, middlewares globales y manejo de errores
├── db/
│   └── database.js                # Conexión a SQLite e inicialización de la tabla productos
├── routes/
│   └── productos.routes.js        # Definición de endpoints
├── controllers/
│   └── productos.controller.js    # Orquestación HTTP (req, res, códigos de estado)
├── services/
│   └── productos.service.js       # Reglas de negocio y validaciones
└── repositories/
    └── productos.repository.js    # Consultas SQL parametrizadas
```

La base de datos se crea automáticamente en `data/app.db` cuando el servidor arranca.

## Requisitos

- Node.js 18 o superior
- npm

## Instalación y ejecución

```bash
cd distribuidora-la-espanola-backend
npm install
npm run dev
```

Para ejecutar sin nodemon:

```bash
npm start
```

El servidor queda disponible en `http://localhost:3000`.

### Variables de entorno

El archivo `.env` incluido contiene:

```env
PORT=3000
DB_FILE=./data/app.db
```

- `PORT`: puerto del servidor HTTP.
- `DB_FILE`: ruta del archivo SQLite, relativa a la raíz del proyecto.

## Base de datos

Tabla `productos`:

| Columna | Tipo | Restricciones |
| :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `nombre` | TEXT | NOT NULL |
| `categoria` | TEXT | NOT NULL |
| `precio` | REAL | NOT NULL |
| `stock` | INTEGER | NOT NULL |
| `codigo_barras` | TEXT | UNIQUE NOT NULL |
| `creado_en` | DATETIME | DEFAULT CURRENT_TIMESTAMP |

## Endpoints

| Operación | Método | Endpoint | Éxito | Error |
| :--- | :--- | :--- | :--- | :--- |
| Listar todos | `GET` | `/api/productos` | `200 OK` | `500 Internal Server Error` |
| Consultar por ID | `GET` | `/api/productos/:id` | `200 OK` | `404 Not Found` |
| Crear producto | `POST` | `/api/productos` | `201 Created` | `400 Bad Request` |
| Actualizar producto | `PUT` | `/api/productos/:id` | `200 OK` | `400 Bad Request` / `404 Not Found` |
| Eliminar producto | `DELETE` | `/api/productos/:id` | `204 No Content` | `404 Not Found` |

Formato estándar de error:

```json
{
  "error": "Mensaje explicativo del error"
}
```

## Reglas de negocio

1. En `POST` y `PUT` son obligatorios todos los campos: `nombre`, `categoria`, `precio`, `stock` y `codigo_barras`.
2. Solo se permiten estas categorías:
   - `Aseo del Hogar`
   - `Cuidado Personal`
   - `Lavandería`
   - `Utensilios de Limpieza`
   - `Desinfección`
3. El precio debe ser un número mayor que `0`.
4. El stock debe ser un número entero mayor o igual que `0`.
5. El `codigo_barras` no puede repetirse entre productos.
6. Las operaciones `GET` por ID, `PUT` y `DELETE` sobre IDs inexistentes responden `404 Not Found`.
7. `PUT` reemplaza el producto completo, por lo que también exige todos los campos.

## Pruebas manuales con cURL

Los siguientes comandos están pensados para **Git Bash**, **WSL** o terminales tipo Unix. En PowerShell o `cmd` cambia las comillas simples por comillas dobles y escapa las comillas internas del JSON.

### 1. Camino feliz: crear producto (`201 Created`)

```bash
curl -i -X POST http://localhost:3000/api/productos -H "Content-Type: application/json" -d '{"nombre":"Detergente Líquido 1L","categoria":"Aseo del Hogar","precio":8500,"stock":25,"codigo_barras":"7701234567890"}'
```

Respuesta esperada:

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "id": 1,
  "nombre": "Detergente Líquido 1L",
  "categoria": "Aseo del Hogar",
  "precio": 8500,
  "stock": 25,
  "codigo_barras": "7701234567890",
  "creado_en": "2026-10-20 17:00:00"
}
```

Si repites el comando, recibirás `400 Bad Request` porque el `codigo_barras` ya existe. Cambia el código para volver a probar el camino feliz.

### 2. Error de validación: categoría no permitida (`400 Bad Request`)

```bash
curl -i -X POST http://localhost:3000/api/productos -H "Content-Type: application/json" -d '{"nombre":"Arroz Premium","categoria":"Alimentos","precio":5000,"stock":10,"codigo_barras":"7709876543210"}'
```

Respuesta esperada:

```json
{
  "error": "Categoría no válida. Categorías permitidas: Aseo del Hogar, Cuidado Personal, Lavandería, Utensilios de Limpieza, Desinfección. No se permiten alimentos ni comestibles."
}
```

### 3. Recurso no encontrado (`404 Not Found`)

```bash
curl -i http://localhost:3000/api/productos/999999
```

Respuesta esperada:

```json
{
  "error": "Producto no encontrado."
}
```

### Consultas adicionales

```bash
# Listar todos los productos
curl -i http://localhost:3000/api/productos

# Consultar un producto existente
curl -i http://localhost:3000/api/productos/1
```
