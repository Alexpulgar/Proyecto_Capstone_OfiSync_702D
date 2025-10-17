// src/components/Header.jsx
import React from "react";
import "./Header.css"; // Aquí pondremos el estilo


function Header() {
  return (
    <header className="header">
      <div className="logo">
        <img src="/img/LogoOfisync.png" alt="" />
        <h2>Ofisync</h2>
      </div>
      
      <div className="perfil">
        <h2>Admin</h2>
        <img src="/img/usuario.png" alt="" />
      </div>
      
    </header>
  );
}

export default Header;