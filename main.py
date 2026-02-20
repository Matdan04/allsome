"""FastAPI application for order analytics."""

from pathlib import Path

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from analytics import CSVValidationError, process_orders

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")


@app.get("/", response_class=HTMLResponse)
def upload_page():
    """Serve the main upload page."""
    html_path = BASE_DIR / "templates" / "index.html"
    return HTMLResponse(content=html_path.read_text())


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    """Accept a CSV upload and return order analytics as JSON."""
    if not file.filename.endswith(".csv"):
        return JSONResponse(
            status_code=400,
            content={"error": "Only .csv files are accepted."},
        )

    try:
        raw_bytes = await file.read()
        content = raw_bytes.decode("utf-8")
    except UnicodeDecodeError:
        return JSONResponse(
            status_code=400,
            content={"error": "File is not valid UTF-8 text."},
        )

    try:
        result = process_orders(content)
    except CSVValidationError as e:
        return JSONResponse(
            status_code=400,
            content={"error": str(e)},
        )

    return JSONResponse(content=result)
