const express = require("express");
const router = express.Router();
const {
    crearEntrada,
    obtenerEntradas,
    actualizarEntrada,
    borrarEntrada
} = require("../controllers/bitacoraController");

const { validateBitacora } = require("../logic/bitacora/bitacoraValidator");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRoleMiddleware");


const rolesAdmin = ['admin', 'conserje'];

//Rutas publicas
router.get("/", authMiddleware, checkRole(rolesAdmin), obtenerEntradas);

// --- PASO 3: Usamos el nuevo validador 'validateBitacora' ---
// (Se ejecuta DESPUÉS de los roles y ANTES del controlador)
router.post("/", authMiddleware, checkRole(rolesAdmin), validateBitacora, crearEntrada);

//Rutas protegidas por rol
router.put("/:id", authMiddleware, checkRole(rolesAdmin), validateBitacora, actualizarEntrada);
router.delete("/:id", authMiddleware, checkRole(rolesAdmin), borrarEntrada);

module.exports = router;