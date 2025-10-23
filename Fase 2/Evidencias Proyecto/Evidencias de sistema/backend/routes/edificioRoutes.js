const express = require("express");
const { agregarEdificio , obtenerEdificios, 
        actualizarEdificio,obtenerEdificioPorId,
        eliminarEdificio} = require("../controllers/edificioController");
const router = express.Router();

router.get("/", obtenerEdificios);
router.post("/agregar", agregarEdificio)
router.put('/:id', actualizarEdificio);

router.get('/:id', obtenerEdificioPorId);
router.delete('/:id', eliminarEdificio);

module.exports = router;