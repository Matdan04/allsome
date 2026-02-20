/* ── DOM References ─────────────────────────────────────────────── */

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("csvFile");
const fileNameEl = document.getElementById("fileName");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultsEl = document.getElementById("results");
const errorEl = document.getElementById("errorAlert");

/* ── Chart State ───────────────────────────────────────────────── */

const CHART_COLORS = ["#38bdf8", "#818cf8", "#f472b6", "#34d399", "#fbbf24", "#fb923c"];
let qtyChart = null;
let revChart = null;

/* ── Drag & Drop ───────────────────────────────────────────────── */

dropZone.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        onFileSelected();
    }
});

fileInput.addEventListener("change", onFileSelected);

function onFileSelected() {
    if (fileInput.files.length) {
        fileNameEl.textContent = fileInput.files[0].name;
        analyzeBtn.disabled = false;
        hideError();
    }
}

/* ── Form Submission ───────────────────────────────────────────── */

document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();
    setLoading(true);

    try {
        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        const response = await fetch("/analyze", { method: "POST", body: formData });
        const data = await response.json();

        if (!response.ok) {
            showError(data.error || "An unexpected error occurred.");
            return;
        }

        renderResults(data);
    } catch {
        showError("Failed to connect to the server. Please try again.");
    } finally {
        setLoading(false);
    }
});

/* ── Render Results ────────────────────────────────────────────── */

function renderResults(data) {
    // Summary cards
    document.getElementById("totalRevenue").textContent =
        data.total_revenue.toLocaleString("en-US", { minimumFractionDigits: 2 });
    document.getElementById("bestSku").textContent = data.best_selling_sku.sku;
    document.getElementById("bestSkuQty").textContent =
        data.best_selling_sku.total_quantity + " units sold";

    // Charts
    const skus = Object.keys(data.sku_quantities);
    const quantities = Object.values(data.sku_quantities);
    const revenues = Object.values(data.sku_revenue);

    qtyChart = createBarChart("qtyChart", skus, quantities, qtyChart);
    revChart = createDoughnutChart("revChart", skus, revenues, revChart);

    // JSON output (only the required fields from the spec)
    const jsonOut = {
        total_revenue: data.total_revenue,
        best_selling_sku: data.best_selling_sku,
    };
    document.getElementById("jsonOutput").textContent = JSON.stringify(jsonOut, null, 2);

    resultsEl.style.display = "block";
}

/* ── Chart Helpers ─────────────────────────────────────────────── */

function createBarChart(canvasId, labels, values, existing) {
    if (existing) existing.destroy();

    return new Chart(document.getElementById(canvasId), {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Quantity",
                data: values,
                backgroundColor: CHART_COLORS.slice(0, labels.length),
                borderRadius: 6,
            }],
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
                y: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } },
            },
        },
    });
}

function createDoughnutChart(canvasId, labels, values, existing) {
    if (existing) existing.destroy();

    return new Chart(document.getElementById(canvasId), {
        type: "doughnut",
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: CHART_COLORS.slice(0, labels.length),
                borderWidth: 0,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom", labels: { color: "#94a3b8", padding: 16 } },
            },
        },
    });
}

/* ── UI Helpers ────────────────────────────────────────────────── */

function setLoading(isLoading) {
    analyzeBtn.disabled = isLoading;
    analyzeBtn.textContent = isLoading ? "Analyzing..." : "Analyze Orders";
}

function showError(message) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
    resultsEl.style.display = "none";
}

function hideError() {
    errorEl.style.display = "none";
}

/* ── JSON Toggle ───────────────────────────────────────────────── */

document.getElementById("jsonToggle").addEventListener("click", () => {
    const pre = document.getElementById("jsonOutput");
    const btn = document.getElementById("jsonToggle");
    pre.classList.toggle("show");
    btn.textContent = pre.classList.contains("show") ? "Hide JSON Output" : "Show JSON Output";
});
