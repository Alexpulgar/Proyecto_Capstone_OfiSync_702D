const API_URL = "http://localhost:4000/api/oficinas";

//Trae todas las oficinas
export async function getOficinas() {
    const res = await fetch(API_URL);
    return res.json();
    
}

// Buscar oficinas segun filtros
export async function buscarOficinas(filtro) {
    const queryParms = new URLSearchParams();
    if(filtro.codigo) queryParms.append("codigo",filtro.codigo);
    if(filtro.piso) queryParms.append("piso", filtro.piso);
    if(filtro.estado) queryParms.append("estado", filtro.estado);
    if(filtro.arrendatario) queryParms.append("arrendatario", filtro.arrendatario);
    
    const res = await fetch(`${API_URL}/buscar?${queryParms.toString()}`);
    return res.json();
}

// Agregar oficina 
export async function agregarOficinaApi(oficina) {
    const res = await fetch(`${API_URL}/agregar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(oficina)
    });
    return res.json();
}

// Obtener oficinas por ID de piso
export async function getOficinasByPiso(pisoId) {
  const res = await fetch(`${API_URL}/piso/${pisoId}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Error al buscar oficinas por piso");
  }
  return res.json();
}

// Obtener los detalles de UNA oficina por ID
export async function getOficinaById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Error al obtener detalles de la oficina");
  }
  return res.json();
}

// Actualizar una oficina
export async function actualizarOficinaApi(id, oficinaData) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(oficinaData)
  });
  
  const data = await res.json(); // Lee la respuesta (sea error o éxito)
  
  if (!res.ok) {
    // Si la API devuelve un error (ej. 400, 404, 500), lanza un error
    throw new Error(data.error || "Error al actualizar la oficina");
  }
  
  return data; // Devuelve la oficina actualizada (o mensaje de éxito)
}


