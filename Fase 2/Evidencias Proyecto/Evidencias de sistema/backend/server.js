const app = require("./index");

const port = process.env.PORT || 4000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Servidor API iniciado exitosamente.`);
  console.log(`Escuchando en el puerto: ${port}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || "development"}`);
});
