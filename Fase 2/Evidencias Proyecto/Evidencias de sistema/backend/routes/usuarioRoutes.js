const express = require("express");
const {
  registrarUsuario,
  loginUsuario,
  solicitarCodigoReseteo,
  verificarCodigoReseteo,
  actualizarPasswordConCodigo,
} = require("../controllers/usuarioController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/registrar", registrarUsuario);

router.post("/login", loginUsuario);

router.post("/solicitar-codigo", authMiddleware, solicitarCodigoReseteo);

router.post("/verificar-codigo", authMiddleware, verificarCodigoReseteo);

router.put("/actualizar-password", authMiddleware, actualizarPasswordConCodigo);

module.exports = router;
