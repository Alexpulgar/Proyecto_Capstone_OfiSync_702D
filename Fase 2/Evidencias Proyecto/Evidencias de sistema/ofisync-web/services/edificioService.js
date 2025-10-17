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
