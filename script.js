const apiUrl =
  "https://uncomtrade-web-app-903823352744.europe-west1.run.app/api/get-comtrade-data";

document
  .getElementById("queryForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const getSelectValues = (select) =>
      Array.from(select.selectedOptions).map((opt) => opt.value);

    const payload = {
      reporterCode: getSelectValues(document.getElementById("reporterCode")),
      partnerCode: getSelectValues(document.getElementById("partnerCode")),
      cmdCode: document.getElementById("cmdCode").value,
      period: document.getElementById("period").value,
      flowCode: document.getElementById("flowCode").value,
      freqCode: document.getElementById("freqCode").value,
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!Array.isArray(data)) {
      alert("Veri alınamadı veya hata oluştu.");
      return;
    }
    console.log("📥 Response:", data);
    console.log("📤 API URL:", apiUrl);
    console.log("📦 Payload:", payload);
    renderTable(data);
    renderChart(data);
    window._lastData = data; // excel export için sakla
  });

function renderTable(data) {
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";
  data.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.reporter}</td>
      <td>${row.partner || "-"}</td>
      <td>${row.product}</td>
      <td>${row.period}</td>
      <td>${row.fobvalue.toLocaleString()}</td>
      <td>${row.netWgt}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderChart(data) {
  const ctx = document.getElementById("chartCanvas").getContext("2d");
  const chartData = {
    labels: data.map((d) => d.reporter + " - " + d.partner),
    datasets: [
      {
        label: "FOB Value (USD)",
        data: data.map((d) => d.fobvalue),
      },
    ],
  };
  if (window._chart) window._chart.destroy();
  window._chart = new Chart(ctx, {
    type: "bar",
    data: chartData,
  });
}

function exportToExcel() {
  const data = window._lastData || [];
  let csv = "Reporter,Partner,Product,Period,FOB Value,Net Weight\n";
  data.forEach((row) => {
    csv += `${row.reporter},${row.partner},${row.product},${row.period},${row.fobvalue},${row.netWgt}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "comtrade_export.csv");
}
