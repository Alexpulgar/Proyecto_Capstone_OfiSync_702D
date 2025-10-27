const pool = require("../models/db.js"); // conexión a la BD

// Calcular y registrar el gasto común
const calcularGastoComun = async (req, res) => {
  try {
    const { edificio_id, mes, total, descripcion, luz, agua, mantencion, otros } = req.body;

    if (!edificio_id || !mes || !total) {
      return res.status(400).json({ error: "Faltan datos obligatorios." });
    }
    if (typeof total !== 'number' || total <= 0) {
      return res.status(400).json({
        error: "El monto total debe ser un número positivo mayor a cero.",
      });
    }
   
    // Verificar si ya existe un gasto común para ese edificio y mes
    const checkExist = await pool.query(
      `SELECT id FROM gastoComun WHERE edificio_id = $1 AND mes = $2`,
      [edificio_id, mes]
    );

    if (checkExist.rows.length > 0) {
      // 409 Conflict (Conflicto) es un código de estado apropiado aquí
      return res.status(409).json({ 
        error: "Ya se ha registrado un gasto común para este edificio y mes." 
      });
    }
    // Crear el registro del gasto común
    const result = await pool.query(
      `INSERT INTO gastoComun (edificio_id, mes, total, descripcion, luz, agua, mantencion, otros)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [edificio_id, mes, total, descripcion, luz, agua, mantencion, otros || ""]
    );

    const gastoComunId = result.rows[0].id;

    // Calcular el área total del edificio
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
        error: "El edificio no tiene oficinas registradas o las áreas son inválidas.",
      });
    }

    // Calcular gasto por m²
    const gastoPorM2 = total / totalArea;

    // Obtener las oficinas del edificio
    // Obtener solo las oficinas ocupadas del edificio
    const oficinasRes = await pool.query(
      `SELECT o.id, o.area
      FROM oficina o
      JOIN piso p ON o.piso_id = p.id
      WHERE p.edificio_id = $1
      AND o.estado = 'ocupada'`,
      [edificio_id]
    );

    // Verificar que haya oficinas ocupadas
    if (oficinasRes.rows.length === 0) {
      return res.status(400).json({
        error: "No hay oficinas ocupadas en este edificio.",
      });
    }

    // Insertar detalle de gasto solo para oficinas ocupadas
    for (const oficina of oficinasRes.rows) {
      const monto = parseFloat(oficina.area) * gastoPorM2;

      await pool.query(
        `INSERT INTO detalleGastoComun (gastoComunId, oficina_id, monto)
        VALUES ($1, $2, $3)`,
        [gastoComunId, oficina.id, monto]
      );
    }


    res.status(201).json({
      mensaje: " Gasto común calculado correctamente.",
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
        return res.status(400).json({ msg: "Formato de IDs inválido (debe ser un array JSON)." });
    }

    if (!Array.isArray(arrayDeIds) || arrayDeIds.length === 0) {
      return res.status(400).json({ msg: "La lista de IDs está vacía o no es un array." });
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
    res.status(500).json({ msg: "Error en el servidor al procesar el archivo." });
  }
};

module.exports = {
  calcularGastoComun,
  getGastosPorOficina,
  subirComprobante,
};