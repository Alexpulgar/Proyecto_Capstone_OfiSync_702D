const express = require("express");
const { buscarOficinas, obtenerOficinas, agregarOficina } = require("../controllers/oficinaController");
const router = express.Router();

router.get("/buscar", buscarOficinas);
router.get("/", obtenerOficinas);

router.post("/agregar", agregarOficina);



module.exports = router;