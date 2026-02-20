const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("csvFile");
const fileName = document.getElementById("fileName");
const analyzeBtn = document.getElementById("analyzeBtn");
let qtyChartInstance = null;
let revChartInstance = null;

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
        fileName.textContent = fileInput.files[0].name;
        analyzeBtn.disabled = false;
    }
}

document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    const res = await fetch("/analyze", { method: "POST", body: formData });
    const data = await res.json();

    document.getElementById("totalRevenue").textContent =
        data.total_revenue.toLocaleString("en-US", { minimumFractionDigits: 2 });
    document.getElementById("bestSku").textContent = data.best_selling_sku.sku;
    document.getElementById("bestSkuQty").textContent =
        data.best_selling_sku.total_quantity + " units sold";

    const skus = Object.keys(data.sku_quantities);
    const quantities = Object.values(data.sku_quantities);
    const revenues = Object.values(data.sku_revenue);
    const colors = ["#38bdf8", "#818cf8", "#f472b6", "#34d399", "#fbbf24", "#fb923c"];

    if (qtyChartInstance) qtyChartInstance.destroy();
    if (revChartInstance) revChartInstance.destroy();

    qtyChartInstance = new Chart(document.getElementById("qtyChart"), {
        type: "bar",
        data: {
            labels: skus,
            datasets: [{
                label: "Quantity",
                data: quantities,
                backgroundColor: colors.slice(0, skus.length),
                borderRadius: 6,
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
                y: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } }
            }
        }
    });

    revChartInstance = new Chart(document.getElementById("revChart"), {
        type: "doughnut",
        data: {
            labels: skus,
            datasets: [{
                data: revenues,
                backgroundColor: colors.slice(0, skus.length),
                borderWidth: 0,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom", labels: { color: "#94a3b8", padding: 16 } }
            }
        }
    });

    // JSON output (only required fields)
    const jsonOut = {
        total_revenue: data.total_revenue,
        best_selling_sku: data.best_selling_sku
    };
    document.getElementById("jsonOutput").textContent = JSON.stringify(jsonOut, null, 2);

    document.getElementById("results").style.display = "block";
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze Orders";
});

document.getElementById("jsonToggle").addEventListener("click", () => {
    const pre = document.getElementById("jsonOutput");
    const btn = document.getElementById("jsonToggle");
    pre.classList.toggle("show");
    btn.textContent = pre.classList.contains("show") ? "Hide JSON Output" : "Show JSON Output";
});
