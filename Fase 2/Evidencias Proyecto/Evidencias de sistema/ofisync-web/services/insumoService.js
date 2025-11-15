const API_URL = 'http://localhost:4000/api/insumos';

// Función para obtener los headers con el token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// GET (Obtener todos)
export const getInsumos = async () => {
  const response = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Error al obtener los insumos');
  }
  return response.json();
};

// POST (Crear)
export const createInsumo = async (insumoData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(insumoData),
  });
  if (!response.ok) {
    // Si es 400 (Bad Request), intenta leer el error de Joi
    if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(errorData.errors || 'Error de validación');
    }
    throw new Error('Error al crear el insumo');
  }
  return response.json();
};

// PUT (Actualizar)
export const updateInsumo = async (id, insumoData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(insumoData),
  });
  if (!response.ok) {
    if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(errorData.errors || 'Error de validación');
    }
    throw new Error('Error al actualizar el insumo');
  }
  return response.json();
};

// DELETE (Eliminar)
export const deleteInsumo = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Error al eliminar el insumo');
  }
  return response.json();
};