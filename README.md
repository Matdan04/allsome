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

Open your browser or use curl:

```bash
curl http://127.0.0.1:8000/analytics
```

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

## How It Works

1. Loads `allsome_interview_test_orders.csv` using Python's built-in `csv` module.
2. Calculates **total revenue** by summing `quantity × price` for each order.
3. Finds the **best-selling SKU** by summing quantities per SKU and selecting the highest.
4. Returns results as JSON via the `/analytics` endpoint.
