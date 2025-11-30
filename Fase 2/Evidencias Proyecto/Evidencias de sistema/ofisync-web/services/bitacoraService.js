const API_URL = "http://44.201.96.82:4000/api/bitacora";

//import a la funcion existente en usuarioService
import { getToken } from "./usuarioService";

// Obtener todas las entradas
export async function getEntradas() {
  const token = getToken();
  if (!token) throw new Error("Acceso denegado. No se encontro token.");

  const res = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Error al obtener las entradas de la bitacora");
  return await res.json();
}

// Crear nueva entrada
export async function createEntrada(data) {
  const token = getToken();
  if (!token) throw new Error("Acceso denegado. No se encontro token.");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    //Lanza el error que viene del backend (ej: "el titulo es obligatorio")
    throw new Error(result.error || "Error desconocido al crear la entrada");
  }
  return result;
}

// Actualizar entradas
export async function updateEntrada(id, data) {
  const token = getToken();
  if (!token) throw new Error("Acceso denegado. No se encontro token.");

  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || "Error al actualizar la entradas");
  }
  return result;
}

// Borrar entrada
export async function deleteEntrada(id) {
  const token = getToken();
  if (!token) throw new Error("Acceso deneegado. No se encontro token.");

  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || "Error desconocido al borrar la entrada");
  }
  return result;
}
