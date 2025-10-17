import React from "react";
// Importa NavLink para detectar la ruta activa
import { NavLink } from "react-router-dom";
import "./sidebar.css";

// Un componente simple para los iconos (puedes reemplazarlo con una librería como React Icons)
const Icon = ({ src }) => <img src={src} alt="" className="nav-icon" />;

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            <NavLink to="/Inicio" className={({ isActive }) => (isActive ? "active" : "")}>
              <Icon src="/img/icons/home.svg" />
              <span>Inicio</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
              <Icon src="/img/icons/dashboard.svg" />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/Administracion" className={({ isActive }) => (isActive ? "active" : "")}>
              <Icon src="/img/icons/admin.svg" />
              <span>Administración</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/cuentas" className={({ isActive }) => (isActive ? "active" : "")}>
              <Icon src="/img/icons/accounts.svg" />
              <span>Cuentas</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/GastoComun" className={({ isActive }) => (isActive ? "active" : "")}>
              <Icon src="/img/icons/expenses.svg" />
              <span>Gasto Común</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/informacion" className={({ isActive }) => (isActive ? "active" : "")}>
              <Icon src="/img/icons/info.svg" />
              <span>Información</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      
    </aside>
  );
}

export default Sidebar;