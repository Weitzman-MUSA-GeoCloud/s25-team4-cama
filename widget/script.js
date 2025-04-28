// Utility — currency formatter
const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0
  });
  
  async function lookupAssessment () {
    const opaId = document.getElementById('opa-id').value.trim();
    if (!opaId) {
      alert('Please enter a valid OPA ID');
      return;
    }
  
    // UI: disable button while loading
    const btn = document.querySelector('.opa-input button');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Loading…';
  
    try {
      const url  = `https://api.phila.gov/opa/v1.1/property/${opaId}?format=json`;
      const res  = await fetch(url);
      if (!res.ok) throw new Error('No record found for that OPA ID');
  
      const json = await res.json();
      const hist = json.data?.[0]?.assessment_history ?? [];
      if (!hist.length) throw new Error('No assessment history available');
  
      // Sort ascending by year so the chart flows L→R chronologically
      hist.sort((a, b) => a.year - b.year);
  
      const years  = hist.map(d => d.year);
      const values = hist.map(d => d.market_value);
  
      renderChart(years, values);
      renderTable(hist);
    } catch (err) {
      alert(err.message);
      console.error(err);
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  }
  
  function renderChart (labels, data) {
    // Rebuild canvas if needed
    if (!document.getElementById('valuation-chart')) {
      const c = document.createElement('canvas');
      c.id = 'valuation-chart';
      document.getElementById('valuation-chart-container').appendChild(c);
    }
  
    if (window.chartInstance) window.chartInstance.destroy();
  
    window.chartInstance = new Chart(document.getElementById('valuation-chart'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Assessed Market Value',
          data,
          borderColor: '#0072ce',
          backgroundColor: 'rgba(0,114,206,0.1)',
          fill: true,
          tension: 0.25
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: false } } }
    });
  }
  
  function renderTable (rows) {
    const container = document.getElementById('valuation-table-container');
    let html = `<table><thead><tr>
      <th>Year</th><th>Market Value</th><th>Taxable Land</th><th>Taxable Improvement</th>
      <th>Exempt Land</th><th>Exempt Improvement</th>
    </tr></thead><tbody>`;
  
    rows.slice().reverse().forEach(r => {
      html += `<tr>
        <td>${r.year}</td>
        <td>${fmt.format(r.market_value)}</td>
        <td>${fmt.format(r.land_taxable)}</td>
        <td>${fmt.format(r.improvement_taxable)}</td>
        <td>${fmt.format(r.land_exempt)}</td>
        <td>${fmt.format(r.improvement_exempt)}</td>
      </tr>`;
    });
  
    html += '</tbody></table>';
    container.innerHTML = html;
  }