import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/sidebar";
import Inicio from "./pages/Inicio";
import Administracion from "./components/Administracion/Administracion"
import GastoComun from "./pages/GastoComun";
import Agregar from "./components/Agregar/Agregar";
import InventarioInsumos from "./pages/Inventario/Insumos";



function App() {
 
  return (
    <Router>
      <Header />
      <Sidebar />
      <main style={{ marginTop: "120px", marginLeft: "200px", padding: "20px",backgroundColor: "#d6d6d6ff" }}>
        <Routes>
          <Route path="/" element={<Inicio />} /> {/* Página de inicio */}
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/administracion" element={<Administracion />} />
          <Route path="/agregar" element={<Agregar />} />
          <Route path="/gastoComun" element={<GastoComun />} />
          <Route path="/inventario" element={<Navigate to="/inventario/insumos" replace />} />
          <Route path="/inventario/insumos" element={<InventarioInsumos />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
