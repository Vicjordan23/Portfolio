import React from "react";

const TarjetasResumen = ({ resumen }) => {
  // Extrae los valores de resumen asegurando que sean números válidos
  const valorTotal = Number(resumen.valorTotal ?? 0);
  const inversionRealizada = Number(resumen.inversionRealizada ?? 0);
  const gananciaPerdida = Number(resumen.gananciaPerdida ?? 0);
  const rendimiento = Number(resumen.rendimiento ?? 0);
  const activos = Number(resumen.activos ?? 0);

  // Definimos un arreglo de métricas con etiqueta, valor y si el valor es un porcentaje
  const metrics = [
    { label: "Valor Total", value: valorTotal, isPercent: false },
    { label: "Inversión Realizada", value: inversionRealizada, isPercent: false },
    { label: "Ganancia/Pérdida", value: gananciaPerdida, isPercent: false },
    { label: "Rendimiento", value: rendimiento, isPercent: true },
    { label: "Activos", value: activos, isPercent: false },
  ];

  // Clases para los bordes de cada tarjeta según su posición
  const borderClasses = [
    "border-blue",
    "border-purple",
    "border-pink",
    "border-orange",
    "border-teal",
  ];

  return (
    <div className="summary-cards-container">
      {metrics.map((m, i) => {
        const borderClass = borderClasses[i % borderClasses.length];
        // Formateamos el valor añadiendo símbolo de porcentaje si aplica
        const formattedValue = m.isPercent
          ? `${m.value.toFixed(2)} %`
          : `${m.value.toFixed(2)} €`;
        return (
          <div key={m.label} className={`summary-card ${borderClass}`}>
            <div className="summary-card-title">{m.label}</div>
            <div className="summary-card-value">
              {/* Indicador de subida o bajada */}
              {m.label !== "Activos" && (
                <span style={{ marginRight: 4 }}>
                  {m.value >= 0 ? "▲" : "▼"}
                </span>
              )}
              {formattedValue}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TarjetasResumen;
