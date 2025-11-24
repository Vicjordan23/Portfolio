import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function GraficoEvolucion({ historial = [], periodo = "mes" }) {
  const tooltipFormatter = (valor) => `${Number(valor).toFixed(2)} €`;
  return (
    <div className="chart-block">
      <div className="chart-label">
        Evolución del portafolio
        <span style={{ fontSize: "0.8rem", opacity: 0.8 }}> ({periodo})</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={historial}>
          <CartesianGrid vertical={false} horizontal={false} />
          <XAxis dataKey="fecha" />
          <YAxis />
          <Tooltip formatter={tooltipFormatter} labelStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="ganancia_perdida_total"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 2 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
