const API_URL = "http://localhost:4000/api/personas";

// Obtener todas las personas
export async function getPersonas() {
    const res = await fetch(API_URL);
    return res.json();
}
// Agregar persona
export async function agregarPersonaApi(persona) {
    const res = await fetch(`${API_URL}/agregar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(persona)
    });
    return res.json();
}
