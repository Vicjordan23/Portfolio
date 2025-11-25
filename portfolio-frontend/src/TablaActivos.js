import React from "react";

// Componente TablaActivos
const TablaActivos = ({ activos, calcularBeneficioDiario }) => {
  return (
    <table className="assets-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Ticker</th>
          <th>Tipo</th>
          <th>Cantidad</th>
          <th>Precio compra</th>
          <th>Precio actual</th>
          <th>Precio apertura</th>
          <th>Beneficio diario</th>
          <th>% cambio</th>
        </tr>
      </thead>
      <tbody>
        {activos.map((activo) => {
          const beneficioDiario = calcularBeneficioDiario(activo);
          return (
            <tr key={activo.id}>
              <td>{activo.nombre}</td>
              <td>{activo.ticker}</td>
              <td>{activo.tipo}</td>
              <td>{activo.cantidad}</td>
              <td>{activo.precio_compra} €</td>
              <td>{activo.precio_actual} €</td>
              <td>{activo.precio_apertura} €</td>
              <td>{beneficioDiario} €</td>
              <td>{activo.porcentaje_cambio}%</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TablaActivos;
