import axios from "axios";

const API_URL = "https://44.201.96.82:4000/api/dashboard";

const getAuthConfig = () => {
  const token = localStorage.getItem("authToken"); // Usamos "authToken"
  if (!token) {
    throw new Error("No hay token de autenticación");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getDashboardStats = async () => {
  try {
    const config = getAuthConfig();
    const response = await axios.get(`${API_URL}/stats`, config);
    return response.data;
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    throw error;
  }
};

export const getReservationsByServiceData = async () => {
  try {
    const config = getAuthConfig();
    const response = await axios.get(
      `${API_URL}/reservas-por-servicio`,
      config
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener datos (pie chart):", error);
    throw error;
  }
};

export const getRevenueLast7DaysData = async () => {
  try {
    const config = getAuthConfig();
    const response = await axios.get(`${API_URL}/ingresos-7dias`, config);
    return response.data;
  } catch (error) {
    console.error("Error al obtener datos (bar chart):", error);
    throw error;
  }
};
