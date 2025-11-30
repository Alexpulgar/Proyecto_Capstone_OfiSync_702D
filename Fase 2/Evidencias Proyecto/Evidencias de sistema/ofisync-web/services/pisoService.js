const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const API_URL = `${BASE_URL}/pisos`;

export async function getPisos() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function getPisosPorEdificio(edificioId) {
  const res = await fetch(`${API_URL}/por-edificio?edificio_id=${edificioId}`);
  return res.json();
}

export async function agregarPisosApi(pisoData) {
  const res = await fetch(`${API_URL}/agregar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pisoData),
  });
  return res.json();
}

export async function eliminarPisosApi(datos) {
  const res = await fetch(`${API_URL}/borrar-por-cantidad`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error al eliminar los pisos");
  }

  return data;
}
