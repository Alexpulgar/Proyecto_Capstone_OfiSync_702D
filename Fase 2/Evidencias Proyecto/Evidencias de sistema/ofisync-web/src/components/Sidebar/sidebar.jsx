import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getUsuario, logout } from "../../../services/usuarioService";
import "./sidebar.css";

const allLinks = [
  {
    path: "/inicio",
    label: "Inicio",
    icon: "/img/icons/home.svg",
    allowedRoles: ["admin"],
  },
  {
    path: "/administracion",
    label: "Administración",
    icon: "/img/icons/admin.svg",
    allowedRoles: ["admin"],
  },
  {
    path: "/gastoComun",
    label: "Gasto Común",
    icon: "/img/icons/expenses.svg",
    allowedRoles: ["admin"],
  },
  {
    path: "/reservas",
    label: "Reservas",
    icon: "/img/icons/reservas.svg",
    allowedRoles: ["admin", "conserje"],
  },
  {
    path: "/cuentas",
    label: "Cuentas",
    icon: "/img/icons/accounts.svg",
    allowedRoles: ["admin"],
  },
  {
    path: "/bitacora",
    label: "Bitácora",
    icon: "/img/icons/info.svg",
    allowedRoles: ["admin", "conserje"],
  },
  {
    path: "/inventario/insumos",
    label: "Inventario",
    icon: "/img/icons/inventario.svg",
    allowedRoles: ["admin", "personalAseo"],
  },
  {
    path: "/revisar-pagos",
    label: "Revisar Pagos",
    icon: "/img/icons/voucher.svg",
    allowedRoles: ["admin"],
  },
];

function Sidebar() {
  const currentUser = getUsuario();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!currentUser) {
    return null;
  }

  const filteredLinks = allLinks.filter((link) =>
    link.allowedRoles.includes(currentUser.rol)
  );

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {filteredLinks.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <img src={link.icon} alt="" className="nav-icon" />
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="logout-section">
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
export default Sidebar;
