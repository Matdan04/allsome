"""Order analytics module for processing CSV order data."""

import csv
import io

REQUIRED_COLUMNS = {"sku", "quantity", "price"}


class CSVValidationError(Exception):
    """Raised when the CSV file has structural or data issues."""
    pass


def validate_columns(fieldnames: list[str] | None) -> None:
    """Check that all required columns exist in the CSV header."""
    if not fieldnames:
        raise CSVValidationError("CSV file is empty or has no header row.")

    # Strip whitespace from column names for flexible matching
    cleaned = {col.strip().lower() for col in fieldnames}
    missing = REQUIRED_COLUMNS - cleaned
    if missing:
        raise CSVValidationError(
            f"Missing required columns: {', '.join(sorted(missing))}. "
            f"Expected: {', '.join(sorted(REQUIRED_COLUMNS))}."
        )


def parse_row(row: dict, row_number: int) -> tuple[str, int, float]:
    """Parse and validate a single CSV row, returning (sku, quantity, price)."""
    sku = row.get("sku", "").strip()
    if not sku:
        raise CSVValidationError(f"Row {row_number}: missing or empty 'sku' value.")

    raw_qty = row.get("quantity", "").strip()
    if not raw_qty:
        raise CSVValidationError(f"Row {row_number}: missing 'quantity' value.")
    try:
        quantity = int(raw_qty)
    except ValueError:
        raise CSVValidationError(
            f"Row {row_number}: invalid quantity '{raw_qty}' (must be a whole number)."
        )
    if quantity < 0:
        raise CSVValidationError(
            f"Row {row_number}: negative quantity '{quantity}' is not allowed."
        )

    raw_price = row.get("price", "").strip()
    if not raw_price:
        raise CSVValidationError(f"Row {row_number}: missing 'price' value.")
    try:
        price = float(raw_price)
    except ValueError:
        raise CSVValidationError(
            f"Row {row_number}: invalid price '{raw_price}' (must be a number)."
        )
    if price < 0:
        raise CSVValidationError(
            f"Row {row_number}: negative price '{raw_price}' is not allowed."
        )

    return sku, quantity, price


def process_orders(file_content: str) -> dict:
    """
    Process CSV order data and return analytics results.

    Args:
        file_content: Raw CSV string with columns: sku, quantity, price.

    Returns:
        Dictionary with total_revenue, best_selling_sku, sku_quantities,
        and sku_revenue breakdowns.

    Raises:
        CSVValidationError: If the CSV is malformed or contains invalid data.
    """
    reader = csv.DictReader(io.StringIO(file_content))
    validate_columns(reader.fieldnames)

    total_revenue = 0.0
    sku_quantities: dict[str, int] = {}
    sku_revenue: dict[str, float] = {}

    row_count = 0
    for row_number, row in enumerate(reader, start=2):  # start=2 accounts for header
        sku, quantity, price = parse_row(row, row_number)

        subtotal = quantity * price
        total_revenue += subtotal
        sku_quantities[sku] = sku_quantities.get(sku, 0) + quantity
        sku_revenue[sku] = sku_revenue.get(sku, 0) + subtotal
        row_count += 1

    if row_count == 0:
        raise CSVValidationError("CSV file contains a header but no data rows.")

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
