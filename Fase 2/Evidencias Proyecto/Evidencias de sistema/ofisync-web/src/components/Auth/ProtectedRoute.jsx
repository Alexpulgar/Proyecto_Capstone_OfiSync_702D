import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getUsuario } from "../../../services/usuarioService"; // Ajusta la ruta si es necesario

function ProtectedRoute({ children, allowedRoles }) {
  const currentUser = getUsuario(); // Obtiene el usuario actual
  const location = useLocation(); // Para saber a qué página quería ir

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.rol)) {
    return <Navigate to="/inicio" replace />;
  }

  return children;
}

export default ProtectedRoute;
