import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import axios from "axios";
import "./App.css";

import Resumen from "./Resumen";
import TablaActivos from "./TablaActivos";
import GraficoEvolucion from "./GraficoEvolucion";
import GraficoBeneficioDiario from "./GraficoBeneficioDiario";

const API =
  (process.env.REACT_APP_BACKEND_URL ||
    "http://127.0.0.1:8000") + "/api";

function App() {
  const [assets, setAssets] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [periodo, setPeriodo] = useState("mes");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [dark, setDark] = useState(true);
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

  const prevAssetValues = useRef({});
  const [cellFlashes, setCellFlashes] = useState({});

  // --------- Tema oscuro / claro ----------
  useEffect(() => {
    document.body.classList.toggle("dark-theme", dark);
  }, [dark]);

  // --------- Carga de datos ----------
  const cargarDatos = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${API}/portfolio/summary`
      );
      setAssets(data.assets || []);
      setResumen(data.resumen || null);
    } catch (error) {
      alert(error.response?.data?.detail || error.message);
    }
  }, []);

  const cargarHistorial = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${API}/portfolio/history?periodo=${periodo}`
      );
      setHistorial(data || []);
    } catch {
      // no molestamos al usuario si falla solo el historial
    }
  }, [periodo]);

  useEffect(() => {
    cargarDatos();
    cargarHistorial();

    const interval = setInterval(() => {
      cargarDatos();
      cargarHistorial();
    }, 60000);

    return () => clearInterval(interval);
  }, [cargarDatos, cargarHistorial]);

  // --------- Animación de flashes en celdas ----------
  useEffect(() => {
    assets.forEach((asset) => {
      const prev = prevAssetValues.current[asset.id];
      [
        "valor_actual",
        "ganancia_perdida",
        "precio_actual_eur",
        "beneficio_diario",
      ].forEach((key) => {
        if (
          prev &&
          prev[key] !== undefined &&
          asset[key] !== undefined &&
          asset[key] !== prev[key]
        ) {
          const color =
            asset[key] > prev[key]
              ? "flash-green-text"
              : "flash-red-text";

          setCellFlashes((f) => ({
            ...f,
            [`${asset.id}-${key}`]: color,
          }));

          setTimeout(() => {
            setCellFlashes((f) => {
              const next = { ...f };
              delete next[`${asset.id}-${key}`];
              return next;
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

  // --------- Utilidades ----------
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

  const sumaBeneficioDiaria = assets.reduce(
    (acc, asset) => acc + beneficioDiarioSeguro(asset),
    0
  );
  const sumaBeneficioDiariaRedondeada =
    sumaBeneficioDiaria.toFixed(2);

  // --------- CRUD activos ----------
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
    try {
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
        await axios.put(
          `${API}/assets/${editando}`,
          payload
        );
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
        fecha_compra: new Date()
          .toISOString()
          .split("T")[0],
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
      const response = await axios.get(
        `${API}/export/excel`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );
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

  // --------- Render ----------
  return (
    <div className="portfolio-bg">
      <div className="portfolio-container">
        {/* CABECERA */}
        <header className="portfolio-header">
          <div className="header-text">
            <h1 className="portfolio-title">
              Mi Portafolio de Inversión
            </h1>
            <p className="portfolio-desc">
              Gestiona y visualiza tus inversiones en tiempo
              real con una vista clara de rendimiento y
              distribución.
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

        {/* RESUMEN (tarjetas) */}
        <Resumen
          valorTotal={resumen?.valor_total_eur || 0}
          inversionRealizada={
            resumen?.inversion_total_eur || 0
          }
          gananciaPerdida={
            resumen?.ganancia_perdida_total || 0
          }
          rendimiento={
            resumen?.rendimiento_porcentaje || 0
          }
          activosNum={
            resumen?.cantidad_activos || assets.length
          }
          beneficioDiario={Number(
            sumaBeneficioDiariaRedondeada
          )}
        />

        {/* TABLA DE ACTIVOS */}
        <TablaActivos
          activos={assets}
          onEdit={handleEditarActivo}
          onDelete={borrarActivo}
          cellFlashes={cellFlashes}
        />

        {/* ACCIONES */}
        <section className="portfolio-actions actions-row">
          <button
            className="btn-main"
            onClick={() => {
              setMostrarForm((v) => !v);
              if (!mostrarForm) {
                setForm({
                  nombre: "",
                  ticker: "",
                  tipo: "acción",
                  cantidad: "",
                  precio_compra: "",
                  moneda_compra: "EUR",
                  isin: "",
                  fecha_compra: new Date()
                    .toISOString()
                    .split("T")[0],
                });
                setEditando(null);
              }
            }}
          >
            {mostrarForm
              ? "Cancelar"
              : "+ Añadir activo"}
          </button>
          <button
            className="btn-secondary"
            onClick={cargarDatos}
          >
            Actualizar
          </button>
          <button
            className="btn-secondary"
            onClick={exportarExcel}
          >
            Exportar a Excel
          </button>

          <div className="period-selector">
            <span>Periodo:</span>
            <select
              value={periodo}
              onChange={(e) =>
                setPeriodo(e.target.value)
              }
            >
              <option value="dia">Día</option>
              <option value="semana">Semana</option>
              <option value="mes">Mes</option>
              <option value="año">Año</option>
            </select>
          </div>
        </section>

        {/* GRÁFICOS */}
        <section className="portfolio-charts">
          <GraficoEvolucion
            historial={historial}
            periodo={periodo}
          />
          <GraficoBeneficioDiario activos={assets} />
        </section>

        {/* FORMULARIO */}
        {mostrarForm && (
          <section className="form-section">
            <h2 className="form-title">
              {editando
                ? "Editar activo"
                : "Añadir nuevo activo"}
            </h2>
            <form
              className="asset-form"
              onSubmit={guardarActivo}
            >
              <div className="form-grid">
                <div className="form-field">
                  <label>Nombre</label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        nombre: e.target.value,
                      })
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
                      setForm({
                        ...form,
                        ticker: e.target.value,
                      })
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
                      setForm({
                        ...form,
                        tipo: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="acción">Acción</option>
                    <option value="fondo">Fondo</option>
                    <option value="ETF">ETF</option>
                    <option value="cripto">
                      Criptomoneda
                    </option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Cantidad</label>
                  <input
                    name="cantidad"
                    value={form.cantidad}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        cantidad: e.target.value,
                      })
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
                      setForm({
                        ...form,
                        precio_compra:
                          e.target.value,
                      })
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
                      setForm({
                        ...form,
                        moneda_compra:
                          e.target.value,
                      })
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
                      setForm({
                        ...form,
                        fecha_compra:
                          e.target.value,
                      })
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
                      setForm({
                        ...form,
                        isin: e.target.value,
                      })
                    }
                    placeholder="ISIN"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-main"
                >
                  {editando
                    ? "Guardar cambios"
                    : "Guardar activo"}
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

export default App;
