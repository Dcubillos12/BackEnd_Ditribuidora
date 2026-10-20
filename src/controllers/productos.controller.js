const service = require('../services/productos.service');

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

const listar = asyncHandler(async (req, res) => {
  const productos = await service.listar();
  res.status(200).json(productos);
});

const obtenerPorId = asyncHandler(async (req, res) => {
  const producto = await service.obtenerPorId(req.params.id);
  res.status(200).json(producto);
});

const crear = asyncHandler(async (req, res) => {
  const producto = await service.crear(req.body);
  res.status(201).json(producto);
});

const actualizar = asyncHandler(async (req, res) => {
  const producto = await service.actualizar(req.params.id, req.body);
  res.status(200).json(producto);
});

const eliminar = asyncHandler(async (req, res) => {
  await service.eliminar(req.params.id);
  res.status(204).send();
});

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
