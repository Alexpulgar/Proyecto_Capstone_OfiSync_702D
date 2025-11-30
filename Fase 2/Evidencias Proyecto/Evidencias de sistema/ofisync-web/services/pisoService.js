const API_URL = "http://44.201.96.82:4000/api/pisos";

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

export async function eliminarPisosApi(datos) {
  // 'datos' es un objeto: { edificio_id, cantidad_a_borrar }
  const res = await fetch(`${API_URL}/borrar-por-cantidad`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  const data = await res.json(); // Lee la respuesta (sea error o éxito)

  if (!res.ok) {
    // Captura el error (ej: "No se puede eliminar...")
    throw new Error(data.error || "Error al eliminar los pisos");
  }

  return data; // Devuelve el mensaje de éxito
}
