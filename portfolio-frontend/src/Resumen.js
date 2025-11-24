import React, { useRef, useEffect, useState } from "react";

export default function Resumen({ metrics = [] }) {
  const prevValues = useRef({});
  const [flashes, setFlashes] = useState({});

  useEffect(() => {
    metrics.forEach((m, i) => {
      const old = prevValues.current[m.label];
      const now = m.value;

      if (old !== undefined && now !== old) {
        const flashClass =
          now > old ? "flash-green" : "flash-red";

        setFlashes((f) => ({ ...f, [m.label]: flashClass }));

        setTimeout(() => {
          setFlashes((f) => {
            const copy = { ...f };
            delete copy[m.label];
            return copy;
          });
        }, 3000);
      }

      prevValues.current[m.label] = now;
    });
  }, [metrics]);

  const borderClasses = [
    "border-teal",
    "border-indigo",
    "border-purple",
    "border-pink",
    "border-orange",
  ];

  return (
    <section className="cards-row">
      {metrics.map((m, i) => {
        const border = borderClasses[i % borderClasses.length];
        const flash = flashes[m.label] || "";

        const valueText = m.isPercent
          ? `${m.value.toFixed(2)} %`
          : `${m.value.toFixed(2)} €`;

        return (
          <article
            key={m.label}
            className={`portfolio-card ${border} ${flash}`}
          >
            <div className="card-label">{m.label}</div>
            <div className="card-value">
              {m.value >= 0 ? "▲ " : "▼ "}
              {valueText}
            </div>
          </article>
        );
      })}
    </section>
  );
}
