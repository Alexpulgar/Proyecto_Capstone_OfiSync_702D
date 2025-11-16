import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/sidebar";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

import Inicio from "./components/Inicio/Inicio";
import Administracion from "./components/Administracion/Administracion";
import GastoComun from "./components/GastoComun/GastoComun";
import Agregar from "./components/Agregar/Agregar";
import Actualizar from "./components/Actualizar/Actualizar";
import Borrar from "./components/Borrar/Borrar";
import Reservas from "./components/Reservas/Reservas";
import Cuentas from "./components/Cuentas/Cuentas";
import Login from "./components/Login/Login";
import Bitacora from "./components/Bitacora/Bitacora";
import InventarioInsumos from "./pages/Inventario/Insumos";
import RevisarPagos from "./components/GastoComun/RevisarPagos";

function Layout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const showHeaderSidebar = location.pathname !== "/login";

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 769) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const mainClassName = showHeaderSidebar
    ? "main-content"
    : "main-content-login";

  return (
    <>
      {showHeaderSidebar && <Header toggleSidebar={toggleSidebar} />}
      {showHeaderSidebar && (
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      )}

      <main className={mainClassName}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/inicio"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Inicio />
              </ProtectedRoute>
            }
          />

          <Route
            path="/administracion"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Administracion />
              </ProtectedRoute>
            }
          />

          <Route
            path="/agregar"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Agregar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/actualizar"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Actualizar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/borrar"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Borrar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gastoComun"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <GastoComun />
              </ProtectedRoute>
            }
          />

          <Route
            path="/revisar-pagos"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <RevisarPagos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reservas"
            element={
              <ProtectedRoute allowedRoles={["admin", "conserje"]}>
                <Reservas />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cuentas"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Cuentas />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bitacora"
            element={
              <ProtectedRoute allowedRoles={["admin", "conserje"]}>
                <Bitacora />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Navigate to="/inicio" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <ProtectedRoute allowedRoles={["conserje"]}>
                <Navigate to="/bitacora" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventario/insumos"
            element={
              <ProtectedRoute allowedRoles={["admin", "personalAseo"]}>
                <InventarioInsumos />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
