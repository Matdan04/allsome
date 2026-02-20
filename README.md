# Allsome Order Analytics API

A FastAPI application that processes an orders CSV dataset and produces analytics including total revenue and best-selling SKU.

## Setup

### Prerequisites

- Python 3.10+

### Install Dependencies

```bash
pip install -r requirements.txt
```

## Running the Application

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The server will start at `http://127.0.0.1:8000`.

### Get Analytics

Open your browser at `http://127.0.0.1:8000`, upload your CSV file, and click **Analyze**.

## Example Output

Generated from `allsome_interview_test_orders(1).csv`:

```json
{
  "total_revenue": 710.0,
  "best_selling_sku": {
    "sku": "SKU-A123",
    "total_quantity": 5
  }
}
```

## How It Works

1. Visit `/` to see the upload page.
2. Upload a CSV file with columns: `order_id`, `sku`, `quantity`, `price`.
3. The app calculates **total revenue** by summing `quantity × price` for each order.
4. Finds the **best-selling SKU** by summing quantities per SKU and selecting the highest.
5. Returns results as JSON on the page.
