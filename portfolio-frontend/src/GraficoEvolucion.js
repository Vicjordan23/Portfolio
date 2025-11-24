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

export default function GraficoEvolucion({ historial = [], periodo }) {
  return (
    <div className="chart-block">
      <div className="chart-label">
        Evolución del portafolio
        <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>
          ({periodo})
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={historial}>
          <CartesianGrid vertical={false} horizontal={false} />
          <XAxis dataKey="fecha" />
          <YAxis />
          <Tooltip
            formatter={(v) => `${Number(v).toFixed(2)} €`}
            labelStyle={{ fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="ganancia_perdida_total"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
