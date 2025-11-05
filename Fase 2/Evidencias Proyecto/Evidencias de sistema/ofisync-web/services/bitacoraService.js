const API_URL = "http://localhost:4000/api/bitacora";

// Obtener todas las entradas
export async function getEntradas() {
    const res = await fetch(API_URL);
    if(!res.ok) throw new Error("Error al obtener las entradas de la bitacora");
    return await res.json();
}

// Crear nueva entrada
export async function createEntrada(data) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    });

    const result = await res.json();

    if(!res.ok) {
        //Lanza el error que viene del backend (ej: "el titulo es obligatorio")
        throw new Error(result.error || "Error desconocido al crear la entrada");
    }
    return result;
}