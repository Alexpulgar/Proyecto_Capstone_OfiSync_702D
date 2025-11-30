const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const API_URL = `${BASE_URL}/gasto-comun`;

const getToken = () => {
  return localStorage.getItem("authToken");
};

export async function calcularGastoComunApi(payload) {
  const token = getToken();

  try {
    const res = await fetch(`${API_URL}/calcular`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Error al calcular el gasto");
    }
    return data;
  } catch (error) {
    console.error("Error al calcular gasto común:", error);
    return { error: error.message || "Error de conexión con el servidor" };
  }
}

export const getVouchersEnRevision = async () => {
  const token = getToken();

  try {
    const response = await fetch(`${API_URL}/revision`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al obtener los comprobantes");
    }
    return data;
  } catch (error) {
    console.error("Error al obtener comprobantes en revisión:", error.message);
    throw error;
  }
};

export const reviewVoucher = async (detalle_ids, accion) => {
  const token = getToken();

  try {
    const response = await fetch(`${API_URL}/review`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ detalle_ids, accion }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al revisar el comprobante");
    }
    return data;
  } catch (error) {
    console.error("Error al revisar comprobante:", error.message);
    throw error;
  }
};
