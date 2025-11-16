import React from "react";
import { getUsuario } from "../../../services/usuarioService";
import "./Header.css";

function Header() {
  const currentUser = getUsuario();

  if (!currentUser) {
    return null;
  }

  return (
    <header className="header">
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
