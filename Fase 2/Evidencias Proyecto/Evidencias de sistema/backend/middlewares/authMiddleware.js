const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Acceso denegado. Token no provisto o mal formado." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expirado. Por favor, inicie sesión de nuevo." });
    }
    console.error("Error en authMiddleware:", err);
    return res.status(401).json({ error: "Token inválido." });
  }
};

module.exports = authMiddleware;
