import React, { useState, useEffect } from "react";
import {
  getVouchersEnRevision,
  reviewVoucher,
} from "../../../services/gastoComunService";
import "./GastoComun.css";

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

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleReview = async (detalle_ids, accion, comprobante_url) => {
    setUpdatingId(comprobante_url);
    try {
      await reviewVoucher(detalle_ids, accion);
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

  const handleDownloadFile = async (e, fileUrl, fileName) => {
    e.preventDefault();
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("No se pudo obtener el archivo");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error en descarga:", err);
      alert("Error al descargar el archivo. Verifique su conexión.");
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
          {vouchers.map((voucher) => {
            const apiUrl =
              import.meta.env.VITE_API_URL || "http://localhost:4000/api";
            const baseUrl = apiUrl.endsWith("/api")
              ? apiUrl.slice(0, -4)
              : apiUrl;
            const fileUrl = `${baseUrl}/uploads/${voucher.comprobante_url}`;

            return (
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
                  href={fileUrl}
                  onClick={(e) =>
                    handleDownloadFile(e, fileUrl, voucher.comprobante_url)
                  }
                  className="voucher-link"
                  style={{ cursor: "pointer" }}
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
                    {updatingId === voucher.comprobante_url
                      ? "..."
                      : "Rechazar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RevisarPagos;
