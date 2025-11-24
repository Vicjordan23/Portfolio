import React from "react";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-dot"></span>
        VicFolio
      </div>

      <nav className="sidebar-nav">
        <button className="sidebar-chip active">
          <span>📊</span> Resumen
        </button>
        <button className="sidebar-chip">
          <span>📈</span> Activos
        </button>
        <button className="sidebar-chip">
          <span>📉</span> Gráficos
        </button>
        <button className="sidebar-chip">
          <span>⚙️</span> Configuración
        </button>
      </nav>

      <footer className="sidebar-footer">v1.0</footer>
    </aside>
  );
}
