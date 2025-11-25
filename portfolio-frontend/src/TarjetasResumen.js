import React from "react";

const TarjetasResumen = ({ resumen }) => {
  const { valorTotal, inversionRealizada, gananciaPerdida, rendimiento, activos } = resumen;

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
