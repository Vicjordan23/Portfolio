import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function GraficoBeneficioDiario({ activos = [] }) {
  const data = activos.map((a) => {
    const valor =
      a.valor_actual !== undefined && a.valor_actual !== null
        ? Number(a.valor_actual)
        : Number(a.cantidad) * Number(a.precio_compra);
    const beneficio =
      typeof a.beneficio_diario === "number" ? Number(a.beneficio_diario) : 0;
    return {
      nombre: a.ticker || a.nombre,
      valor,
      beneficio,
    };
  });
  return (
    <div className="chart-block">
      <div className="chart-label">Distribución y beneficio diario</div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="nombre" tick={{ fontSize: 10 }} />
          <YAxis />
          <Tooltip
            formatter={(value) =>
              `${Number(value).toFixed(2)} €`
            }
          />
          <Legend verticalAlign="top" height={24} />
          <Bar dataKey="valor" name="Valor" fill="#6366f1" />
          <Bar dataKey="beneficio" name="Beneficio diario" fill="#ec4899" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
