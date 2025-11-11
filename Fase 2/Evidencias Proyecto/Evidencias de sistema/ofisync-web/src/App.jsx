import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Componentes Reutilizables
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/sidebar";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

// Componentes de Página
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

// Componente auxiliar para manejar Layout y Auth
function Layout() {
  const location = useLocation();

  // Decide si mostrar Header/Sidebar (en cualquier ruta EXCEPTO /login)
  const showHeaderSidebar = location.pathname !== "/login";

  const mainStyle = showHeaderSidebar
    ? {
        marginTop: "120px",
        marginLeft: "200px",
        padding: "20px",
        backgroundColor: "#d6d6d6ff",
      }
    : {
        padding: "0",
        margin: "0",
        backgroundColor: "#d6d6d6ff",
        minHeight: "100vh",
      };

  return (
    <>
      {showHeaderSidebar && <Header />}
      {showHeaderSidebar && <Sidebar />}

      <main style={mainStyle}>
        <Routes>
          {/* Ruta PÚBLICA de Login */}
          <Route path="/login" element={<Login />} />

          {/* --- RUTAS PROTEGIDAS --- */}

          {/* Inicio: Accesible para ambos roles logueados */}
          <Route
            path="/inicio"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Inicio />
              </ProtectedRoute>
            }
          />

          {/* Administración: Solo Admin */}
          <Route
            path="/administracion"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Administracion />
              </ProtectedRoute>
            }
          />

          {/* Agregar: Solo Admin */}
          <Route
            path="/agregar"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Agregar />
              </ProtectedRoute>
            }
          />

          {/* Actualizar: Solo Admin */}
          <Route
            path="/actualizar"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Actualizar />
              </ProtectedRoute>
            }
          />

          {/* Borrar: Solo Admin */}
          <Route
            path="/borrar"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Borrar />
              </ProtectedRoute>
            }
          />

          {/* Gasto Común: Solo Admin */}
          <Route
            path="/gastoComun"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <GastoComun />
              </ProtectedRoute>
            }
          />

          {/* Revisar Pagos: Solo Admin */}
          <Route
            path="/revisar-pagos"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <RevisarPagos />
              </ProtectedRoute>
            }
          />

          {/* Reservas: Admin y Conserje */}
          <Route
            path="/reservas"
            element={
              <ProtectedRoute allowedRoles={["admin", "conserje"]}>
                <Reservas />
              </ProtectedRoute>
            }
          />

          {/* Cuentas: Solo Admin */}
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
          {/* Ruta Catch-all al final */}
          {/* Si está logueado va a /inicio, si no, ProtectedRoute lo manda a /login */}
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

// Componente App principal
function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
