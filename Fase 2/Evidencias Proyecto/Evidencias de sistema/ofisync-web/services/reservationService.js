import { getToken } from "./usuarioService";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const API_URL = `${BASE_URL}/reservations`;

const fetchWithAuth = async (url, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Error ${response.status}`);
  }

  if (options.method === "DELETE" || response.status === 204) {
    return;
  }
  return response.json();
};

export const getAllReservationsAdmin = () => {
  return fetchWithAuth(`${API_URL}/admin/all`);
};

export const cancelReservationApi = (id) => {
  return fetchWithAuth(`${API_URL}/${id}/cancel`, {
    method: "PUT",
  });
};

export const completeReservationApi = (id) => {
  return fetchWithAuth(`${API_URL}/${id}/complete`, {
    method: "PUT",
  });
};
