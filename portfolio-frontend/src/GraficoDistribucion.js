import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * Grafica la distribución del valor del portafolio por activo en un gráfico de sectores.
 * Recibe la lista de activos con sus valores actuales y calcula la proporción de cada uno.
 */
export default function GraficoDistribucion({ activos = [] }) {
  // Prepara los datos para la gráfica. Si no hay valor actual, se calcula multiplicando cantidad por precio de compra.
  const data = activos.map((a) => {
    const valor =
      a.valor_actual !== undefined && a.valor_actual !== null
        ? Number(a.valor_actual)
        : Number(a.cantidad) * Number(a.precio_compra);
    return {
      nombre: a.ticker || a.nombre,
      valor,
    };
  });

  // Colores predefinidos para los sectores. Se repiten en orden si hay más activos que colores.
  const COLORS = ["#2ecc71", "#e74c3c", "#f1c40f", "#9b59b6", "#3498db", "#e67e22", "#8e44ad"];

  return (
    <div className="chart-block">
      <div className="chart-label">Distribución por Activo</div>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            dataKey="valor"
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${Number(value).toFixed(2)} €`} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}