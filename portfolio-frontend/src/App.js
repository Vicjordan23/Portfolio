import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import TarjetasResumen from "./TarjetasResumen"; // Componente de tarjetas de resumen
import TablaActivos from "./TablaActivos"; // Componente de tabla de activos
import GraficoEvolucion from "./GraficoEvolucion"; // Gráfico de evolución de portafolio
import GraficoDistribucion from "./GraficoDistribucion"; // Nuevo gráfico de distribución
import RankingActivos from "./RankingActivos"; // Componente de ranking
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

  // El modo oscuro se gestiona a través de CSS, pero para este diseño se utiliza un tema claro por defecto.

  // Funciones auxiliares para los botones de acción. Actualmente muestran un mensaje.
  const handleAddActivo = () => {
    alert("Funcionalidad de añadir activo no implementada en esta demo");
  };

  const handleExportExcel = () => {
    alert("Funcionalidad de exportar a Excel no implementada en esta demo");
  };

  return (
    <div className="portfolio-wrapper">
      {/* Encabezado con gradiente y subtítulo */}
      <header className="portfolio-header-custom">
        <h1>Mi Portafolio de Inversión</h1>
        <p>Gestiona y visualiza tus inversiones en tiempo real</p>
      </header>

      {/* Tarjetas de resumen con bordes de colores */}
      {resumen && <TarjetasResumen resumen={resumen} />}

      {/* Botones de acción */}
      <div className="button-row">
        <button className="btn-primary" onClick={handleAddActivo}>
          ➕ Añadir Activo
        </button>
        <button className="btn-secondary" onClick={cargarDatos}>
          🔄 Actualizar
        </button>
        <button className="btn-success" onClick={handleExportExcel}>
          📥 Exportar a Excel
        </button>
      </div>

      {/* Gráficos */}
      <div className="chart-row">
        {resumen && (
          <GraficoEvolucion
            historial={resumen.historial || []}
            periodo="mes"
          />
        )}
        <GraficoDistribucion activos={assets} />
      </div>

      {/* Ranking de activos */}
      <RankingActivos activos={assets} />

      {/* Tabla de activos */}
      <TablaActivos
        activos={assets}
        calcularBeneficioDiario={calcularBeneficioDiario}
      />
    </div>
  );
}
