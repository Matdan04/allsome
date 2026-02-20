# Allsome Order Analytics

A FastAPI web application that processes an orders CSV dataset and produces analytics including total revenue, best-selling SKU, and interactive charts.

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [CSV Format](#csv-format)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Example Output](#example-output)
- [Dependencies](#dependencies)

## Project Structure

```
allsome_assessment/
├── main.py                  # FastAPI routes and application entry point
├── analytics.py             # Business logic for CSV processing and calculations
├── templates/
│   └── index.html           # Main page HTML template
├── static/
│   ├── css/
│   │   └── style.css        # Application styles
│   └── js/
│       └── app.js           # Client-side logic (upload, charts, error display)
├── allsome_interview_test_orders.csv   # Sample dataset
├── requirements.txt         # Python dependencies
├── .gitignore
└── README.md
```

## Prerequisites

- Python 3.10 or higher

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd allsome_assessment
```

2. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate        # Linux/macOS
venv\Scripts\activate           # Windows
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

## Running the Application

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The server will start at `http://127.0.0.1:8000`.

## Usage

1. Open `http://127.0.0.1:8000` in your browser.
2. Drag and drop a CSV file onto the upload area, or click to browse.
3. Click **Analyze Orders**.
4. View the results:
   - **Summary cards** displaying total revenue and best-selling SKU.
   - **Bar chart** showing quantity sold per SKU.
   - **Doughnut chart** showing revenue distribution per SKU.
   - **JSON output** (toggle to view the raw analytics result).

## CSV Format

The uploaded CSV file must include the following columns:

| Column     | Type    | Description                  |
|------------|---------|------------------------------|
| `sku`      | string  | Product SKU identifier       |
| `quantity` | integer | Number of units ordered       |
| `price`    | number  | Unit price of the product     |

Any additional columns (e.g. `order_id`) are allowed and will be ignored.

Example:

```csv
order_id,sku,quantity,price
1001,SKU-A123,2,50
1002,SKU-B456,1,120
1003,SKU-A123,3,50
1004,SKU-C789,5,20
1005,SKU-B456,2,120
```

## API Endpoints

### `GET /`

Serves the main upload page.

### `POST /analyze`

Accepts a CSV file upload and returns analytics as JSON.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (a `.csv` file)

**Success Response (200):**

```json
{
  "total_revenue": 710.0,
  "best_selling_sku": {
    "sku": "SKU-A123",
    "total_quantity": 5
  },
  "sku_quantities": {
    "SKU-A123": 5,
    "SKU-B456": 3,
    "SKU-C789": 5
  },
  "sku_revenue": {
    "SKU-A123": 250.0,
    "SKU-B456": 360.0,
    "SKU-C789": 100.0
  }
}
```

**Error Response (400):**

```json
{
  "error": "Missing required columns: price, quantity. Expected: price, quantity, sku."
}
```

## Error Handling

The application validates CSV input and returns clear error messages for:

| Scenario                        | Error Message                                              |
|---------------------------------|------------------------------------------------------------|
| Non-CSV file uploaded           | Only .csv files are accepted.                              |
| File not valid UTF-8            | File is not valid UTF-8 text.                              |
| Empty file / no header          | CSV file is empty or has no header row.                    |
| Missing required columns        | Missing required columns: quantity. Expected: price, quantity, sku. |
| Header only, no data rows       | CSV file contains a header but no data rows.               |
| Empty or missing SKU value      | Row 2: missing or empty 'sku' value.                       |
| Non-numeric quantity            | Row 2: invalid quantity 'abc' (must be a whole number).    |
| Non-numeric price               | Row 3: invalid price 'xyz' (must be a number).             |
| Negative quantity               | Row 2: negative quantity '-1' is not allowed.              |
| Negative price                  | Row 2: negative price '-5' is not allowed.                 |

Errors are displayed as an alert banner in the UI and as JSON in the API response.

## Example Output

Generated from `allsome_interview_test_orders.csv`:

```json
{
  "total_revenue": 710.0,
  "best_selling_sku": {
    "sku": "SKU-A123",
    "total_quantity": 5
  }
}
```

**Revenue breakdown:**

| Order ID | SKU       | Quantity | Price | Subtotal |
|----------|-----------|----------|-------|----------|
| 1001     | SKU-A123  | 2        | 50    | 100.00   |
| 1002     | SKU-B456  | 1        | 120   | 120.00   |
| 1003     | SKU-A123  | 3        | 50    | 150.00   |
| 1004     | SKU-C789  | 5        | 20    | 100.00   |
| 1005     | SKU-B456  | 2        | 120   | 240.00   |
|          |           |          | **Total** | **710.00** |

## Dependencies

| Package            | Version  | Purpose                          |
|--------------------|----------|----------------------------------|
| fastapi            | 0.115.8  | Web framework                    |
| uvicorn            | 0.34.0   | ASGI server to run FastAPI       |
| python-multipart   | 0.0.20   | File upload support for FastAPI  |
