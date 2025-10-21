const express = require("express")
const router = express.Router();
const {
    agregarInsumo,
    obtenerInsumos,
    obtenerInsumoPorId,
    actualizarInsumo,
    eliminarInsumo
} = require("../controllers/insumoController.js");

router.post("/", agregarInsumo);
router.get("/", obtenerInsumos);
router.get("/:id", obtenerInsumoPorId);
router.post("/:id", actualizarInsumo);
router.delete("/:id", eliminarInsumo);

module.exports = router;