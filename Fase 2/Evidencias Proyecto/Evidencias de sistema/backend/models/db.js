const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.PG_USER ,
  host: process.env.PG_HOST ,
  database: process.env.PG_DATABASE ,
  password: process.env.PG_PASSWORD ,
  port: process.env.PG_PORT 
});

pool.connect()
    .then(() => console.log("Conectado a PostgreSQL"))
    .catch(err => console.error("Error de conexión", err));

module.exports = pool;