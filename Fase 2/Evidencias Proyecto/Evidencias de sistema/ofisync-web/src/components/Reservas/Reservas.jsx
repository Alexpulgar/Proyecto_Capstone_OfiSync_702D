import React, { useState, useEffect, useCallback } from 'react';
import {
  getAllReservationsAdmin,
  cancelReservationApi,
  completeReservationApi,
} from '../../../services/reservationService'; 
import { Alert, Spinner, Card, Button, Badge } from 'react-bootstrap';
import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from 'react-icons/fa';
import './Reservas.css';

export default function Reservas() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar reservas
  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllReservationsAdmin();
      setReservations(data);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setError(err.message || "Error al cargar las reservas");
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar el componente
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Manejador para Cancelar
  const handleCancel = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
      return;
    }
    try {
      await cancelReservationApi(id);
      alert("Reserva cancelada");
      fetchReservations(); 
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al cancelar la reserva");
    }
  };

  // Manejador para Completar
  const handleComplete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas marcar esta reserva como completada?")) {
      return;
    }
    try {
      await completeReservationApi(id);
      alert("Reserva completada");
      fetchReservations(); 
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al completar la reserva");
    }
  };

  // --- Helpers de formato ---

  const getStatusVariant = (status) => {
    switch (status) {
      case "pendiente": return "warning";
      case "completada": return "success";
      case "cancelada": return "danger";
      default: return "secondary";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatCurrency = (value) => {
    if (value == null) return 'N/A';
    return value.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    });
  };

  const renderFilePreview = (file_url) => {
    if (!file_url) return null;

    const extension = file_url.split(".").pop().toLowerCase();
    
    // 1. Obtenemos el nombre codificado
    const encodedFileName = file_url.split("/").pop();
    
    // 2. Decodificamos el nombre SOLO para mostrarlo y para el atributo 'download'
    const fileName = decodeURIComponent(encodedFileName);

    let icon;
    if (extension === "pdf") {
      icon = <FaFilePdf size={28} className="file-icon pdf" />;
    } else if (["doc", "docx"].includes(extension)) {
      icon = <FaFileWord size={28} className="file-icon doc" />;
    } else if (["jpg", "jpeg", "png", "gif"].includes(extension)) {
      icon = <FaFileImage size={28} className="file-icon img" />;
    } else {
      icon = <FaFileAlt size={28} className="file-icon other" />;
    }

    const fullUrl = `http://localhost:4000${file_url}`;

    return (
      <a 
        href={fullUrl}
        download={fileName}
        className="file-preview-link"
      >
        <div className="file-card-web">
          {icon}
          <span className="file-name-web">{fileName}</span>
        </div>
      </a>
    );
  };


  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p>Cargando reservas...</p>
      </div>
    );
  }

  if (error && reservations.length === 0) {
    return <Alert variant="danger" className="mt-3">{error}</Alert>;
  }

  return (
    <div className="reservas-container">
      <h2 className="mb-4">Gestión de Reservas</h2>
      
      {reservations.length === 0 && !loading && (
        <Alert variant="info">No se encontraron reservas.</Alert>
      )}

      <div className="reservas-list">
        {reservations.map((item) => (
          <Card key={item.id} className="mb-3 shadow-sm reserva-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <Card.Title className="mb-0 h5">
                {item.service_name}
              </Card.Title>
              <Badge pill bg={getStatusVariant(item.status)} className="status-badge">
                {item.status}
              </Badge>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <strong>Usuario:</strong> {item.user_name} <br />
                {item.numero_oficina && (
                  <><strong>Oficina:</strong> {item.numero_oficina} <br /></>
                )}
                {item.date && (
                  <><strong>Fecha:</strong> {formatDate(item.date)} <br /></>
                )}
                {item.start_time && (
                  <><strong>Horario:</strong> {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)} <br /></>
                )}
                {item.quantity && (
                  <><strong>Cantidad:</strong> {item.quantity} <br /></>
                )}
                {item.size && (
                  <><strong>Tamaño:</strong> {item.size} <br /></>
                )}
                {item.valor_total != null && (
                  <><strong>Valor Total:</strong> {formatCurrency(item.valor_total)} <br /></>
                )}
              </Card.Text>
              
              {renderFilePreview(item.file_url)}

            </Card.Body>
            {item.status === 'pendiente' && (
              <Card.Footer className="card-footer-actions">
                {item.service_type !== 'room' && (
                  <Button 
                    variant="success" 
                    size="sm" 
                    onClick={() => handleComplete(item.id)}
                  >
                    Completar
                  </Button>
                )}
                
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleCancel(item.id)}
                >
                  Cancelar
                </Button>
              </Card.Footer>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}