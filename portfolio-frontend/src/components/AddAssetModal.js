import React from "react";

export default function AddAssetModal({ mostrarForm, form, setForm, onSubmit, editando }) {
  if (!mostrarForm) return null;
  return (
    <form className="asset-form" onSubmit={onSubmit}>
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
  );
}
