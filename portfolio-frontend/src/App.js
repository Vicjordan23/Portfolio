import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import TarjetasResumen from "./TarjetasResumen"; // Componente de tarjetas
import TablaActivos from "./TablaActivos"; // Componente de tabla
import "./App.css";

const API =
  (process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000") + "/api";

// Función para calcular el beneficio diario
const calcularBeneficioDiario = (activo) => {
  if (activo.precio_apertura === 0) {
    return 0; // Si el precio de apertura es 0, el beneficio es 0
  }
  return (activo.precio_actual - activo.precio_apertura) * activo.cantidad;
};

export default function App() {
  const [assets, setAssets] = useState([]);
  const [resumen, setResumen] = useState(null);

  // Modo oscuro
  const [darkMode, setDarkMode] = useState(true); // Por defecto, activar el modo oscuro

  // Carga de datos con cache local (offline básico)
  const cargarDatos = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/portfolio/summary`);
      setAssets(data.assets || []);
      setResumen(data.resumen || null);
    } catch (error) {
      console.error("Error cargando los datos", error);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    document.body.classList.toggle("dark-theme", darkMode);
  }, [darkMode]);

  return (
    <div className={`portfolio-bg ${darkMode ? "dark" : ""}`}>
      <div className="app-shell">
        <div className="portfolio-container">
          <h1>Mi cartera de inversión</h1>

          {/* Tarjetas de resumen */}
          {resumen && <TarjetasResumen resumen={resumen} />}

          {/* Tabla de activos */}
          <TablaActivos activos={assets} calcularBeneficioDiario={calcularBeneficioDiario} />
        </div>
      </div>
    </div>
  );
}
