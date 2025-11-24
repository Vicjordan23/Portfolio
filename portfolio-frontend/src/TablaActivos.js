import React from "react";

/**
 * TablaActivos muestra una lista de activos con ordenación,
 * columnas opcionales y acciones de edición/borrado.
 */
export default function TablaActivos({
  activos = [],
  onSort = () => {},
  sortConfig = { key: "", direction: "asc" },
  visibleCols = {},
  onEdit = () => {},
  onDelete = () => {},
}) {
  const columnas = [
    { key: "nombre", label: "Nombre" },
    { key: "ticker", label: "Ticker" },
    { key: "tipo", label: "Tipo" },
    { key: "cantidad", label: "Cantidad" },
    { key: "precio_compra", label: "Precio compra" },
    { key: "precio_apertura_eur", label: "Precio apertura", optional: "precioApertura" },
    { key: "precio_actual_eur", label: "Precio actual" },
    { key: "valor_actual", label: "Valor actual" },
    { key: "ganancia_perdida", label: "Ganancia/Pérdida" },
    { key: "porcentaje_cambio", label: "% cambio", optional: "porcentajeCambio" },
    { key: "beneficio_diario", label: "Beneficio diario", optional: "beneficioDiario" },
    { key: "isin", label: "ISIN", optional: "isin" },
  ];

  const renderHeader = (col) => {
    if (col.optional && visibleCols[col.optional] === false) return null;
    const isSorted = sortConfig.key === col.key;
    const arrow = isSorted
      ? sortConfig.direction === "asc"
        ? "▲"
        : "▼"
      : "";
    return (
      <th
        key={col.key}
        onClick={() => onSort(col.key)}
        style={{ cursor: "pointer" }}
      >
        {col.label} {arrow}
      </th>
    );
  };

  const renderRow = (asset) => {
    return (
      <tr key={asset.id}>
        {columnas.map((col) => {
          if (col.optional && visibleCols[col.optional] === false) {
            return null;
          }
          let value = asset[col.key];
          if (
            col.key === "precio_compra" ||
            col.key === "precio_actual_eur" ||
            col.key === "precio_apertura_eur"
          ) {
            value =
              value !== undefined && value !== null
                ? Number(value).toFixed(3) + " €"
                : "-";
          } else if (col.key === "valor_actual") {
            value =
              value !== undefined && value !== null
                ? Number(value).toFixed(2) + " €"
                : "-";
          } else if (col.key === "ganancia_perdida") {
            const num = Number(value) || 0;
            const sign = num >= 0 ? "+" : "";
            value = `${sign}${num.toFixed(2)} €`;
          } else if (col.key === "porcentaje_cambio") {
            const num = Number(value) || 0;
            const sign = num >= 0 ? "+" : "";
            value = `${sign}${num.toFixed(2)} %`;
          } else if (col.key === "beneficio_diario") {
            const num = Number(value) || 0;
            const sign = num >= 0 ? "+" : "";
            value = `${sign}${num.toFixed(2)} €`;
          }
          const positiveKeys = ["ganancia_perdida", "porcentaje_cambio", "beneficio_diario"];
          const className = positiveKeys.includes(col.key)
            ? Number(asset[col.key]) >= 0
              ? "green"
              : "red"
            : "";
          return <td key={col.key} className={className}>{value}</td>;
        })}
        <td>
          <button
            type="button"
            className="edit-btn"
            onClick={() => onEdit(asset)}
            title="Editar"
          >
            ✎
          </button>
          <button
            type="button"
            className="delete-btn"
            onClick={() => onDelete(asset.id)}
            title="Eliminar"
          >
            🗑️
          </button>
        </td>
      </tr>
    );
  };

  return (
    <section className="assets-section">
      <div className="assets-title">Detalle de activos</div>
      <div className="assets-desc">
        Haz clic en los encabezados para ordenar. Utiliza los filtros
        superiores para buscar y acotar resultados.
      </div>
      <div className="assets-table-wrapper">
        <table className="assets-table">
          <thead>
            <tr>
              {columnas.map(renderHeader)}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {activos && activos.length > 0 ? (
              activos.map(renderRow)
            ) : (
              <tr>
                <td colSpan={columnas.length + 1} className="empty-row">
                  No hay activos que cumplan los criterios seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
