// Importa la lógica desde su nueva ubicación
const insumoLogic = require('../logic/insumo/insumoLogic');

// GET /api/insumos
const getAllInsumos = async (req, res) => {
  try {
    const insumos = await insumoLogic.obtenerTodos();
    res.status(200).json(insumos);
  } catch (error) {
    console.error('Error en insumoController.getAllInsumos:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/insumos/:id
const getInsumoById = async (req, res) => {
  try {
    const { id } = req.params;
    const insumo = await insumoLogic.obtenerPorId(id);
    res.status(200).json(insumo);
  } catch (error) {
    console.error('Error en insumoController.getInsumoById:', error);
    if (error.message.includes('Insumo no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

// POST /api/insumos
const createInsumo = async (req, res) => {
  try {
    const nuevoInsumo = await insumoLogic.crear(req.body);
    res.status(201).json(nuevoInsumo);
  } catch (error) {
    console.error('Error en insumoController.createInsumo:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/insumos/:id
const updateInsumo = async (req, res) => {
  try {
    const { id } = req.params;
    const insumoActualizado = await insumoLogic.actualizar(id, req.body);
    res.status(200).json(insumoActualizado);
  } catch (error) {
    console.error('Error en insumoController.updateInsumo:', error);
    if (error.message.includes('Insumo no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/insumos/:id
const deleteInsumo = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await insumoLogic.eliminar(id);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error en insumoController.deleteInsumo:', error);
    if (error.message.includes('Insumo no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllInsumos,
  getInsumoById,
  createInsumo,
  updateInsumo,
  deleteInsumo,
};