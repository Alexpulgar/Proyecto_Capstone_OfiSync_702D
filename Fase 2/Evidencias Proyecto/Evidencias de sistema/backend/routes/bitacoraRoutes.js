const express = require("express");
const router = express.Router();
const {
    crearEntrada,
    obtenerEntradas,
    actualizarEntrada,
    borrarEntrada
} = require("../controllers/bitacoraController");

const {validateBitacora} = require("../logic/bitacoraValidator");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRoleMiddleware");

//creamos el middleware de validacion
const middlewareValidar = (req, res, next) => {
    const { isValid, errors } = validateBitacora(req.body);
    if (!isValid) {
        return res.status(400).json({errors: errors.join(", ") });
    }
    //si es valido, pasa al siguiente paso (el controlador 'crearEntradas')
    next();
};

// Definir roles que puede editar o borrar
const rolesAdmin = ['admin', 'conserje'];

//Rutas publicas
router.get("/", authMiddleware, checkRole(rolesAdmin), obtenerEntradas);
router.post("/", authMiddleware, checkRole(rolesAdmin), middlewareValidar, crearEntrada);

//Rutas protegidas por rol
router.put("/:id", authMiddleware, checkRole(rolesAdmin),middlewareValidar, actualizarEntrada);
router.delete("/:id", authMiddleware, checkRole(rolesAdmin), borrarEntrada);

module.exports = router;