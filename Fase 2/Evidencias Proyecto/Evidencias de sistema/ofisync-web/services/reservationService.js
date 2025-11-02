import { getToken } from './usuarioService';

const API_URL = "http://localhost:4000/api/reservations"; // Ajusta si tu URL base es otra

// Función auxiliar para manejar fetch con autenticación
const fetchWithAuth = async (url, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Error ${response.status}`);
  }

  // Si el método no es DELETE o no devuelve contenido, parsea JSON
  if (options.method === 'DELETE' || response.status === 204) {
    return; 
  }
  return response.json();
};

/**
 * Obtiene todas las reservas (para vista de Admin/Conserje)
 */
export const getAllReservationsAdmin = () => {
  return fetchWithAuth(`${API_URL}/admin/all`);
};

/**
 * Cancela una reserva
 * @param {number} id - ID de la reserva
 */
export const cancelReservationApi = (id) => {
  return fetchWithAuth(`${API_URL}/${id}/cancel`, {
    method: 'PUT',
  });
};

/**
 * Completa una reserva manualmente (para servicios)
 * @param {number} id - ID de la reserva
 */
export const completeReservationApi = (id) => {
  return fetchWithAuth(`${API_URL}/${id}/complete`, {
    method: 'PUT',
  });
};