const pool = require("../models/db.js");

const getDashboardStats = async (req, res) => {
  try {
    // 1. Contar usuarios (Arrendatarios)
    const userQuery = "SELECT COUNT(*) FROM usuarios WHERE rol = 'usuario'";
    // 2. Contar oficinas ocupadas
    const occupiedOfficeQuery =
      "SELECT COUNT(*) FROM oficina WHERE persona_id IS NOT NULL";
    // 3. Contar el TOTAL de oficinas
    const totalOfficeQuery = "SELECT COUNT(*) FROM oficina";
    // 4. Contar reservas de hoy
    const reservationsQuery =
      "SELECT COUNT(*) FROM reservations WHERE date = CURRENT_DATE AND status = 'pendiente'";
    // 5. Contar gastos pendientes
    const expensesQuery =
      "SELECT COUNT(*) FROM detallegastocomun WHERE estado_pago = 'pendiente'";
    // 6. Contar vouchers en revisión
    const vouchersQuery =
      "SELECT COUNT(*) FROM detallegastocomun WHERE estado_pago = 'en revision'";
    // 7. Contar incidencias registradas
    const incidentsQuery =
      "SELECT COUNT(*) FROM bitacora WHERE tipo = 'Incidente' AND creado_en::date = CURRENT_DATE";

    const [
      userResult,
      occupiedOfficeResult,
      totalOfficeResult,
      reservationsResult,
      expensesResult,
      vouchersResult,
      incidentsResult,
    ] = await Promise.all([
      pool.query(userQuery),
      pool.query(occupiedOfficeQuery),
      pool.query(totalOfficeQuery),
      pool.query(reservationsQuery),
      pool.query(expensesQuery),
      pool.query(vouchersQuery),
      pool.query(incidentsQuery),
    ]);

    res.json({
      totalUsers: userResult.rows[0].count || 0,
      occupiedOffices: occupiedOfficeResult.rows[0].count || 0,
      totalOffices: totalOfficeResult.rows[0].count || 0,
      reservationsToday: reservationsResult.rows[0].count || 0,
      pendingExpenses: expensesResult.rows[0].count || 0,
      pendingVouchers: vouchersResult.rows[0].count || 0,
      incidentsToday: incidentsResult.rows[0].count || 0,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
};

const getReservationsByService = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.name, 
        COUNT(r.id) AS value 
      FROM reservations r
      JOIN services s ON r.service_id = s.id
      GROUP BY s.name;
    `;
    const result = await pool.query(query);

    const data = result.rows.map((row) => ({
      name: row.name,
      value: parseInt(row.value, 10),
    }));

    res.json(data);
  } catch (error) {
    console.error("Error al obtener datos de reservas por servicio:", error);
    res.status(500).json({ error: "Error al obtener datos del gráfico" });
  }
};

const getRevenueLast7Days = async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(date, 'YYYY-MM-DD') AS name, 
        SUM(valor_total) AS total
      FROM reservations 
      WHERE 
        date >= CURRENT_DATE - INTERVAL '7 days' 
        AND status = 'completada'
      GROUP BY name 
      ORDER BY name ASC;
    `;
    const result = await pool.query(query);

    const data = result.rows.map((row) => ({
      name: row.name,
      total: parseFloat(row.total),
    }));

    res.json(data);
  } catch (error) {
    console.error("Error al obtener ingresos de últimos 7 días:", error);
    res.status(500).json({ error: "Error al obtener datos del gráfico" });
  }
};

module.exports = {
  getDashboardStats,
  getReservationsByService,
  getRevenueLast7Days,
};
