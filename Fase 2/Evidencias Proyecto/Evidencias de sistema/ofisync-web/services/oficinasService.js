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


