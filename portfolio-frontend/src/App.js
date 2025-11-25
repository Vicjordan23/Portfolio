import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Resumen from "./Resumen";
import TablaActivos from "./TablaActivos";
import GraficoEvolucion from "./GraficoEvolucion";
import GraficoDistribucion from "./GraficoBeneficioDiario";
import Sidebar from "./Sidebar";
import RankingActivos from "./RankingActivos";
import ActivosCards from "./ActivosCards";
import "./App.css";

const API =
  (process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000") + "/api";

export default function App() {
  // Estado para el modo oscuro
  const [darkMode, setDarkMode] = useState(false);

  // Función para activar o desactivar el modo oscuro
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Aplicar modo oscuro o claro al cargar y cambiar el estado
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]); // Cada vez que darkMode cambie, aplica la clase correspondiente

  // Activar modo oscuro por defecto al cargar la página
  useEffect(() => {
    setDarkMode(true); // Activar modo oscuro por defecto
  }, []);

  const [assets, setAssets] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [periodo, setPeriodo] = useState("mes");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);

  // Modos de vista
  const [compactMode, setCompactMode] = useState(false);
  const [viewMode, setViewMode] = useState("tabla"); // "tabla" | "tarjetas"

  // Filtros
  const [filterType, setFilterType] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [gainFilter, setGainFilter] = useState("todos"); // "todos" | "ganando" | "perdiendo"
  const [minChange, setMinChange] = useState("");
  const [maxChange, setMaxChange] = useState("");

  // Orden tabla
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  // Columnas opcionales
  const [visibleCols] = useState({
    beneficioDiario: true,
    precioApertura: true,
    porcentajeCambio: true,
    isin: false,
  });

  // Formulario
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

  // Carga de datos con cache local (offline básico)
  const cargarDatos = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/portfolio/summary`);
      setAssets(data.assets || []);
      setResumen(data.resumen || null);
      localStorage.setItem("vicfolio_last_data", JSON.stringify(data));
    } catch (error) {
      console.error("Error cargando datos remotos, intentando cache local", error);
      const cached = localStorage.getItem("vicfolio_last_data");
      if (cached) {
        const data = JSON.parse(cached);
        setAssets(data.assets || []);
        setResumen(data.resumen || null);
      }
    }
  }, []);

  const cargarHistorial = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${API}/portfolio/history?periodo=${periodo}`
      );
      setHistorial(data || []);
    } catch (error) {
      console.error("Error cargando historial", error);
    }
  }, [periodo]);

  useEffect(() => {
    cargarDatos();
    cargarHistorial();
  }, [cargarDatos, cargarHistorial]);

  useEffect(() => {
    document.body.classList.toggle("dark-theme", darkMode);
  }, [darkMode]);

  // Filtros + ordenación
  const filteredAssets = useMemo(() => {
    let datos = [...assets];

    if (filterType !== "todos") {
      datos = datos.filter((a) => a.tipo.toLowerCase() === filterType);
    }

    if (gainFilter === "ganando") {
      datos = datos.filter((a) => (a.ganancia_perdida || 0) > 0);
    } else if (gainFilter === "perdiendo") {
      datos = datos.filter((a) => (a.ganancia_perdida || 0) < 0);
    }

    if (searchTerm.trim() !== "") {
      const termino = searchTerm.toLowerCase();
      datos = datos.filter(
        (a) =>
          a.nombre.toLowerCase().includes(termino) ||
          a.ticker.toLowerCase().includes(termino)
      );
    }

    const minVal = minChange !== "" ? parseFloat(minChange) : null;
    const maxVal = maxChange !== "" ? parseFloat(maxChange) : null;

    if (minVal !== null) {
      datos = datos.filter(
        (a) => (a.porcentaje_cambio ?? 0) >= minVal
      );
    }
    if (maxVal !== null) {
      datos = datos.filter(
        (a) => (a.porcentaje_cambio ?? 0) <= maxVal
      );
    }

    if (sortConfig.key) {
      datos.sort((a, b) => {
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
  }, [assets, filterType, gainFilter, searchTerm, minChange, maxChange, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Métricas para el resumen
  const resumenMetrics = useMemo(() => {
    if (!resumen) return [];
    return [
      {
        label: "Beneficio/Pérdida diaria",
        value: resumen.beneficio_diario ?? 0,
      },
      {
        label: "Valor total",
        value: resumen.valor_total_eur ?? 0,
      },
      {
        label: "Inversión realizada",
        value: resumen.inversion_total_eur ?? 0,
      },
      {
        label: "Ganancia/Pérdida",
        value: resumen.ganancia_perdida_total ?? 0,
      },
      {
        label: "Rendimiento",
        value: resumen.rendimiento_porcentaje ?? 0,
        isPercent: true,
      },
      {
        label: "Número de activos",
        value: resumen.cantidad_activos ?? assets.length,
      },
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
      nombre: form.nombre.trim(),
      ticker: form.ticker.trim(),
      tipo: form.tipo,
      cantidad: parseFloat(form.cantidad),
      precio_compra: parseFloat(form.precio_compra),
      moneda_compra: form.moneda_compra,
      fecha_compra: form.fecha_compra,
      isin: form.isin.trim(),
    };

    try {
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
    } catch (error) {
      alert(error.response?.data?.detail || "Error guardando activo");
    }
  };

  const borrarActivo = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este activo?")) return;
    try {
      await axios.delete(`${API}/assets/${id}`);
      cargarDatos();
    } catch (error) {
      alert(error.response?.data?.detail || "Error borrando activo");
    }
  };

  const exportarCSV = async () => {
    try {
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
    } catch (error) {
      alert("No se pudo exportar CSV");
    }
  };

  // Función para copiar la tabla al portapapeles
  const copiarTablaPortapapeles = (assets) => {
    if (!assets.length) return;
    const headers = [
      "Nombre",
      "Ticker",
      "Tipo",
      "Cantidad",
      "Precio compra",
      "Precio actual",
      "Valor actual",
      "Ganancia/Pérdida",
      "% cambio",
    ];
    const rows = assets.map((a) => [
      a.nombre,
      a.ticker,
      a.tipo,
      a.cantidad,
      a.precio_compra,
      a.precio_actual_eur,
      a.valor_actual,
      a.ganancia_perdida,
      a.porcentaje_cambio,
    ]);
    const texto = [headers, ...rows].map((row) => row.join("\t")).join("\n");
    navigator.clipboard.writeText(texto).then(
      () => alert("Tabla copiada al portapapeles"),
      () => alert("No se pudo copiar la tabla")
    );
  };

  return (
    <div className={`portfolio-bg ${compactMode ? "compact" : ""}`}>
      <div className="app-shell">
        <Sidebar />

        <div className="portfolio-container">
          <header className="portfolio-header">
            <div className="header-text">
              <h1 className="portfolio-title">Mi cartera de inversión</h1>
              <p className="portfolio-desc">
                Consulta y gestiona tus activos en tiempo real. Filtra, ordena y
                personaliza la vista según tus preferencias.
              </p>
            </div>
            <div className="header-right">
              <button
                onClick={() => setCompactMode((c) => !c)}
                className="theme-toggle-btn"
                title="Cambiar modo compacto"
              >
                {compactMode ? "🔎 Modo normal" : "🧱 Modo compacto"}
              </button>
              <button
                onClick={toggleDarkMode}
                className="theme-toggle-btn"
                title="Cambiar tema"
              >
                {darkMode ? "🌙 Oscuro" : "☀️ Claro"}
              </button>
            </div>
          </header>

          <Resumen metrics={resumenMetrics} />

          <RankingActivos activos={assets} />

          {viewMode === "tabla" ? (
            <TablaActivos
              activos={filteredAssets}
              onSort={handleSort}
              sortConfig={sortConfig}
              visibleCols={visibleCols}
              onEdit={handleEditarActivo}
              onDelete={borrarActivo}
            />
          ) : (
            <ActivosCards
              activos={filteredAssets}
              onEdit={handleEditarActivo}
              onDelete={borrarActivo}
            />
          )}

          <section className="filters-bar actions-row">
            <input
              type="text"
              placeholder="Buscar por nombre o ticker"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flexGrow: 1, minWidth: "200px" }}
            />

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="acción">Acción</option>
              <option value="fondo">Fondo</option>
              <option value="ETF">ETF</option>
              <option value="cripto">Criptomoneda</option>
            </select>

            <select
              value={gainFilter}
              onChange={(e) => setGainFilter(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="ganando">Solo en verde</option>
              <option value="perdiendo">Solo en rojo</option>
            </select>

            <input
              type="number"
              placeholder="% mínimo"
              value={minChange}
              onChange={(e) => setMinChange(e.target.value)}
              style={{ width: "90px" }}
            />
            <input
              type="number"
              placeholder="% máximo"
              value={maxChange}
              onChange={(e) => setMaxChange(e.target.value)}
              style={{ width: "90px" }}
            />

            <div className="view-toggle">
              <button
                type="button"
                className={viewMode === "tabla" ? "active" : ""}
                onClick={() => setViewMode("tabla")}
              >
                📊 Tabla
              </button>
              <button
                type="button"
                className={viewMode === "tarjetas" ? "active" : ""}
                onClick={() => setViewMode("tarjetas")}
              >
                🧩 Tarjetas
              </button>
            </div>

            <button className="btn-secondary" onClick={exportarCSV}>
              Exportar CSV
            </button>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => copiarTablaPortapapeles(assets)}
            >
              Copiar tabla
            </button>

            <div className="period-selector">
              <span>Periodo:</span>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
              >
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

          <div className="portfolio-actions actions-row" style={{ marginTop: 0 }}>
            <button
              className="btn-main"
              onClick={() => {
                setMostrarForm((m) => !m);
                if (mostrarForm) {
                  setEditando(null);
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
                }
              }}
            >
              {mostrarForm ? "Cerrar formulario" : "+ Añadir activo"}
            </button>
          </div>

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
                      onChange={(e) =>
                        setForm({ ...form, nombre: e.target.value })
                      }
                      placeholder="Nombre"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Ticker</label>
                    <input
                      name="ticker"
                      value={form.ticker}
                      onChange={(e) =>
                        setForm({ ...form, ticker: e.target.value })
                      }
                      placeholder="Ticker"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Tipo</label>
                    <select
                      name="tipo"
                      value={form.tipo}
                      onChange={(e) =>
                        setForm({ ...form, tipo: e.target.value })
                      }
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
                      onChange={(e) =>
                        setForm({ ...form, cantidad: e.target.value })
                      }
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
                      onChange={(e) =>
                        setForm({ ...form, precio_compra: e.target.value })
                      }
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
                      onChange={(e) =>
                        setForm({ ...form, isin: e.target.value })
                      }
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
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
