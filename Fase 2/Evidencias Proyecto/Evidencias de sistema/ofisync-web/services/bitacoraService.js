import { getToken } from "./usuarioService";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const API_URL = `${BASE_URL}/bitacora`;

export async function getEntradas() {
  const token = getToken();
  if (!token) throw new Error("Acceso denegado. No se encontro token.");

  const res = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });

  if (!res.ok) throw new Error("Error al obtener las entradas de la bitacora");
  return await res.json();
}

export async function createEntrada(data) {
  const token = getToken();
  if (!token) throw new Error("Acceso denegado. No se encontro token.");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || "Error desconocido al crear la entrada");
  }
  return result;
}

export async function updateEntrada(id, data) {
  const token = getToken();
  if (!token) throw new Error("Acceso denegado. No se encontro token.");

  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || "Error al actualizar la entradas");
  }
  return result;
}

export async function deleteEntrada(id) {
  const token = getToken();
  if (!token) throw new Error("Acceso deneegado. No se encontro token.");

  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });

  if (!res.ok) {
    throw new Error("Error al eliminar la entrada");
  }
  return true;
}
