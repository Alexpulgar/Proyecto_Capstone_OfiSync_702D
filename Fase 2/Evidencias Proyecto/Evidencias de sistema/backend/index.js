const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const oficinaRoutes = require("./routes/oficinaRoutes");
const pisoRoutes = require("./routes/pisoRoutes");
const personaRoutes = require("./routes/personaRoutes");
const edificioRoutes = require("./routes/edificioRoutes.js");
const gastoComunRoutes = require("./routes/gastoComunRoutes");
const reservationsRoutes = require("./routes/reservationsRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const insumoRoutes = require("./routes/insumoRoutes.js");
const dashboardRoutes = require("./routes/dashboardRoutes");
const bitacoraRoutes = require("./routes/bitacoraRoutes.js");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/oficinas", oficinaRoutes);
app.use("/api/pisos", pisoRoutes);
app.use("/api/personas", personaRoutes);
app.use("/api/edificios", edificioRoutes);
app.use("/api/gasto-comun", gastoComunRoutes);
app.use("/api/reservations", reservationsRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/insumos", insumoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/bitacora", bitacoraRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend OfiSync funcionando correctamente" });
});

app.use((req, res, next) => {
  console.log(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Endpoint no encontrado" });
});

app.use((err, req, res, next) => {
  console.error("Error interno:", err);
  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
  });
});

module.exports = app;
