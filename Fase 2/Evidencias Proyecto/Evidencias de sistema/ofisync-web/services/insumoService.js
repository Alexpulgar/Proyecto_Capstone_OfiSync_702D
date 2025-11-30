const API_URL = "https://44.201.96.82:4000/api/insumos";

// Obtener todos los insumos
export async function getInsumos(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error("Error al obtener los insumos");
  return await res.json();
}

//Crear un nuevo insumo
export async function createInsumo(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear el insumo");
  return await res.json();
}

//Actualizar insumo existente
export async function updateInsumo(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar el insumo");
  return await res.json();
}

//Eliminar insumo
export async function deleteInsumo(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar el insumo");
  return await res.json();
}
