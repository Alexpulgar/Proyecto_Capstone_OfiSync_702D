const API_URL = "http://44.201.96.82:4000/api/edificios";

export async function getEdificios() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function agregarEdificioApi(edificio) {
  const res = await fetch(`${API_URL}/agregar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(edificio),
  });
  return res.json();
}

export async function getEdificioByIdApi(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Error al obtener datos del edificio");
  return res.json();
}

export async function actualizarEdificioApi(id, edificioData) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
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
  });

  const data = await res.json(); // Lee la respuesta (sea error o éxito)

  if (!res.ok) {
    // Captura el error (ej: "No se puede eliminar...")
    throw new Error(data.error || "Error al eliminar el edificio");
  }

  return data; // Devuelve el mensaje de éxito
}
