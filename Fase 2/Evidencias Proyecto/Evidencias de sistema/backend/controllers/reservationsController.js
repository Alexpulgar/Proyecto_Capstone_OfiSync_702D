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
    const {
      user_id,
      service_id,
      quantity,
      size,
      date,
      start_time,
      end_time,
    } = req.body;
    const file = req.file;

    // Obtener el tipo de servicio desde la base de datos
    const serviceResult = await pool.query("SELECT type FROM services WHERE id = $1", [service_id]);
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }
    const serviceType = serviceResult.rows[0].type;

    // Validaciones para servicios que no son salas de reuniones
    if (serviceType !== "room") {
      if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
        return res.status(400).json({ error: "Por favor ingresa una cantidad válida (mayor a 0)." });
      }
      if (!size || size.trim() === "") {
        return res.status(400).json({ error: "Debes seleccionar un tamaño de hoja." });
      }
      if (!file) {
        return res.status(400).json({ error: "Debes adjuntar un archivo antes de reservar." });
      }
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: "Tipo de archivo no permitido. Solo PDF, DOC, DOCX o imágenes." });
      }
    }

    // Validaciones para salas de reuniones
    if (serviceType === "room") {
      const now = new Date();
      const selectedStart = new Date(`${date}T${start_time}`);
      const selectedEnd = new Date(`${date}T${end_time}`);

      if (selectedStart <= now) {
        return res.status(400).json({ error: "No puedes reservar un horario que ya pasó." });
      }
      if (selectedEnd <= selectedStart) {
        return res.status(400).json({ error: "La hora de término debe ser posterior a la hora de inicio." });
      }

      const available = await isSlotAvailable(service_id, date, start_time, end_time);
      if (!available) {
        return res.status(409).json({ error: "El horario seleccionado ya está reservado." });
      }
    }

    const newReservation = await createReservation({ ...req.body, file_url: file ? `/uploads/${file.filename}` : null });
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

module.exports = {
  getAllServices,
  postReservation,
  getUserRes,
  cancelRes,
  getRoomReservationsByDate,
};