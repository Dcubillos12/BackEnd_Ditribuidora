const repository = require('../repositories/productos.repository');

const CATEGORIAS_PERMITIDAS = [
  'Aseo del Hogar',
  'Cuidado Personal',
  'Lavandería',
  'Utensilios de Limpieza',
  'Desinfección'
];

const CAMPOS_OBLIGATORIOS = ['nombre', 'categoria', 'precio', 'stock', 'codigo_barras'];

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const esVacio = (valor) =>
  valor === undefined ||
  valor === null ||
  (typeof valor === 'string' && valor.trim() === '');

const convertirNumero = (valor) => {
  if (typeof valor === 'number') {
    return valor;
  }
  if (typeof valor === 'string' && valor.trim() !== '') {
    return Number(valor);
  }
  return NaN;
};

const esConflictoDeCodigo = (error) =>
  Boolean(
    error &&
      typeof error.message === 'string' &&
      error.message.includes('UNIQUE constraint failed: productos.codigo_barras')
  );

const validarId = (id) => {
  const numero = Number(id);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ApiError(404, 'Producto no encontrado.');
  }
  return numero;
};

const validarProducto = (datos) => {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw new ApiError(400, 'El cuerpo de la solicitud debe ser un objeto JSON.');
  }

  const faltantes = CAMPOS_OBLIGATORIOS.filter((campo) => esVacio(datos[campo]));
  if (faltantes.length > 0) {
    throw new ApiError(
      400,
      `Los siguientes campos son obligatorios: ${faltantes.join(', ')}.`
    );
  }

  if (typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
    throw new ApiError(400, 'El nombre es obligatorio y debe ser un texto.');
  }

  if (typeof datos.categoria !== 'string' || datos.categoria.trim() === '') {
    throw new ApiError(400, 'La categoría es obligatoria y debe ser un texto.');
  }

  const categoria = datos.categoria.trim();
  if (!CATEGORIAS_PERMITIDAS.includes(categoria)) {
    throw new ApiError(
      400,
      `Categoría no válida. Categorías permitidas: ${CATEGORIAS_PERMITIDAS.join(', ')}. No se permiten alimentos ni comestibles.`
    );
  }

  const precio = convertirNumero(datos.precio);
  if (!Number.isFinite(precio) || precio <= 0) {
    throw new ApiError(400, 'El precio debe ser un número mayor que 0.');
  }

  const stock = convertirNumero(datos.stock);
  if (!Number.isInteger(stock) || stock < 0) {
    throw new ApiError(400, 'El stock debe ser un número entero mayor o igual que 0.');
  }

  if (typeof datos.codigo_barras !== 'string' || datos.codigo_barras.trim() === '') {
    throw new ApiError(400, 'El código de barras es obligatorio y debe ser un texto.');
  }

  return {
    nombre: datos.nombre.trim(),
    categoria,
    precio,
    stock,
    codigo_barras: datos.codigo_barras.trim()
  };
};

class ProductosService {
  listar() {
    return repository.findAll();
  }

  async obtenerPorId(id) {
    const productoId = validarId(id);
    const producto = await repository.findById(productoId);

    if (!producto) {
      throw new ApiError(404, 'Producto no encontrado.');
    }

    return producto;
  }

  async crear(datos) {
    const producto = validarProducto(datos);
    const existente = await repository.findByCodigoBarras(producto.codigo_barras);

    if (existente) {
      throw new ApiError(
        400,
        `Ya existe un producto con el código de barras "${producto.codigo_barras}".`
      );
    }

    try {
      return await repository.create(producto);
    } catch (error) {
      if (esConflictoDeCodigo(error)) {
        throw new ApiError(
          400,
          `Ya existe un producto con el código de barras "${producto.codigo_barras}".`
        );
      }
      throw error;
    }
  }

  async actualizar(id, datos) {
    const productoId = validarId(id);
    const productoActual = await repository.findById(productoId);

    if (!productoActual) {
      throw new ApiError(404, 'Producto no encontrado.');
    }

    const producto = validarProducto(datos);
    const duplicado = await repository.findByCodigoBarras(producto.codigo_barras);

    if (duplicado && duplicado.id !== productoId) {
      throw new ApiError(
        400,
        `Ya existe un producto con el código de barras "${producto.codigo_barras}".`
      );
    }

    try {
      return await repository.update(productoId, producto);
    } catch (error) {
      if (esConflictoDeCodigo(error)) {
        throw new ApiError(
          400,
          `Ya existe un producto con el código de barras "${producto.codigo_barras}".`
        );
      }
      throw error;
    }
  }

  async eliminar(id) {
    const productoId = validarId(id);
    const producto = await repository.findById(productoId);

    if (!producto) {
      throw new ApiError(404, 'Producto no encontrado.');
    }

    await repository.remove(productoId);
  }
}

module.exports = new ProductosService();
