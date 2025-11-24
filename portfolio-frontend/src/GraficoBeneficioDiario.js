import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

export default function GraficoBeneficioDiario({ activos = [] }) {
  const data = activos.map((a) => ({
    nombre: a.ticker || a.nombre,
    beneficio: beneficioDiarioSeguro(a),
  }));

  return (
    <div className="chart-block">
      <div className="chart-label">Beneficio/Pérdida diaria por activo</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis dataKey="nombre" />
          <YAxis />
          <Tooltip
            formatter={(v) => `${Number(v).toFixed(2)} €`}
            labelStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="beneficio" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
