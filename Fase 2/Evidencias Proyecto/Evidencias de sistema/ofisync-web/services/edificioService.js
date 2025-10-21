const API_URL = "http://localhost:4000/api/edificios";

export async function getEdificios() {
    const res = await fetch(API_URL);
    return res.json();
}

export async function agregarEdificioApi(edificio) {
    const res = await fetch(`${API_URL}/agregar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edificio)
    });
    return res.json();
}

// (La necesitas para rellenar el formulario)
export async function getEdificioByIdApi(id) {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Error al obtener datos del edificio');
    return res.json();
}

// (La necesitas para guardar)
export async function actualizarEdificioApi(id, edificioData) {
    const res = await fetch(`${API_URL}/${id}`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edificioData)
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al actualizar');
    }
    return res.json();
}

