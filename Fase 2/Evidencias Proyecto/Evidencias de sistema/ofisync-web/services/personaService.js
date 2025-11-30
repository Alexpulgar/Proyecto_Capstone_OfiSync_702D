const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const API_URL = `${BASE_URL}/personas`;

export async function getPersonas() {
  const res = await fetch(API_URL, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  return res.json();
}

export async function agregarPersonaApi(persona) {
  const res = await fetch(`${API_URL}/agregar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(persona),
  });
  return res.json();
}

export async function getPersonaByRutApi(rut) {
  const res = await fetch(`${API_URL}/rut/${rut}`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Persona no encontrada");
  }
  return res.json();
}

export async function actualizarPersonaApi(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Error al actualizar");
  }
  return res.json();
}

export async function eliminarPersonaApi(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { "ngrok-skip-browser-warning": "true" },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error al eliminar la persona");
  }

  return data;
}
