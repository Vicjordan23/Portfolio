from fastapi import FastAPI, HTTPException, Body
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import uuid4
from datetime import datetime, timezone, timedelta
import pytz
import yfinance as yf
import pandas as pd
from io import BytesIO
from fastapi.responses import StreamingResponse

# Load env
load_dotenv()
MONGOURL = os.getenv("MONGOURL")
DBNAME = os.getenv("DBNAME")

client = AsyncIOMotorClient(MONGOURL)
db = client[DBNAME]



# CONFIGURACIÓN CORS PARA PRODUCCIÓN + FRONTEND LOCAL
app = FastAPI()

# CORS: permitir Vercel + localhost para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://portfolio-q1f4.vercel.app",  # tu frontend en producción
        "http://localhost:3000",              # frontend local
        "http://127.0.0.1:3000",              # por si el navegador usa 127.0.0.1
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Asset(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    nombre: str
    ticker: str
    tipo: str
    cantidad: float
    precio_compra: float
    moneda_compra: str
    fecha_compra: str
    isin: Optional[str] = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AssetCreate(BaseModel):
    nombre: str
    ticker: str
    tipo: str
    cantidad: float
    precio_compra: float
    moneda_compra: str
    fecha_compra: str
    isin: Optional[str] = ""

AMERICAN_EXTRAS = {"TARA"}

def get_current_price_and_open(ticker: str, tipo: str, moneda: str):
    try:
        if not ticker:
            return None, None
        # Si es cripto y no acaba en -USD, lo añadimos
        if tipo.lower() == "cripto" and not ticker.endswith("-USD"):
            ticker = f"{ticker}-USD"

        stock = yf.Ticker(ticker)
        hist = stock.history(period="1d")
        price_now = None
        price_open = None

        madrid_tz = pytz.timezone('Europe/Madrid')
        now = datetime.now(madrid_tz)

        apertura = now.replace(hour=15, minute=31, second=0, microsecond=0)
        cierre = now.replace(hour=23, minute=30, second=0, microsecond=0)
        if now < apertura:
            cierre = cierre - timedelta(days=1)
            apertura = apertura - timedelta(days=1)

        is_americano = (
            moneda == 'USD'
            or ticker.upper() in AMERICAN_EXTRAS
        )

        # Si es americano y el mercado está cerrado -> apertura = 0
        if is_americano and not (apertura <= now < cierre):
            price_open = 0
        else:
            if not hist.empty:
                price_open = float(hist['Open'].iloc[0])
            else:
                info = stock.info
                price_open = (
                    float(info.get('open', 0)) or
                    float(info.get('previousClose', 0)) or
                    None
                )

        if not hist.empty:
            price_now = float(hist['Close'].iloc[-1])
        else:
            info = stock.info
            price_now = (
                float(info.get('currentPrice', 0)) or
                float(info.get('regularMarketPrice', 0)) or
                None
            )

        return price_now, price_open
    except Exception:
        return None, None

@app.post("/api/assets", response_model=Asset)
async def create_asset(asset: AssetCreate):
    asset_obj = Asset(**asset.dict())
    await db.assets.insert_one(asset_obj.dict())
    return asset_obj

@app.get("/api/assets", response_model=List[Asset])
async def get_assets():
    assets = await db.assets.find({}, {"_id": 0}).to_list(1000)
    return assets

@app.delete("/api/assets/{asset_id}")
async def delete_asset(asset_id: str):
    res = await db.assets.delete_one({"id": asset_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="No existe el activo.")
    return {"msg": "Activo borrado"}

@app.put("/api/assets/{asset_id}", response_model=Asset)
async def update_asset(asset_id: str, asset_update: AssetCreate = Body(...)):
    obj = await db.assets.find_one({"id": asset_id})
    if not obj:
        raise HTTPException(status_code=404, detail="Activo no encontrado")
    update_data = asset_update.dict()
    await db.assets.update_one({"id": asset_id}, {"$set": update_data})
    actualizado = await db.assets.find_one({"id": asset_id}, {"_id": 0})
    return actualizado

@app.get("/api/portfolio/summary")
async def portfolio_summary():
    assets = await db.assets.find({}, {"_id": 0}).to_list(1000)
    portfolio_data = []
    total_inversion = 0.0
    total_actual = 0.0

    for asset in assets:
        precio_actual, precio_apertura = get_current_price_and_open(
            asset['ticker'], asset['tipo'], asset['moneda_compra']
        )
        if precio_actual is None:
            precio_actual = asset['precio_compra']
        if precio_apertura is None:
            precio_apertura = asset['precio_compra']

        valor_compra = asset['precio_compra'] * asset['cantidad']
        valor_actual = precio_actual * asset['cantidad']
        beneficio_diario = (precio_actual - precio_apertura) * asset['cantidad']
        beneficio_diario_redondeado = round(beneficio_diario, 2)
        ganancia_perdida = valor_actual - valor_compra
        porcentaje_cambio = ((ganancia_perdida / valor_compra) * 100) if valor_compra else 0

        total_inversion += valor_compra
        total_actual += valor_actual

        portfolio_data.append({
            "id": asset['id'],
            "nombre": asset['nombre'],
            "ticker": asset['ticker'],
            "tipo": asset['tipo'],
            "cantidad": asset['cantidad'],
            "precio_compra": asset['precio_compra'],
            "precio_actual_eur": round(precio_actual, 4),
            "precio_apertura_eur": round(precio_apertura, 4),
            "valor_actual": round(valor_actual, 2),
            "ganancia_perdida": round(ganancia_perdida, 2),
            "porcentaje_cambio": round(porcentaje_cambio, 2),
            "beneficio_diario": beneficio_diario_redondeado,
            "fecha_compra": asset['fecha_compra'],
            "isin": asset.get('isin', "")
        })

    beneficio_diario_total = sum(a["beneficio_diario"] for a in portfolio_data)
    ganancia_perdida_total = total_actual - total_inversion
    rendimiento_porcentaje = (ganancia_perdida_total / total_inversion * 100) if total_inversion else 0

    return {
        "assets": portfolio_data,
        "resumen": {
            "beneficio_diario": round(beneficio_diario_total, 2),
            "valor_total_eur": round(total_actual, 2),
            "inversion_total_eur": round(total_inversion, 2),
            "ganancia_perdida_total": round(ganancia_perdida_total, 2),
            "rendimiento_porcentaje": round(rendimiento_porcentaje, 2),
            "cantidad_activos": len(assets)
        }
    }

@app.get("/api/portfolio/history")
async def portfolio_history(periodo: str = "mes"):
    hoy = datetime.now()
    if periodo == "dia":
        dias = 1
        start = hoy - timedelta(days=1)
        fechas = pd.bdate_range(start=start.date(), end=hoy.date(), freq="B").to_pydatetime().tolist()
    elif periodo == "semana":
        dias = 7
        start = hoy - timedelta(days=dias)
        fechas = pd.bdate_range(start=start.date(), end=hoy.date(), freq="B").to_pydatetime().tolist()
    elif periodo == "año":
        dias = 365
        start = hoy - timedelta(days=dias)
        fechas = pd.bdate_range(start=start.date(), end=hoy.date(), freq="B").to_pydatetime().tolist()
    else:  # mes por defecto
        dias = 30
        start = hoy - timedelta(days=dias)
        fechas = pd.bdate_range(start=start.date(), end=hoy.date(), freq="B").to_pydatetime().tolist()

    assets = await db.assets.find({}, {"_id": 0}).to_list(1000)
    if not assets:
        return []

    history = []
    for fecha in fechas:
        valor_total_historico = 0
        for asset in assets:
            try:
                yf_ticker = yf.Ticker(asset["ticker"])
                df = yf_ticker.history(
                    start=fecha.strftime("%Y-%m-%d"),
                    end=(fecha+timedelta(days=1)).strftime("%Y-%m-%d"),
                    interval="1d"
                )
                if not df.empty:
                    precio_cierre = float(df.iloc[0]["Close"])
                else:
                    precio_cierre = asset["precio_compra"]
            except Exception:
                precio_cierre = asset["precio_compra"]
            valor_total_historico += precio_cierre * asset["cantidad"]
        inversion_total = sum(a["precio_compra"] * a["cantidad"] for a in assets)
        ganancia_perdida = valor_total_historico - inversion_total
        history.append({
            "fecha": fecha.strftime("%Y-%m-%d"),
            "ganancia_perdida_total": round(ganancia_perdida, 2)
        })
    return history

@app.get("/api/export/excel")
async def export_excel():
    assets = await db.assets.find({}, {"_id": 0}).to_list(1000)
    df = pd.DataFrame(assets)
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False)
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=cartera.xlsx"}
    )
