import React from "react";

export default function AssetTable({ assets, cellFlashes, onEdit, onDelete }) {
  return (
    <table className="assets-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Ticker</th>
          <th>Beneficio/Pérdida Diaria</th>
          <th>Cantidad</th>
          <th>Precio Compra</th>
          <th>Precio Apertura</th>
          <th>Precio Actual</th>
          <th>Valor Actual</th>
          <th>Ganancia/Pérdida</th>
          <th>% Cambio</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {assets.map((asset) => (
          <tr key={asset.id}>
            <td>{asset.nombre}</td>
            <td className="ticker">{asset.ticker}</td>
            <td className={cellFlashes[`${asset.id}-beneficio_diario`] || ""}>
              {asset.beneficio_diario >= 0 ? "+" : ""}
              {asset.beneficio_diario !== undefined
                ? asset.beneficio_diario.toFixed(2)
                : "0.00"} €
            </td>
            <td>{asset.cantidad}</td>
            <td>
              {asset.precio_compra_eur
                ? asset.precio_compra_eur.toFixed(2)
                : asset.precio_compra.toFixed(2)} €
            </td>
            <td>
              {asset.precio_apertura_eur
                ? asset.precio_apertura_eur.toFixed(2)
                : "-"} €
            </td>
            <td>
              {asset.precio_actual_eur
                ? asset.ticker === "NXT.MC"
                ? asset.precio_actual_eur.toFixed(3)
                : asset.precio_actual_eur.toFixed(2)
              : asset.ticker === "NXT.MC"
                ? asset.precio_compra.toFixed(3)
                : asset.precio_compra.toFixed(2)
              } €
            </td>

            <td className={"bold " + (cellFlashes[`${asset.id}-valor_actual`] || "")}>
              {asset.valor_actual
                ? asset.valor_actual.toFixed(2)
                : (asset.cantidad * asset.precio_compra).toFixed(2)} €
            </td>
            <td
              className={
                (asset.ganancia_perdida >= 0 ? "green bold " : "red bold ") +
                (cellFlashes[`${asset.id}-ganancia_perdida`] || "")
              }
            >
              {asset.ganancia_perdida >= 0 ? "+" : ""}
              {asset.ganancia_perdida !== undefined
                ? asset.ganancia_perdida.toFixed(2)
                : "0.00"} €
            </td>
            <td className={asset.porcentaje_cambio >= 0 ? "green bold" : "red bold"}>
              {asset.porcentaje_cambio >= 0 ? "+" : ""}
              {asset.porcentaje_cambio !== undefined
                ? asset.porcentaje_cambio.toFixed(2)
                : "0.00"}
              %
            </td>
            <td>
              <button
                className="edit-btn"
                title="Editar"
                onClick={() => onEdit(asset)}
                style={{ marginRight: "6px" }}
              >
                ✎
              </button>
              <button
                className="delete-btn"
                title="Eliminar"
                onClick={() => onDelete(asset.id)}
              >
                🗑️
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
