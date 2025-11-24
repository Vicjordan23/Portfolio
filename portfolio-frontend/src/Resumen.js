import React from "react";

export default function Resumen({
  valorTotal,
  inversionRealizada,
  gananciaPerdida,
  rendimiento,
  activosNum,
  beneficioDiario,
}) {
  return (
    <section className="cards-row">
      <article className="portfolio-card border-teal">
        <div className="card-label">Beneficio/Pérdida Diaria</div>
        <div
          className={`card-value ${
            beneficioDiario >= 0 ? "green" : "red"
          }`}
        >
          {beneficioDiario >= 0 ? "+" : ""}
          {beneficioDiario.toFixed(2)} €
        </div>
      </article>

      <article className="portfolio-card border-indigo">
        <div className="card-label">Valor Total</div>
        <div className="card-value indigo">
          {parseInt(valorTotal || 0)} €
        </div>
      </article>

      <article className="portfolio-card border-purple">
        <div className="card-label">Inversión realizada</div>
        <div className="card-value purple">
          {parseInt(inversionRealizada || 0)} €
        </div>
      </article>

      <article className="portfolio-card border-pink">
        <div className="card-label">Ganancia / Pérdida</div>
        <div
          className={`card-value ${
            (gananciaPerdida || 0) >= 0 ? "green" : "red"
          }`}
        >
          {gananciaPerdida >= 0 ? "+" : ""}
          {parseInt(gananciaPerdida || 0)} €
        </div>
      </article>

      <article className="portfolio-card border-orange">
        <div className="card-label">Rendimiento</div>
        <div
          className={`card-value ${
            (rendimiento || 0) >= 0 ? "green" : "red"
          }`}
        >
          {Number(rendimiento || 0).toFixed(2)} %
        </div>
      </article>

      <article className="portfolio-card border-teal">
        <div className="card-label">Número de activos</div>
        <div className="card-value teal">{activosNum || 0}</div>
      </article>
    </section>
  );
}
