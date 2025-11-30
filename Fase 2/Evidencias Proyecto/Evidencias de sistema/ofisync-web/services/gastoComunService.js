const API_URL = "http://44.201.96.82:4000/api/gasto-comun";

const getToken = () => {
  return localStorage.getItem("token");
};

export async function calcularGastoComunApi(payload) {
  const token = getToken(); // <-- Obtenemos el token

  try {
    const res = await fetch(`${API_URL}/calcular`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // <-- Añadimos el token
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      // Si el servidor responde con un error (ej. 400, 500), lo lanzamos
      throw new Error(data.error || "Error al calcular el gasto");
    }
    return data;
  } catch (error) {
    console.error("Error al calcular gasto común:", error);
    // Devolvemos el error para que el componente pueda manejarlo
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
      },
      body: JSON.stringify({ detalle_ids, accion }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al revisar el comprobante");
    }
    return data;
  } catch (error) {
    console.error("Error al revisar el comprobante:", error.message);
    throw error;
  }
};
