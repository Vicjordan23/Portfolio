import React from "react";

function beneficioDiarioSeguro(asset) {
  if (
    asset.precio_apertura_eur === 0 ||
    asset.precio_apertura_eur === null ||
    asset.precio_apertura_eur === undefined
  ) {
    return 0;
  }
  return Number(asset.beneficio_diario || 0);
}

export default function TablaActivos({
  activos,
  onEdit,
  onDelete,
  cellFlashes = {},
}) {
  return (
    <section className="assets-section">
      <div className="assets-title">Detalle de activos</div>
      <div className="assets-desc">
        Consulta en detalle cada posición, su rendimiento y beneficio diario.
      </div>

      <table className="assets-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Ticker</th>
            <th>Tipo</th>
            <th>Beneficio/Pérdida diaria</th>
            <th>Cantidad</th>
            <th>Precio compra</th>
            <th>Precio apertura</th>
            <th>Precio actual</th>
            <th>Valor actual</th>
            <th>Ganancia/Pérdida</th>
            <th>% Cambio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {activos && activos.length > 0 ? (
            activos.map((asset) => {
              const beneficioDia = beneficioDiarioSeguro(asset);
              const valorActual =
                asset.valor_actual ??
                asset.cantidad * asset.precio_compra;
              const ganancia =
                typeof asset.ganancia_perdida === "number"
                  ? asset.ganancia_perdida
                  : valorActual - asset.cantidad * asset.precio_compra;
              const porcentajeCambio =
                typeof asset.porcentaje_cambio === "number"
                  ? asset.porcentaje_cambio
                  : (ganancia /
                      (asset.cantidad * asset.precio_compra || 1)) *
                    100;
              const colorGanancia = ganancia >= 0 ? "green" : "red";

              return (
                <tr key={asset.id}>
                  <td className="bold">{asset.nombre}</td>
                  <td className="ticker">{asset.ticker}</td>
                  <td>
                    <span className="asset-type">
                      {asset.tipo || "N/A"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        cellFlashes[`${asset.id}-beneficio_diario`] ||
                        ""
                      }
                    >
                      {beneficioDia.toFixed(2)} €
                    </span>
                  </td>
                  <td>{asset.cantidad}</td>
                  <td>{Number(asset.precio_compra).toFixed(3)} €</td>
                  <td>
                    {asset.precio_apertura_eur !== undefined &&
                    asset.precio_apertura_eur !== null
                      ? Number(asset.precio_apertura_eur).toFixed(3)
                      : "-"}{" "}
                    €
                  </td>
                  <td>
                    <span
                      className={
                        cellFlashes[
                          `${asset.id}-precio_actual_eur`
                        ] || ""
                      }
                    >
                      {asset.precio_actual_eur !== undefined &&
                      asset.precio_actual_eur !== null
                        ? Number(
                            asset.precio_actual_eur
                          ).toFixed(3)
                        : Number(
                            asset.precio_compra
                          ).toFixed(3)}{" "}
                      €
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        cellFlashes[`${asset.id}-valor_actual`] || ""
                      }
                      style={{ fontWeight: "bold" }}
                    >
                      {Number(valorActual).toFixed(2)} €
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        cellFlashes[
                          `${asset.id}-ganancia_perdida`
                        ] || colorGanancia
                      }
                    >
                      {ganancia >= 0 ? "+" : ""}
                      {ganancia.toFixed(2)} €
                    </span>
                  </td>
                  <td className={colorGanancia}>
                    {porcentajeCambio >= 0 ? "+" : ""}
                    {porcentajeCambio.toFixed(2)} %
                  </td>
                  <td>
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => onEdit && onEdit(asset)}
                      title="Editar activo"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() =>
                        onDelete && onDelete(asset.id)
                      }
                      title="Eliminar activo"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={12} style={{ padding: "12px 0" }}>
                No hay activos todavía. Añade el primero para empezar
                a ver estadísticas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
