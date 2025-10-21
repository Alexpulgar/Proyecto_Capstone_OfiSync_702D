const express = require("express");
const { agregarEdificio , obtenerEdificios, 
        actualizarEdificio,obtenerEdificioPorId} = require("../controllers/edificioController");
const router = express.Router();

router.get("/", obtenerEdificios);
router.post("/agregar", agregarEdificio)
router.put('/:id', actualizarEdificio);

router.get('/:id', obtenerEdificioPorId);

module.exports = router;