
const express = require('express');
const router = express.Router();
const insumoController = require('../controllers/insumoController');
const {
  validateInsumo,
} = require('../logic/insumo/insumoValidator'); 

// Rutas para Insumos
router.get('/', insumoController.getAllInsumos);
router.get('/:id', insumoController.getInsumoById);
router.post('/', validateInsumo, insumoController.createInsumo); 
router.put('/:id', validateInsumo, insumoController.updateInsumo); 
router.delete('/:id', insumoController.deleteInsumo);

module.exports = router;