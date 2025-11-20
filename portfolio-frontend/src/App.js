import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./App.css";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const API = (process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000") + "/api";
const PIE_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#eab308", "#22c55e", "#3b82f6", "#900fef"];

function App() {
  const [assets, setAssets] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [periodo, setPeriodo] = useState("mes");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [dark, setDark] = useState(true);
  const [form, setForm] = useState({
    nombre: "", ticker: "", tipo: "acción", cantidad: "", precio_compra: "",
    moneda_compra: "EUR", isin: "", fecha_compra: new Date().toISOString().split("T")[0],
  });

  const prevAssetValues = useRef({});
  const [cellFlashes, setCellFlashes] = useState({});

  useEffect(() => {
    document.body.classList.toggle("dark-theme", dark);
  }, [dark]);

  const cargarDatos = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/portfolio/summary`);
      setAssets(data.assets);
      setResumen(data.resumen);
    } catch (error) {
      alert(error.response?.data?.detail || error.message);
    }
  }, []);

  const cargarHistorial = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/portfolio/history?periodo=${periodo}`);
      setHistorial(data);
    } catch {}
  }, [periodo]);

  useEffect(() => {
    cargarDatos();
    cargarHistorial();
    const interval = setInterval(() => {
      cargarDatos();
      cargarHistorial();
    }, 60000);
    return () => clearInterval(interval);
  }, [periodo, cargarDatos, cargarHistorial]);

  useEffect(() => {
    assets.forEach(asset => {
      const prev = prevAssetValues.current[asset.id];
      ["valor_actual", "ganancia_perdida", "precio_actual_eur", "beneficio_diario"].forEach(key => {
        if (prev && prev[key] !== undefined && asset[key] !== undefined && asset[key] !== prev[key]) {
          const color = asset[key] > prev[key] ? "flash-green-text" : "flash-red-text";
          setCellFlashes(f => ({ ...f, [`${asset.id}-${key}`]: color }));
          setTimeout(() => {
            setCellFlashes(f => {
              let newFlashes = { ...f };
              delete newFlashes[`${asset.id}-${key}`];
              return newFlashes;
            });
          }, 3000);
        }
      });
      prevAssetValues.current[asset.id] = {
        valor_actual: asset.valor_actual,
        ganancia_perdida: asset.ganancia_perdida,
        precio_actual_eur: asset.precio_actual_eur,
        beneficio_diario: asset.beneficio_diario,
      };
    });
  }, [assets]);

  const handleEditarActivo = (asset) => {
    setForm({
      nombre: asset.nombre, ticker: asset.ticker,
      tipo: asset.tipo, cantidad: asset.cantidad,
      precio_compra: asset.precio_compra,
      moneda_compra: asset.moneda_compra,
      isin: asset.isin || "",
      fecha_compra: asset.fecha_compra
    });
    setEditando(asset.id);
    setMostrarForm(true);
  };

  const guardarActivo = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await axios.put(`${API}/assets/${editando}`, {
          nombre: form.nombre,
          ticker: form.ticker,
          tipo: form.tipo,
          cantidad: parseFloat(form.cantidad),
          precio_compra: parseFloat(form.precio_compra),
          moneda_compra: form.moneda_compra,
          fecha_compra: form.fecha_compra,
          isin: form.isin.trim(),
        });
      } else {
        await axios.post(`${API}/assets`, {
          nombre: form.nombre,
          ticker: form.ticker,
          tipo: form.tipo,
          cantidad: parseFloat(form.cantidad),
          precio_compra: parseFloat(form.precio_compra),
          moneda_compra: form.moneda_compra,
          fecha_compra: form.fecha_compra,
          isin: form.isin.trim(),
        });
      }
      setForm({
        nombre: "", ticker: "", tipo: "acción", cantidad: "",
        precio_compra: "", moneda_compra: "EUR", isin: "", fecha_compra: new Date().toISOString().split("T")[0],
      });
      setMostrarForm(false);
      setEditando(null);
      cargarDatos();
    } catch (error) {
      alert(error.response?.data?.detail || error.message);
    }
  };

  const borrarActivo = async (id) => {
    try {
      await axios.delete(`${API}/assets/${id}`);
      cargarDatos();
    } catch (error) {
      alert(error.response?.data?.detail || error.message);
    }
  };

  const exportarExcel = async () => {
    try {
      const response = await axios.get(`${API}/export/excel`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "cartera.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert(error.response?.data?.detail || error.message);
    }
  };

  const datosPie = assets.map((a, i) => ({
    name: a.nombre,
    value: a.valor_actual || a.cantidad * a.precio_compra,
    percentage: resumen ? (((a.valor_actual || a.cantidad * a.precio_compra) / resumen.valor_total_eur) * 100).toFixed(1) : 0,
  }));

  // Cálculo de Beneficio/Pérdida Diaria con apertura 0 o nulo = 0
  function beneficioDiarioSeguro(asset) {
    if (asset.precio_apertura_eur === 0 || asset.precio_apertura_eur === null || asset.precio_apertura_eur === undefined) {
      return 0;
    }
    return Number(asset.beneficio_diario);
  }

  const sumaBeneficioDiaria = assets.reduce(
    (acc, asset) => acc + beneficioDiarioSeguro(asset), 0
  );
  const sumaBeneficioDiariaRedondeada = sumaBeneficioDiaria.toFixed(2);

  return (
    <div className="portfolio-bg">
      <header className="portfolio-header">
        <div>
          <h1 className="portfolio-title">Mi Portafolio de Inversión</h1>
          <p className="portfolio-desc">Gestiona y visualiza tus inversiones en tiempo real</p>
        </div>
        <div className="header-right">
          <button onClick={() => setDark(d => !d)} className="theme-toggle-btn" title="Cambiar tema oscuro">
            {dark ? "🌙 Oscuro" : "☀️ Claro"}
          </button>
        </div>
      </header>
      <div className="cards-row">
        <div className="portfolio-card border-teal">
          <div className="card-label">Beneficio/Pérdida Diaria</div>
          <div className={`card-value ${sumaBeneficioDiariaRedondeada >= 0 ? "green" : "red"}`}>
            {sumaBeneficioDiariaRedondeada >= 0 ? "+" : ""}
            {sumaBeneficioDiariaRedondeada} €
          </div>
        </div>
        {resumen && <>
          <div className="portfolio-card border-indigo">
            <div className="card-label">Valor Total</div>
            <div className="card-value indigo">{parseInt(resumen.valor_total_eur)} €</div>
          </div>
          <div className="portfolio-card border-purple">
            <div className="card-label">Inversión Realizada</div>
            <div className="card-value purple">{parseInt(resumen.inversion_total_eur)} €</div>
          </div>
          <div className="portfolio-card border-pink">
            <div className="card-label">Ganancia/Pérdida</div>
            <div className={`card-value ${resumen.ganancia_perdida_total >=0 ? "green" : "red"}`}>
              {resumen.ganancia_perdida_total >= 0 ? "+" : ""}
              {parseInt(resumen.ganancia_perdida_total)} €
            </div>
          </div>
          <div className="portfolio-card border-orange">
            <div className="card-label">Rendimiento</div>
            <div className={`card-value ${resumen.rendimiento_porcentaje >= 0 ? "green" : "red"}`}>
              {Number(resumen.rendimiento_porcentaje).toFixed(2)}%
            </div>
          </div>
          <div className="portfolio-card border-teal">
            <div className="card-label">Activos</div>
            <div className="card-value teal">{resumen.cantidad_activos}</div>
          </div>
        </>}
      </div>

      <div className="assets-section">
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
                <td>{asset.ticker}</td>
                <td>
                  <span className={cellFlashes[`${asset.id}-beneficio_diario`] || ""}>
                    {beneficioDiarioSeguro(asset).toFixed(2)} €
                  </span>
                </td>
                <td>{asset.cantidad}</td>
                <td>{Number(asset.precio_compra).toFixed(3)} €</td>
                <td>
                  {asset.precio_apertura_eur !== undefined && asset.precio_apertura_eur !== null
                    ? Number(asset.precio_apertura_eur).toFixed(3)
                    : "-"} €
                </td>
                <td>
                  <span className={cellFlashes[`${asset.id}-precio_actual_eur`] || ""}>
                  {asset.precio_actual_eur !== undefined && asset.precio_actual_eur !== null
                    ? Number(asset.precio_actual_eur).toFixed(3)
                    : Number(asset.precio_compra).toFixed(3)} €
                  </span>
                </td>
                <td>
                  <span className={cellFlashes[`${asset.id}-valor_actual`] || ""}>
                  {asset.valor_actual !== undefined && asset.valor_actual !== null
                    ? Number(asset.valor_actual).toFixed(2)
                    : (asset.cantidad * asset.precio_compra).toFixed(2)} €
                  </span>
                </td>
                <td>
                  <span className={cellFlashes[`${asset.id}-ganancia_perdida`] || ""}>
                    {asset.ganancia_perdida >= 0 ? "+" : ""}
                    {Number(asset.ganancia_perdida).toFixed(2)} €
                  </span>
                </td>
                <td>
                  {asset.porcentaje_cambio >= 0 ? "+" : ""}
                  {Number(asset.porcentaje_cambio).toFixed(2)} %
                </td>
                <td>
                  <button onClick={() => handleEditarActivo(asset)}>✎</button>
                  <button onClick={() => borrarActivo(asset.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* ...resto de charts y formulario... */}
      <div className="portfolio-actions actions-row">
        <button
          className="btn-main"
          onClick={() => { setMostrarForm(!mostrarForm); setEditando(null); }}
        >
          {mostrarForm ? "Cancelar" : "+ Añadir Activo"}
        </button>
        <button className="btn-secondary" onClick={cargarDatos}>
          Actualizar
        </button>
        <button className="btn-secondary" onClick={exportarExcel}>
          Exportar a Excel
        </button>
      </div>
      <div className="portfolio-charts">
        <div className="chart-block">
          <div className="chart-label chart-label-white">
            Evolución del Portafolio
            <span className="chart-dropdown">
              <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                <option value="dia">Día</option>
                <option value="semana">Semana</option>
                <option value="mes">Mes</option>
                <option value="año">Año</option>
              </select>
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={historial}>
              <CartesianGrid vertical={false} horizontal={false} />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip formatter={(v) => `${Number(v).toFixed(2)} €`} />
              <Line
                type="monotone"
                dataKey="ganancia_perdida_total"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: "#6366f1", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-block">
          <div className="chart-label chart-label-white">Distribución por Activo</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={datosPie}
                cx="50%"
                cy="50%"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {datosPie.map((d, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {mostrarForm && (
        <form className="asset-form" onSubmit={guardarActivo}>
          <input
            name="nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Nombre"
            required
          />
          <input
            name="ticker"
            value={form.ticker}
            onChange={(e) => setForm({ ...form, ticker: e.target.value })}
            placeholder="Ticker"
            required
          />
          <select
            name="tipo"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            required
          >
            <option value="acción">Acción</option>
            <option value="fondo">Fondo</option>
            <option value="ETF">ETF</option>
            <option value="cripto">Criptomoneda</option>
          </select>
          <input
            name="cantidad"
            value={form.cantidad}
            onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
            type="number"
            step="0.01"
            min="0"
            placeholder="Cantidad"
            required
          />
          <input
            name="precio_compra"
            value={form.precio_compra}
            onChange={(e) => setForm({ ...form, precio_compra: e.target.value })}
            type="number"
            step="0.01"
            placeholder="Precio compra"
            required
          />
          <select
            name="moneda_compra"
            value={form.moneda_compra}
            onChange={(e) => setForm({ ...form, moneda_compra: e.target.value })}
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
          </select>
          <input
            name="fecha_compra"
            value={form.fecha_compra}
            onChange={(e) => setForm({ ...form, fecha_compra: e.target.value })}
            type="date"
            required
          />
          <input
            name="isin"
            value={form.isin}
            onChange={(e) => setForm({ ...form, isin: e.target.value })}
            placeholder="ISIN (opcional)"
          />
          <button type="submit" className="btn-main">
            {editando ? "Guardar cambios" : "Guardar activo"}
          </button>
        </form>
      )}
    </div>
  );
}

export default App;
