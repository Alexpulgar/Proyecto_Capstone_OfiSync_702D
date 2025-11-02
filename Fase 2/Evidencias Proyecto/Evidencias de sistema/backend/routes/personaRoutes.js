const express = require("express");
const { obtenerPersonas, agregarPersona , actualizarPersonaParcial,obtenerPersonaPorRut ,eliminarPersona, getPersonaById } = require("../controllers/personaController");
const router = express.Router();

router.get("/", obtenerPersonas);

router.post("/agregar" ,agregarPersona)

router.get('/rut/:rut', obtenerPersonaPorRut)

router.put('/:id', actualizarPersonaParcial);

router.delete("/:id", eliminarPersona);

router.get("/:id", getPersonaById);

module.exports = router;
