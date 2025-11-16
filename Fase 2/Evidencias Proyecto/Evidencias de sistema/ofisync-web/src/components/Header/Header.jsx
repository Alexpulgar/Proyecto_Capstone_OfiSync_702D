import React from "react";
import { getUsuario } from "../../../services/usuarioService";
import "./Header.css";

function Header({ toggleSidebar }) {
  const currentUser = getUsuario();

  if (!currentUser) {
    return null;
  }

  return (
    <header className="header">
      <button
        className="hamburger-menu"
        onClick={toggleSidebar}
        aria-label="Abrir menú"
      >
        &#9776;
      </button>

      <div className="logo">
        <img src="/img/LogoOfisync.png" alt="" />
        <h2>Ofisync</h2>
      </div>
      <div className="perfil">
        <h2>
          {currentUser.nombre_usuario} ({currentUser.rol})
        </h2>
        <img src="/img/usuario.png" alt="" />
      </div>
    </header>
  );
}

export default Header;
