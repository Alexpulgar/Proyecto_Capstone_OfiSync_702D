const {
  getServices,
  createReservation,
  getUserReservations,
  cancelReservation,
} = require("../models/reservationsModel.js");
const pool = require("../models/db.js");

// Función auxiliar para verificar la disponibilidad de la sala
const isSlotAvailable = async (serviceId, date, startTime, endTime) => {
  const query = `
    SELECT *
    FROM reservations 
    WHERE service_id = $1 
    AND date = $2
    AND status = 'pendiente'
    AND (
      (start_time < $4 AND end_time > $3)
    )
  `;
  const values = [serviceId, date, startTime, endTime];
  const result = await pool.query(query, values);
  return result.rows.length === 0;
};

const getAllServices = async (req, res) => {
  try {
    const services = await getServices();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener servicios" });
  }
};

const postReservation = async (req, res) => {
  try {
    const { user_id, service_id, quantity, size, date, start_time, end_time } =
      req.body;
    const file = req.file;

    const oficinaQuery = `
      SELECT o.id AS oficina_id
      FROM usuarios u
      JOIN persona p ON u.persona_id = p.id
      LEFT JOIN oficina o ON p.id = o.persona_id
      WHERE u.id = $1;
    `;
    const oficinaResult = await pool.query(oficinaQuery, [user_id]);

    if (oficinaResult.rows.length > 0 && oficinaResult.rows[0].oficina_id) {
      const userOfficeId = oficinaResult.rows[0].oficina_id;

      const gastoQuery = `
        SELECT id
        FROM detallegastocomun 
        WHERE oficina_id = $1 AND estado_pago = 'pendiente';
      `;
      const gastoResult = await pool.query(gastoQuery, [userOfficeId]);

      if (gastoResult.rows.length > 0) {
        return res.status(403).json({
          error: "No puede realizar reservas. Tiene gastos comunes pendientes.",
        });
      }
    }

    // Obtener el tipo de servicio desde la base de datos
    const serviceResult = await pool.query(
      "SELECT type FROM services WHERE id = $1",
      [service_id]
    );
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }
    const serviceType = serviceResult.rows[0].type;

    // Validaciones para servicios que no son salas de reuniones
    if (serviceType !== "room") {
      const numQuantity = parseInt(quantity, 10);
      if (!quantity || isNaN(numQuantity) || numQuantity <= 0) {
        return res.status(400).json({
          error: "Por favor ingresa una cantidad válida (mayor a 0).",
        });
      }

      if (numQuantity > 1000) {
        return res
          .status(400)
          .json({ error: "La cantidad no puede exceder las 1000 unidades." });
      }

      if (!size || size.trim() === "") {
        return res
          .status(400)
          .json({ error: "Debes seleccionar un tamaño de hoja." });
      }
      if (!file) {
        return res
          .status(400)
          .json({ error: "Debes adjuntar un archivo antes de reservar." });
      }
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error:
            "Tipo de archivo no permitido. Solo PDF, DOC, DOCX o imágenes.",
        });
      }
    }

    // Validaciones para salas de reuniones
    if (serviceType === "room") {
      const now = new Date();
      const selectedStart = new Date(`${date}T${start_time}`);
      const selectedEnd = new Date(`${date}T${end_time}`);

      if (selectedStart <= now) {
        return res
          .status(400)
          .json({ error: "No puedes reservar un horario que ya pasó." });
      }
      if (selectedEnd <= selectedStart) {
        return res.status(400).json({
          error: "La hora de término debe ser posterior a la hora de inicio.",
        });
      }

      const durationInMilliseconds =
        selectedEnd.getTime() - selectedStart.getTime();
      const durationInMinutes = durationInMilliseconds / (1000 * 60);
      if (durationInMinutes < 30) {
        return res.status(400).json({
          error: "La duración mínima de la reserva debe ser de 30 minutos.",
        });
      }

      const available = await isSlotAvailable(
        service_id,
        date,
        start_time,
        end_time
      );
      if (!available) {
        return res
          .status(409)
          .json({ error: "El horario seleccionado ya está reservado." });
      }
    }

    const newReservation = await createReservation({
      ...req.body,
      file_url: file ? `/uploads/${file.filename}` : null,
    });
    res.status(201).json(newReservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear reserva" });
  }
};

const getUserRes = async (req, res) => {
  try {
    const reservations = await getUserReservations(req.params.id);
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener reservas del usuario" });
  }
};

const cancelRes = async (req, res) => {
  try {
    const reservation = await cancelReservation(req.params.id);
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: "Error al cancelar reserva" });
  }
};

const getRoomReservationsByDate = async (req, res) => {
  try {
    const { serviceId, date } = req.params;

    const query = `
      SELECT 
        TO_CHAR(start_time, 'HH24:MI') AS start_time, 
        TO_CHAR(end_time, 'HH24:MI') AS end_time
      FROM reservations 
      WHERE service_id = $1 
      AND TO_CHAR(date, 'YYYY-MM-DD') = $2 
      AND status = 'pendiente'
      ORDER BY start_time ASC
    `;
    const values = [parseInt(serviceId), date];

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener los horarios ocupados:", err);
    res.status(500).json({ error: "Error al obtener los horarios ocupados" });
  }
};

const getAllReservationsAdmin = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id, r.user_id, r.service_id, r.quantity, r.size, r.file_url,
        r.date, r.start_time, r.end_time, r.status, 
        s.valor_base, r.valor_total,
        s.name AS service_name, 
        s.type AS service_type,
        u.nombre_usuario AS user_name,
        o.codigo as numero_oficina
      FROM reservations r
      JOIN services s ON r.service_id = s.id
      JOIN usuarios u ON r.user_id = u.id
      LEFT JOIN persona p ON u.persona_id = p.id 
      LEFT JOIN oficina o ON p.id = o.persona_id

      WHERE
        r.status = 'pendiente' OR r.date = CURRENT_DATE

      ORDER BY 
        CASE 
          WHEN r.status = 'pendiente' THEN 1
          WHEN r.status = 'completada' THEN 2
          WHEN r.status = 'cancelada' THEN 3
          ELSE 4
        END,
        r.date DESC, r.start_time DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener todas las reservas:", err);
    res.status(500).json({ error: "Error al obtener todas las reservas" });
  }
};

// COMPLETAR RESERVA MANUALMENTE
const completeReservationManual = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      UPDATE reservations 
      SET status = 'completada' 
      WHERE id = $1 AND status = 'pendiente'
      RETURNING *;
    `;
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Reserva no encontrada o ya no está pendiente" });
    }

    // Devolvemos la reserva actualizada
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al completar la reserva:", err);
    res.status(500).json({ error: "Error al completar la reserva" });
  }
};

const completePastReservations = async (req, res) => {
  try {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().slice(0, 8);
    const query = `
      UPDATE reservations
      SET status = 'completada'
      WHERE service_id = 4 
      AND status = 'pendiente'
      AND (
        (date < $1) OR
        (date = $1 AND end_time <= $2)
      )
      RETURNING *;
    `;

    const values = [today, currentTime];
    const result = await pool.query(query, values);

    res.json({
      message: `${result.rowCount} reservas completadas automáticamente`,
      updated: result.rows,
    });
  } catch (err) {
    console.error("Error actualizando reservas pasadas:", err);
    res.status(500).json({ error: "Error actualizando reservas pasadas" });
  }
};

module.exports = {
  getAllServices,
  postReservation,
  getUserRes,
  cancelRes,
  getRoomReservationsByDate,
  getAllReservationsAdmin,
  completeReservationManual,
  completePastReservations,
};
