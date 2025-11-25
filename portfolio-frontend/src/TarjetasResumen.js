import React from "react";

const TarjetasResumen = ({ resumen }) => {
  // Asegúrate de que los valores sean números válidos antes de usar toFixed()
  const valorTotal = resumen.valorTotal ?? 0;
  const inversionRealizada = resumen.inversionRealizada ?? 0;
  const gananciaPerdida = resumen.gananciaPerdida ?? 0;
  const rendimiento = resumen.rendimiento ?? 0;
  const activos = resumen.activos ?? 0;

  return (
    <div className="card-container">
      <div className="card">
        <div className="title">Valor Total</div>
        <div className={`value ${valorTotal >= 0 ? "value-positive" : "value-negative"}`}>
          {valorTotal.toFixed(2)} €
        </div>
      </div>

      <div className="card">
        <div className="title">Inversión Realizada</div>
        <div className={`value ${inversionRealizada >= 0 ? "value-positive" : "value-negative"}`}>
          {inversionRealizada.toFixed(2)} €
        </div>
      </div>

      <div className="card">
        <div className="title">Ganancia/Pérdida</div>
        <div className={`value ${gananciaPerdida >= 0 ? "value-positive" : "value-negative"}`}>
          {gananciaPerdida.toFixed(2)} €
        </div>
      </div>

      <div className="card">
        <div className="title">Rendimiento</div>
        <div className={`value ${rendimiento >= 0 ? "value-positive" : "value-negative"}`}>
          {rendimiento.toFixed(2)} %
        </div>
      </div>

      <div className="card">
        <div className="title">Activos</div>
        <div className="value">{activos}</div>
      </div>
    </div>
  );
};

export default TarjetasResumen;
