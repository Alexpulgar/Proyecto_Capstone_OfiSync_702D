const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const API_URL = `${BASE_URL}/insumos`;

export async function getInsumos(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}${query ? `?${query}` : ""}`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) throw new Error("Error al obtener los insumos");
  return await res.json();
}

export async function createInsumo(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear el insumo");
  return await res.json();
}

export async function updateInsumo(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar el insumo");
  return await res.json();
}

export async function deleteInsumo(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) throw new Error("Error al eliminar el insumo");
  return await res.json();
}
