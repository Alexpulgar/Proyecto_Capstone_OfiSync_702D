const checkRole = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user || !req.user.rol) {
            return res.status(403).json({error: "Acceso denegado. No se pudo verificar el rol."});     
        }

        const { rol } = req.user;
        if (!rolesPermitidos.includes(rol)) {
            return res.status(403).json({error: "Acceso denegado. No tienes permisos para esta accion."});
        }
        next();
    };
};

module.exports = checkRole;