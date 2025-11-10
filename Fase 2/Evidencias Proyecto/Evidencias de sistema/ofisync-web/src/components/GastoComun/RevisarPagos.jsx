import React, { useState, useEffect } from "react";
import {
  getVouchersEnRevision,
  reviewVoucher,
} from "../../../services/gastoComunService";
import "./GastoComun.css";

const API_BASE_URL = "http://localhost:4000";

// Función para formatear a CLP
const formatCLP = (value) => {
  const num = Math.round(Number(value));
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(num);
};

const RevisarPagos = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Carga inicial de los comprobantes pendientes
  const fetchVouchers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVouchersEnRevision();
      setVouchers(data);
    } catch (err) {
      setError(err.error || "No se pudieron cargar los comprobantes.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar los vouchers al montar el componente
  useEffect(() => {
    fetchVouchers();
  }, []);

  // Manejar la aprobación o rechazo
  const handleReview = async (detalle_ids, accion, comprobante_url) => {
    setUpdatingId(comprobante_url);
    try {
      await reviewVoucher(detalle_ids, accion);
      // Refrescar la lista eliminando el voucher que ya fue procesado
      setVouchers((prevVouchers) =>
        prevVouchers.filter((v) => v.comprobante_url !== comprobante_url)
      );
    } catch (err) {
      alert(
        `Error al ${accion} el comprobante: ${err.error || "Error desconocido"}`
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="loader">Cargando comprobantes...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="gasto-comun-container">
      <h2>Revisión de Pagos Pendientes</h2>

      {vouchers.length === 0 ? (
        <p>No hay comprobantes pendientes de revisión.</p>
      ) : (
        <div className="lista-vouchers-revision">
          {vouchers.map((voucher) => (
            <div key={voucher.comprobante_url} className="voucher-card">
              <h4>Oficina: {voucher.oficina_codigo}</h4>
              <p>
                <strong>Arrendatario:</strong>{" "}
                {voucher.arrendatario_nombre || "No asignado"}
              </p>
              <p>
                <strong>Monto Total:</strong>{" "}
                {formatCLP(voucher.monto_total_comprobante)}
              </p>
              <p>
                <strong>Meses Cubiertos:</strong>{" "}
                {voucher.meses_cubiertos.join(", ")}
              </p>
              <a
                href={`${API_BASE_URL}/uploads/${voucher.comprobante_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="voucher-link"
              >
                Ver Comprobante
              </a>

              <div className="voucher-actions">
                <button
                  className="btn-approve"
                  onClick={() =>
                    handleReview(
                      voucher.detalle_ids,
                      "aprobar",
                      voucher.comprobante_url
                    )
                  }
                  disabled={updatingId === voucher.comprobante_url}
                >
                  {/* Muestra spinner si se está actualizando este item */}
                  {updatingId === voucher.comprobante_url ? "..." : "Aprobar"}
                </button>
                <button
                  className="btn-reject"
                  onClick={() =>
                    handleReview(
                      voucher.detalle_ids,
                      "rechazar",
                      voucher.comprobante_url
                    )
                  }
                  disabled={updatingId === voucher.comprobante_url}
                >
                  {updatingId === voucher.comprobante_url ? "..." : "Rechazar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RevisarPagos;
