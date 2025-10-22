const express = require("express");
const { 
  buscarOficinas, 
  obtenerOficinas, 
  agregarOficina,
  getOficinasByPiso,  // <--- IMPORTAR
  getOficinaById,     // <--- IMPORTAR
  actualizarOficina   // <--- IMPORTAR
} = require("../controllers/oficinaController");
const router = express.Router();

router.get("/buscar", buscarOficinas);
router.get("/", obtenerOficinas);

router.post("/agregar", agregarOficina);

router.get("/piso/:pisoId", getOficinasByPiso);

// Ruta para obtener una oficina por su ID
router.get("/:id", getOficinaById);

// Ruta para actualizar una oficina por su ID
router.put("/:id", actualizarOficina);



module.exports = router;