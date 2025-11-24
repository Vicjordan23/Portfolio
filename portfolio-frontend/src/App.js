import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Resumen from "./Resumen";
import TablaActivos from "./TablaActivos";
import GraficoEvolucion from "./GraficoEvolucion";
import GraficoDistribucion from "./GraficoBeneficioDiario";
import "./App.css";

const API =
  (process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000") + "/api";

export default function App() {
  const [assets, setAssets] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [periodo, setPeriodo] = useState("mes");
  const [dark, setDark] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);

  // filtros/orden
  const [filterType, setFilterType] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [visibleCols, setVisibleCols] = useState({
    beneficioDiario: true,
    precioApertura: true,
    porcentajeCambio: true,
    isin: false,
  });

  // formulario
  const [form, setForm] = useState({
    nombre: "",
    ticker: "",
    tipo: "acción",
    cantidad: "",
    precio_compra: "",
    moneda_compra: "EUR",
    isin: "",
    fecha_compra: new Date().toISOString().split("T")[0],
  });

  const cargarDatos = useCallback(async () => {
    const { data } = await axios.get(`${API}/portfolio/summary`);
    setAssets(data.assets || []);
    setResumen(data.resumen || null);
  }, []);
  const cargarHistorial = useCallback(async () => {
    const { data } = await axios.get(
      `${API}/portfolio/history?periodo=${periodo}`
    );
    setHistorial(data || []);
  }, [periodo]);

  useEffect(() => {
    cargarDatos();
    cargarHistorial();
  }, [cargarDatos, cargarHistorial]);

  useEffect(() => {
    document.body.classList.toggle("dark-theme", dark);
  }, [dark]);

  // filtros y ordenación
  const filteredAssets = useMemo(() => {
    let datos = assets;
    if (filterType !== "todos") {
      datos = datos.filter((a) => a.tipo.toLowerCase() === filterType);
    }
    if (searchTerm.trim() !== "") {
      const termino = searchTerm.toLowerCase();
      datos = datos.filter(
        (a) =>
          a.nombre.toLowerCase().includes(termino) ||
          a.ticker.toLowerCase().includes(termino)
      );
    }
    if (sortConfig.key) {
      datos = [...datos].sort((a, b) => {
        let valorA = a[sortConfig.key];
        let valorB = b[sortConfig.key];
        if (valorA === undefined || valorA === null) valorA = 0;
        if (valorB === undefined || valorB === null) valorB = 0;
        if (typeof valorA === "string") valorA = valorA.toLowerCase();
        if (typeof valorB === "string") valorB = valorB.toLowerCase();
        if (valorA < valorB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valorA > valorB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return datos;
  }, [assets, filterType, searchTerm, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const resumenMetrics = useMemo(() => {
    if (!resumen) return [];
    return [
      { label: "Beneficio/Pérdida diaria", value: resumen.beneficio_diario ?? 0 },
      { label: "Valor total", value: resumen.valor_total_eur ?? 0 },
      { label: "Inversión realizada", value: resumen.inversion_total_eur ?? 0 },
      { label: "Ganancia/Pérdida", value: resumen.ganancia_perdida_total ?? 0 },
      { label: "Rendimiento", value: resumen.rendimiento_porcentaje ?? 0, isPercent: true },
      { label: "Número de activos", value: resumen.cantidad_activos ?? assets.length },
    ];
  }, [resumen, assets.length]);

  // CRUD
  const handleEditarActivo = (asset) => {
    setForm({
      nombre: asset.nombre,
      ticker: asset.ticker,
      tipo: asset.tipo,
      cantidad: asset.cantidad,
      precio_compra: asset.precio_compra,
      moneda_compra: asset.moneda_compra,
      isin: asset.isin || "",
      fecha_compra: asset.fecha_compra,
    });
    setEditando(asset.id);
    setMostrarForm(true);
  };
  const guardarActivo = async (e) => {
    e.preventDefault();
    const payload = {
      nombre: form.nombre,
      ticker: form.ticker,
      tipo: form.tipo,
      cantidad: parseFloat(form.cantidad),
      precio_compra: parseFloat(form.precio_compra),
      moneda_compra: form.moneda_compra,
      fecha_compra: form.fecha_compra,
      isin: form.isin.trim(),
    };
    if (editando) {
      await axios.put(`${API}/assets/${editando}`, payload);
    } else {
      await axios.post(`${API}/assets`, payload);
    }
    setForm({
      nombre: "",
      ticker: "",
      tipo: "acción",
      cantidad: "",
      precio_compra: "",
      moneda_compra: "EUR",
      isin: "",
      fecha_compra: new Date().toISOString().split("T")[0],
    });
    setMostrarForm(false);
    setEditando(null);
    cargarDatos();
  };
  const borrarActivo = async (id) => {
    await axios.delete(`${API}/assets/${id}`);
    cargarDatos();
  };

  const exportarCSV = async () => {
    const response = await axios.get(`${API}/export/csv`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "cartera.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="portfolio-bg">
      <div className="portfolio-container">
        <header className="portfolio-header">
          <div className="header-text">
            <h1 className="portfolio-title">Mi cartera de inversión</h1>
            <p className="portfolio-desc">
              Consulta y gestiona tus activos en tiempo real. Filtra,
              ordena y personaliza la vista según tus preferencias.
            </p>
          </div>
          <div className="header-right">
            <button
              onClick={() => setDark((d) => !d)}
              className="theme-toggle-btn"
              title="Cambiar tema"
            >
              {dark ? "🌙 Tema oscuro" : "☀️ Tema claro"}
            </button>
          </div>
        </header>

        <Resumen metrics={resumenMetrics} />

        <section className="filters-bar actions-row">
          <input
            type="text"
            placeholder="Buscar por nombre o ticker"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flexGrow: 1, minWidth: "200px" }}
          />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="acción">Acción</option>
            <option value="fondo">Fondo</option>
            <option value="ETF">ETF</option>
            <option value="cripto">Criptomoneda</option>
          </select>
          <button className="btn-secondary" onClick={exportarCSV}>
            Exportar CSV
          </button>
          <div className="period-selector">
            <span>Periodo:</span>
            <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              <option value="dia">Día</option>
              <option value="semana">Semana</option>
              <option value="mes">Mes</option>
              <option value="año">Año</option>
            </select>
          </div>
        </section>

        <section className="portfolio-charts">
          <GraficoEvolucion historial={historial} periodo={periodo} />
          <GraficoDistribucion activos={assets} />
        </section>

        <TablaActivos
          activos={filteredAssets}
          onSort={handleSort}
          sortConfig={sortConfig}
          visibleCols={visibleCols}
          onEdit={handleEditarActivo}
          onDelete={borrarActivo}
        />

        {mostrarForm && (
          <section className="form-section">
            <h2 className="form-title">
              {editando ? "Editar activo" : "Añadir nuevo activo"}
            </h2>
            <form className="asset-form" onSubmit={guardarActivo}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Nombre</label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Nombre"
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Ticker</label>
                  <input
                    name="ticker"
                    value={form.ticker}
                    onChange={(e) => setForm({ ...form, ticker: e.target.value })}
                    placeholder="Ticker"
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Tipo</label>
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
                </div>
                <div className="form-field">
                  <label>Cantidad</label>
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
                </div>
                <div className="form-field">
                  <label>Precio compra</label>
                  <input
                    name="precio_compra"
                    value={form.precio_compra}
                    onChange={(e) => setForm({ ...form, precio_compra: e.target.value })}
                    type="number"
                    step="0.01"
                    placeholder="Precio compra"
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Moneda</label>
                  <select
                    name="moneda_compra"
                    value={form.moneda_compra}
                    onChange={(e) =>
                      setForm({ ...form, moneda_compra: e.target.value })
                    }
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Fecha compra</label>
                  <input
                    name="fecha_compra"
                    value={form.fecha_compra}
                    onChange={(e) =>
                      setForm({ ...form, fecha_compra: e.target.value })
                    }
                    type="date"
                    required
                  />
                </div>
                <div className="form-field">
                  <label>ISIN (opcional)</label>
                  <input
                    name="isin"
                    value={form.isin}
                    onChange={(e) => setForm({ ...form, isin: e.target.value })}
                    placeholder="ISIN"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-main">
                  {editando ? "Guardar cambios" : "Guardar activo"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setMostrarForm(false);
                    setEditando(null);
                  }}
                >
                  Cerrar
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
