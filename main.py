import csv
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

CSV_FILE = "allsome_interview_test_orders.csv"


def process_orders(filepath: str) -> dict:
    total_revenue = 0.0
    sku_quantities: dict[str, int] = {}

    with open(filepath, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            quantity = int(row["quantity"])
            price = float(row["price"])
            sku = row["sku"]

            total_revenue += quantity * price
            sku_quantities[sku] = sku_quantities.get(sku, 0) + quantity

    best_sku = max(sku_quantities, key=sku_quantities.get)

    return {
        "total_revenue": total_revenue,
        "best_selling_sku": {
            "sku": best_sku,
            "total_quantity": sku_quantities[best_sku],
        },
    }


@app.get("/analytics")
def get_analytics():
    result = process_orders(CSV_FILE)
    return JSONResponse(content=result)
