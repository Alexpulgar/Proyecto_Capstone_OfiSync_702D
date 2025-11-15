const pool = require("../models/db.js"); // conexión a la BD

/**
 * Función para parsear el string de mes (ej: "Mayo 2025")
 * @param {string} mesString - El string del mes.
 * @returns {object} - Objeto con { month, year } o { error }
 */
const parseMesString = (mesString) => {
  if (!mesString || typeof mesString !== "string") {
    return { error: "Formato de mes inválido" };
  }

  const parts = mesString.split(" ");

  if (parts.length !== 3 || parts[1].toLowerCase() !== "de") {
    return {
      error:
        "Formato de mes inválido (se esperaba: 'Mes de Año', ej: 'Noviembre de 2025')",
    };
  }

  const monthName = parts[0].toLowerCase();
  const year = parseInt(parts[2], 10);

  if (isNaN(year)) {
    return { error: "Año inválido en el string de mes" };
  }

  const monthMap = {
    enero: 1,
    febrero: 2,
    marzo: 3,
    abril: 4,
    mayo: 5,
    junio: 6,
    julio: 7,
    agosto: 8,
    septiembre: 9,
    octubre: 10,
    noviembre: 11,
    diciembre: 12,
  };

  const month = monthMap[monthName];
  if (!month) {
    return { error: "Nombre de mes inválido" };
  }

  return { month, year };
};

// Calcular y registrar el gasto común
const calcularGastoComun = async (req, res) => {
  try {
    const {
      edificio_id,
      mes,
      total,
      descripcion,
      luz,
      agua,
      mantencion,
      otros,
    } = req.body;

    // --- (Validaciones existentes... sin cambios) ---
    if (!edificio_id || !mes || !total) {
      return res.status(400).json({ error: "Faltan datos obligatorios." });
    }
    if (typeof total !== "number" || total <= 0) {
      return res.status(400).json({
        error: "El monto total debe ser un número positivo mayor a cero.",
      });
    }

    // --- NUEVO: Parsear el mes y año para la consulta de reservas ---
    const parsedDate = parseMesString(mes);
    if (parsedDate.error) {
      return res.status(400).json({ error: parsedDate.error });
    }
    const { month: mes_numero, year: anio } = parsedDate;
    // --- FIN NUEVO ---

    // --- (Verificación de gasto existente... sin cambios) ---
    const checkExist = await pool.query(
      `SELECT id FROM gastoComun WHERE edificio_id = $1 AND mes = $2`,
      [edificio_id, mes]
    );

    if (checkExist.rows.length > 0) {
      return res.status(409).json({
        error: "Ya se ha registrado un gasto común para este edificio y mes.",
      });
    }

    // --- (Creación del registro gastoComun... sin cambios) ---
    const result = await pool.query(
      `INSERT INTO gastoComun (edificio_id, mes, total, descripcion, luz, agua, mantencion, otros)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [edificio_id, mes, total, descripcion, luz, agua, mantencion, otros || ""]
    );
    const gastoComunId = result.rows[0].id;

    // --- (Cálculo del área total... sin cambios) ---
    const areaTotalRes = await pool.query(
      `SELECT SUM(o.area) AS total_area
       FROM oficina o
       JOIN piso p ON o.piso_id = p.id
       WHERE p.edificio_id = $1`,
      [edificio_id]
    );
    const totalArea = parseFloat(areaTotalRes.rows[0].total_area);
    if (!totalArea || totalArea <= 0) {
      return res.status(400).json({
        error:
          "El edificio no tiene oficinas registradas o las áreas son inválidas.",
      });
    }

    // --- (Cálculo de gasto por m²... sin cambios) ---
    const gastoPorM2 = total / totalArea;

    // --- (Obtener oficinas ocupadas... sin cambios) ---
    const oficinasRes = await pool.query(
      `SELECT o.id, o.area
      FROM oficina o
      JOIN piso p ON o.piso_id = p.id
      WHERE p.edificio_id = $1
      AND o.estado = 'ocupada'`,
      [edificio_id]
    );
    if (oficinasRes.rows.length === 0) {
      return res.status(400).json({
        error: "No hay oficinas ocupadas en este edificio.",
      });
    }

    // Obtener los totales de reservas para todas esas oficinas en ese mes
    const occupiedOfficeIds = oficinasRes.rows.map((o) => o.id);

    const reservasQuery = `
      SELECT oficina_id, SUM(valor_total) AS total_reservas
      FROM reservations
      WHERE status = 'completada'
        AND EXTRACT(MONTH FROM date) = $1
        AND EXTRACT(YEAR FROM date) = $2
        AND oficina_id = ANY($3::int[])
      GROUP BY oficina_id;
    `;

    const reservasResult = await pool.query(reservasQuery, [
      mes_numero,
      anio,
      occupiedOfficeIds,
    ]);

    // Convertir el resultado en un Mapa para búsqueda rápida
    const reservasMap = new Map();
    for (const row of reservasResult.rows) {
      reservasMap.set(row.oficina_id, parseFloat(row.total_reservas));
    }
    // --- FIN NUEVO ---

    // --- MODIFICADO: Loop para insertar detalle ---
    for (const oficina of oficinasRes.rows) {
      // 1. Gasto base por m²
      const monto_base = parseFloat(oficina.area) * gastoPorM2;

      // 2. Gasto de reservas completadas de ese mes
      const monto_reservas = reservasMap.get(oficina.id) || 0;

      // 3. Monto final = Gasto Base + Gasto Reservas
      const monto_final = monto_base + monto_reservas;

      await pool.query(
        `INSERT INTO detalleGastoComun (gastoComunId, oficina_id, monto)
        VALUES ($1, $2, $3)`,
        [gastoComunId, oficina.id, monto_final] // <--- Se usa el monto_final
      );
    }
    // --- FIN MODIFICADO ---

    res.status(201).json({
      mensaje: " Gasto común calculado correctamente (reservas incluidas).", // Mensaje actualizado
      gastoComunId,
      gasto_por_m2: gastoPorM2.toFixed(2),
    });
  } catch (err) {
    console.error("Error al calcular gasto común:", err);
    res.status(500).json({ error: "Error interno al calcular gasto común." });
  }
};

const getGastosPorOficina = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Falta el ID de la oficina." });
    }

    const query = `
      WITH GastoConFecha AS (
        SELECT
          dg.id AS detalle_id,
          dg.monto,
          dg.estado_pago,
          dg.comprobante_url,
          NULLIF(split_part(g.mes, ' ', 3), '')::INTEGER AS anio,
          CASE LOWER(split_part(g.mes, ' ', 1))
            WHEN 'enero' THEN 1
            WHEN 'febrero' THEN 2
            WHEN 'marzo' THEN 3
            WHEN 'abril' THEN 4
            WHEN 'mayo' THEN 5
            WHEN 'junio' THEN 6
            WHEN 'julio' THEN 7
            WHEN 'agosto' THEN 8
            WHEN 'septiembre' THEN 9
            WHEN 'octubre' THEN 10
            WHEN 'noviembre' THEN 11
            WHEN 'diciembre' THEN 12
            ELSE NULL
          END AS mes_numero
          
        FROM 
          public.detallegastocomun dg
        JOIN 
          public.gastocomun g ON dg.gastocomunid = g.id
        WHERE 
          dg.oficina_id = $1
      )
      SELECT 
        detalle_id,
        monto,
        estado_pago,
        comprobante_url,
        anio,
        mes_numero
      FROM 
        GastoConFecha
      ORDER BY
        anio DESC NULLS LAST,
        mes_numero DESC NULLS LAST
      LIMIT 12;
    `;

    const result = await pool.query(query, [id]);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error al obtener gastos por oficina:", err);
    res.status(500).json({ error: "Error interno al obtener gastos." });
  }
};

// Funcion para subir comprobante y actualizar estados
const subirComprobante = async (req, res) => {
  try {
    // Obtener el archivo (de multer) y los IDs (del body)
    const { file } = req;
    const { gastos_ids } = req.body;

    if (!file) {
      return res.status(400).json({ msg: "No se subió ningún archivo." });
    }

    if (!gastos_ids) {
      return res.status(400).json({ msg: "No se especificaron los gastos." });
    }

    // Parsear los IDs
    let arrayDeIds;
    try {
      arrayDeIds = JSON.parse(gastos_ids);
    } catch (e) {
      return res
        .status(400)
        .json({ msg: "Formato de IDs inválido (debe ser un array JSON)." });
    }

    if (!Array.isArray(arrayDeIds) || arrayDeIds.length === 0) {
      return res
        .status(400)
        .json({ msg: "La lista de IDs está vacía o no es un array." });
    }

    const nombreArchivo = file.filename;

    const query = `
      UPDATE public.detallegastocomun
      SET 
        estado_pago = 'en revision', 
        comprobante_url = $1
      WHERE 
        id = ANY($2::int[]) 
    `;

    await pool.query(query, [nombreArchivo, arrayDeIds]);

    // Enviar respuesta exitosa
    res.status(200).json({
      msg: "Comprobante subido exitosamente. Será revisado por la administración.",
      fileName: nombreArchivo,
    });
  } catch (error) {
    console.error("Error al subir comprobante:", error);
    res
      .status(500)
      .json({ msg: "Error en el servidor al procesar el archivo." });
  }
};

// OBTENER COMPROBANTES PARA REVISIÓN
const getVouchersEnRevision = async (req, res) => {
  try {
    // Agrupamos por comprobante, ya que un archivo puede cubrir varios meses
    const query = `
      SELECT 
        dg.comprobante_url, 
        o.codigo AS oficina_codigo,
        p.nombre AS arrendatario_nombre,
        -- Agregamos los IDs y Meses en un array JSON
        JSON_AGG(DISTINCT dg.id) AS detalle_ids,
        JSON_AGG(DISTINCT gc.mes) AS meses_cubiertos,
        SUM(dg.monto) AS monto_total_comprobante
      FROM detallegastocomun dg
      JOIN oficina o ON dg.oficina_id = o.id
      JOIN gastocomun gc ON dg.gastocomunid = gc.id
      LEFT JOIN persona p ON o.persona_id = p.id
      WHERE dg.estado_pago = 'en revision' AND dg.comprobante_url IS NOT NULL
      GROUP BY dg.comprobante_url, o.codigo, p.nombre
      ORDER BY o.codigo;
    `;

    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error al obtener comprobantes en revisión:", err);
    res.status(500).json({ error: "Error interno al obtener comprobantes." });
  }
};

// APROBAR O RECHAZAR COMPROBANTE
const reviewVoucher = async (req, res) => {
  try {
    const { detalle_ids, accion } = req.body; // accion será 'aprobar' o 'rechazar'

    if (
      !detalle_ids ||
      !Array.isArray(detalle_ids) ||
      detalle_ids.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Faltan los IDs de los gastos a revisar." });
    }

    let query;
    let params = [detalle_ids];

    if (accion === "aprobar") {
      // Si se aprueba, se marca como 'pagado'
      query = `
        UPDATE detallegastocomun
        SET estado_pago = 'pagado'
        WHERE id = ANY($1::int[]) AND estado_pago = 'en revision'
        RETURNING *;
      `;
    } else if (accion === "rechazar") {
      // Si se rechaza, vuelve a 'pendiente' y se quita el comprobante
      query = `
        UPDATE detallegastocomun
        SET estado_pago = 'pendiente', comprobante_url = NULL
        WHERE id = ANY($1::int[]) AND estado_pago = 'en revision'
        RETURNING *;
      `;
    } else {
      return res
        .status(400)
        .json({ error: "Acción no válida (debe ser 'aprobar' o 'rechazar')." });
    }

    const result = await pool.query(query, params);

    res.status(200).json({
      message: `Acción '${accion}' aplicada a ${result.rowCount} registros.`,
      updated: result.rows,
    });
  } catch (err) {
    console.error("Error al revisar el comprobante:", err);
    res.status(500).json({ error: "Error interno al revisar el comprobante." });
  }
};

const getGastoStatus = async (req, res) => {
  console.log("--- [DEBUG] Iniciando /gasto-comun/status ---");
  try {
    const authenticatedUserId = req.user.id;
    console.log("[DEBUG] 1. ID de usuario autenticado:", authenticatedUserId);

    const oficinaQuery = `
      SELECT o.id AS oficina_id
      FROM usuarios u
      JOIN persona p ON u.persona_id = p.id
      LEFT JOIN oficina o ON p.id = o.persona_id
      WHERE u.id = $1;
    `;
    const oficinaResult = await pool.query(oficinaQuery, [authenticatedUserId]);

    if (!oficinaResult.rows.length || !oficinaResult.rows[0].oficina_id) {
      console.log(
        "[DEBUG] 2. Resultado de Oficina: No se encontró oficina para el usuario.",
        oficinaResult.rows
      );
      return res.json({ hasPending: false });
    }

    const userOfficeId = oficinaResult.rows[0].oficina_id;
    console.log("[DEBUG] 2. ID de oficina encontrado:", userOfficeId);

    const gastoQuery = `
      SELECT id
      FROM detallegastocomun 
      WHERE oficina_id = $1 AND estado_pago = 'pendiente'
      LIMIT 1;
    `;
    const gastoResult = await pool.query(gastoQuery, [userOfficeId]);

    if (gastoResult.rows.length > 0) {
      console.log(
        "[DEBUG] 3. Resultado de Gastos: ¡Deuda encontrada!",
        gastoResult.rows[0]
      );
      return res.json({ hasPending: true });
    } else {
      console.log(
        "[DEBUG] 3. Resultado de Gastos: No se encontraron deudas pendientes."
      );
      return res.json({ hasPending: false });
    }
  } catch (error) {
    console.error("Error al verificar estado de gastos:", error);
    res.status(500).json({ error: "Error al verificar estado de gastos" });
  }
};

module.exports = {
  calcularGastoComun,
  getGastosPorOficina,
  subirComprobante,
  getVouchersEnRevision,
  reviewVoucher,
  getGastoStatus,
};
