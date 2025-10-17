const pool = require("../models/db.js");

async function getServices() {
  const result = await pool.query("SELECT * FROM services ORDER BY id");
  return result.rows;
}

async function createReservation(data) {
  const {
    user_id,
    service_id,
    quantity,
    size,
    file_url,
    date,
    start_time,
    end_time
  } = data;

  // Obtener valor_base
  const serviceRes = await pool.query(
    "SELECT valor_base FROM services WHERE id=$1",
    [service_id]
  );
  const valor_base = serviceRes.rows[0]?.valor_base || 0;

  // Calcular cantidad según tipo de servicio
  let cantidadNum = 1;
  if (quantity) {
    cantidadNum = Number(quantity);
  } else if (start_time && end_time) {
    const start = new Date(`1970-01-01T${start_time}`);
    const end = new Date(`1970-01-01T${end_time}`);
    const diffMs = end - start;
    cantidadNum = diffMs / 1000 / 3600; // duración en horas
  }

  const valor_total = valor_base * cantidadNum;

  const result = await pool.query(
    `INSERT INTO reservations 
      (user_id, service_id, quantity, size, file_url, date, start_time, end_time, status, valor_total)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pendiente',$9) RETURNING *`,
    [user_id, service_id, quantity || null, size, file_url, date, start_time, end_time, valor_total]
  );

  return { ...result.rows[0], valor_base, cantidadNum, valor_total };
}

async function getUserReservations(user_id) {
  const result = await pool.query(
    `SELECT r.*, s.name AS service_name, s.valor_base, r.valor_total
     FROM reservations r
     JOIN services s ON s.id = r.service_id
     WHERE r.user_id = $1 ORDER BY r.id DESC`,
    [user_id]
  );
  return result.rows;
}

async function cancelReservation(id) {
  const result = await pool.query(
    `UPDATE reservations SET status='cancelada' WHERE id=$1 RETURNING *`,
    [id]
  );
  return result.rows[0];
}

module.exports = {
  getServices,
  createReservation,
  getUserReservations,
  cancelReservation,
};