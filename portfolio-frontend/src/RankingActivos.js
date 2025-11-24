import React, { useMemo } from "react";

export default function RankingActivos({ activos = [] }) {
  const top = useMemo(() => {
    if (!activos.length) return [];
    return [...activos]
      .sort((a, b) => (b.ganancia_perdida || 0) - (a.ganancia_perdida || 0))
      .slice(0, 3);
  }, [activos]);

  if (!top.length) return null;

  return (
    <section className="ranking-section">
      <h3 className="ranking-title">Top 3 activos por rendimiento</h3>

      <div className="ranking-row">
        {top.map((a, idx) => {
          const gan = Number(a.ganancia_perdida || 0);
          const perc = Number(a.porcentaje_cambio || 0);

          const medal = ["🥇", "🥈", "🥉"][idx];
          const clase = gan >= 0 ? "green" : "red";

          return (
            <article key={a.id} className="ranking-card">
              <div className="ranking-medal">{medal}</div>
              <div className="ranking-info">
                <div className="ranking-ticker">{a.ticker}</div>
                <div className="ranking-name">{a.nombre}</div>
                <div className={`ranking-values ${clase}`}>
                  {gan >= 0 ? "+" : ""}
                  {gan.toFixed(2)} € ·{" "}
                  {perc >= 0 ? "+" : ""}
                  {perc.toFixed(2)}%
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
