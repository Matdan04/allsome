import csv
import io
from pathlib import Path
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")


def process_orders(file_content: str) -> dict:
    total_revenue = 0.0
    sku_quantities: dict[str, int] = {}
    sku_revenue: dict[str, float] = {}

    reader = csv.DictReader(io.StringIO(file_content))
    for row in reader:
        quantity = int(row["quantity"])
        price = float(row["price"])
        sku = row["sku"]

        subtotal = quantity * price
        total_revenue += subtotal
        sku_quantities[sku] = sku_quantities.get(sku, 0) + quantity
        sku_revenue[sku] = sku_revenue.get(sku, 0) + subtotal

    best_sku = max(sku_quantities, key=sku_quantities.get)

    return {
        "total_revenue": total_revenue,
        "best_selling_sku": {
            "sku": best_sku,
            "total_quantity": sku_quantities[best_sku],
        },
        "sku_quantities": sku_quantities,
        "sku_revenue": sku_revenue,
    }


@app.get("/", response_class=HTMLResponse)
def upload_page():
    html_path = BASE_DIR / "templates" / "index.html"
    return HTMLResponse(content=html_path.read_text())


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    content = (await file.read()).decode("utf-8")
    result = process_orders(content)
    return JSONResponse(content=result)
