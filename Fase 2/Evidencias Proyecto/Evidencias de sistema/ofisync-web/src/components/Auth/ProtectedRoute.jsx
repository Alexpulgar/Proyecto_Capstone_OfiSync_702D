import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getUsuario } from '../../../services/usuarioService'; // Ajusta la ruta si es necesario

// Este componente recibe los roles permitidos (allowedRoles) y el componente hijo (children)
function ProtectedRoute({ children, allowedRoles }) {
  const currentUser = getUsuario(); // Obtiene el usuario actual
  const location = useLocation(); // Para saber a qué página quería ir

  // 1. ¿Está logueado? Si no, lo manda a /login
  if (!currentUser) {
    // Guarda la ubicación a la que intentaba ir para redirigirlo después del login (opcional)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. ¿Se especificaron roles permitidos Y el rol del usuario NO está en la lista?
  if (allowedRoles && !allowedRoles.includes(currentUser.rol)) {
    // Si no tiene permiso, lo manda a la página de inicio (o a una de "Acceso Denegado")
    // El conserje que intente ir a /administracion, por ejemplo, será redirigido aquí.
    return <Navigate to="/inicio" replace />;
  }

  // 3. Si pasó las validaciones (está logueado y tiene el rol correcto), muestra el componente hijo
  return children;
}

export default ProtectedRoute;