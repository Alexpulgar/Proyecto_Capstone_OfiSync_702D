const API_URL = "http://localhost:4000/api/gasto-comun";

export async function calcularGastoComunApi(payload) {
  try {
    const res = await fetch(`${API_URL}/calcular`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error("Error al calcular gasto común:", error);
    return { error: "Error de conexión con el servidor" };
  }
}
