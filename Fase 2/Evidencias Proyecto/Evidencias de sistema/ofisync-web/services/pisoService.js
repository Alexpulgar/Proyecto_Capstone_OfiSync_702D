const API_URL = "http://localhost:4000/api/pisos";

// Obtener todos los pisos
export async function getPisos() {
    const res = await fetch(API_URL);
    return res.json();
}

export async function getPisosPorEdificio(edificioId) {
  const res = await fetch(`${API_URL}/por-edificio?edificio_id=${edificioId}`);
  return res.json();
}

// Agregar piso o varios pisos
export async function agregarPisosApi(pisoData) {
  const res = await fetch(`${API_URL}/agregar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pisoData),
  });
  return res.json();
}