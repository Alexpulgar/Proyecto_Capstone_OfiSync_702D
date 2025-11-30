const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const API_URL = `${BASE_URL}/oficinas`;

export async function getOficinas() {
  const res = await fetch(API_URL, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  return res.json();
}

export async function buscarOficinas(filtro) {
  const queryParms = new URLSearchParams();
  if (filtro.codigo) queryParms.append("codigo", filtro.codigo);
  if (filtro.piso) queryParms.append("piso", filtro.piso);
  if (filtro.estado) queryParms.append("estado", filtro.estado);
  if (filtro.arrendatario)
    queryParms.append("arrendatario", filtro.arrendatario);

  const res = await fetch(`${API_URL}/buscar?${queryParms.toString()}`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  return res.json();
}

export async function agregarOficinaApi(oficina) {
  const res = await fetch(`${API_URL}/agregar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(oficina),
  });
  return res.json();
}

export async function getOficinasByPiso(pisoId) {
  const res = await fetch(`${API_URL}/piso/${pisoId}`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Error al buscar oficinas por piso");
  }
  return res.json();
}

export async function getOficinaById(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData.error || "Error al obtener detalles de la oficina"
    );
  }
  return res.json();
}

export async function actualizarOficinaApi(id, oficinaData) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(oficinaData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error al actualizar la oficina");
  }

  return data;
}

export async function eliminarOficinaApi(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { "ngrok-skip-browser-warning": "true" },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error al eliminar la oficina");
  }

  return data;
}
