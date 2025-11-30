const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const API_URL = `${BASE_URL}/edificios`;

export async function getEdificios() {
  const res = await fetch(API_URL, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  return res.json();
}

export async function agregarEdificioApi(edificio) {
  const res = await fetch(`${API_URL}/agregar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(edificio),
  });
  return res.json();
}

export async function getEdificioByIdApi(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) throw new Error("Error al obtener datos del edificio");
  return res.json();
}

export async function actualizarEdificioApi(id, edificioData) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(edificioData),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Error al actualizar");
  }
  return res.json();
}

export async function eliminarEdificioApi(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { "ngrok-skip-browser-warning": "true" },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error al eliminar el edificio");
  }

  return data;
}
