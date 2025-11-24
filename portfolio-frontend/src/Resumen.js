import React from "react";

/**
 * Componente que muestra un resumen de métricas clave de la cartera.
 * Cada métrica incluye una etiqueta, el valor numérico y un
 * indicador visual (flecha hacia arriba o hacia abajo) que señala si
 * el valor es positivo o negativo.
 */
export default function Resumen({ metrics = [] }) {
  const renderValue = (metric) => {
    const val = parseFloat(metric.value) || 0;
    const isPositive = val >= 0;
    const arrow = isPositive ? "▲" : "▼";
    const absVal = Math.abs(val);
    const text = metric.isPercent
      ? `${absVal.toFixed(2)} %`
      : `${absVal.toFixed(2)} €`;
    return (
      <span className={isPositive ? "green" : "red"}>
        {arrow} {text}
      </span>
    );
  };
  const borderClasses = [
    "border-teal",
    "border-indigo",
    "border-purple",
    "border-pink",
    "border-orange",
    "border-teal",
  ];
  return (
    <section className="cards-row">
      {metrics.map((metric, index) => {
        const borderClass = borderClasses[index % borderClasses.length];
        return (
          <article
            key={index}
            className={`portfolio-card ${borderClass}`}
            title={metric.label}
          >
            <div className="card-label">{metric.label}</div>
            <div className="card-value">{renderValue(metric)}</div>
          </article>
        );
      })}
    </section>
  );
}
