import React from "react";

/**
 * Vista alternativa en formato tarjetas para los activos.
 */
export default function ActivosCards({ activos = [], onEdit, onDelete }) {
  if (!activos.length) {
    return (
      <section className="assets-section">
        <div className="assets-title">Activos</div>
        <p className="assets-desc">
          No hay activos para mostrar con los filtros actuales.
        </p>
      </section>
    );
  }

  return (
    <section className="assets-section cards-view">
      <div className="assets-title">Activos (vista tarjetas)</div>
      <div className="assets-desc">
        Vista compacta para explorar rápidamente cada posición.
      </div>
      <div className="cards-grid-activos">
        {activos.map((a) => {
          const gan = Number(a.ganancia_perdida || 0);
          const perc = Number(a.porcentaje_cambio || 0);
          const clase = gan >= 0 ? "green" : "red";
          return (
            <article key={a.id} className="activo-card">
              <header className="activo-card-header">
                <div>
                  <div className="activo-ticker">{a.ticker}</div>
                  <div className="activo-nombre">{a.nombre}</div>
                </div>
                <span className="activo-tipo">{a.tipo}</span>
              </header>
              <div className="activo-body">
                <div className="activo-row">
                  <span>Cantidad</span>
                  <span>{a.cantidad}</span>
                </div>
                <div className="activo-row">
                  <span>Precio compra</span>
                  <span>{Number(a.precio_compra).toFixed(3)} €</span>
                </div>
                <div className="activo-row">
                  <span>Precio actual</span>
                  <span>
                    {(a.precio_actual_eur ?? a.precio_compra).toFixed(3)} €
                  </span>
                </div>
                <div className="activo-row">
                  <span>Valor actual</span>
                  <span>
                    {(a.valor_actual ??
                      a.cantidad * a.precio_compra
                    ).toFixed(2)}{" "}
                    €
                  </span>
                </div>
                <div className="activo-row">
                  <span>Ganancia/Pérdida</span>
                  <span className={clase}>
                    {gan >= 0 ? "+" : ""}
                    {gan.toFixed(2)} €
                  </span>
                </div>
                <div className="activo-row">
                  <span>% cambio</span>
                  <span className={clase}>
                    {perc >= 0 ? "+" : ""}
                    {perc.toFixed(2)} %
                  </span>
                </div>
              </div>
              <footer className="activo-footer">
                <button
                  type="button"
                  className="edit-btn"
                  onClick={() => onEdit && onEdit(a)}
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => onDelete && onDelete(a.id)}
                >
                  🗑️
                </button>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}
