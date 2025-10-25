const express = require("express");
const { registrarUsuario,loginUsuario } = require("../controllers/usuarioController");
const router = express.Router();

// Ruta para el registro
router.post("/registrar", registrarUsuario);

router.post("/login", loginUsuario);

// Aquí podrías añadir más rutas en el futuro (ej: login, obtener usuarios, etc.)

module.exports = router;