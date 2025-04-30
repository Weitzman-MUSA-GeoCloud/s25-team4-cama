/* --------------------------------------------------------
   script.js  –  Assessment Viewer
   Cloud Function returns an ARRAY of rows
   -------------------------------------------------------- */

   const API_ROOT =
   'https://us-east4-musa5090s25-team4.cloudfunctions.net/generate_widget_data';
 
 async function lookupAssessment() {
  let opa = document.getElementById('opa-id').value.trim();
  // (leave leading zeros intact)
  if (!opa) return alert('Enter an OPA ID');
 
   const btn = document.getElementById('lookup-btn');
   btn.disabled = true;
   btn.textContent = 'Loading…';
 
   try {
     const url = `${API_ROOT}?property_id=${encodeURIComponent(opa)}`;
     const res = await fetch(url);
     if (!res.ok) throw new Error(`HTTP ${res.status}`);
 
     const rows = await res.json();              // <- array straight away
     console.log('payload', rows);
 
     if (!Array.isArray(rows) || !rows.length)
       throw new Error('No assessment history');
 
     /* update heading with address */
     document.querySelector('.title-strip h2').textContent =
       rows[0].address || 'Assessment Viewer';
 
     renderChart(rows);
     renderTable(rows);
   } catch (err) {
     alert(err.message || 'Lookup failed');
     console.error(err);
     clearOutputs();
   } finally {
     btn.disabled = false;
     btn.textContent = 'Find';
   }
 }
 
 /* --------------------------------------------------------
    Helpers
    -------------------------------------------------------- */
 
 function clearOutputs() {
   document.getElementById('valuation-table-container').innerHTML = '';
   if (window.chartInstance) window.chartInstance.destroy();
 }
 
 /* ---------- Chart ---------- */
 function renderChart(rows) {
   rows.sort((a, b) => a.year - b.year);
   const labels = rows.map(r => r.year);
   const values = rows.map(r => r.market_value);
 
   if (window.chartInstance) window.chartInstance.destroy();
 
   window.chartInstance = new Chart(
     document.getElementById('valuation-chart'),
     {
       type: 'line',
       data: {
         labels,
         datasets: [
           {
             data: values,
             borderColor: '#2f6cf6',
             backgroundColor: 'rgba(47,108,246,.08)',
             fill: 'origin',
             tension: 0.3,
             pointRadius: 4,
             pointBackgroundColor: '#fff',
             pointBorderColor: '#2f6cf6',
             pointBorderWidth: 2
           }
         ]
       },
       options: {
         responsive: true,
         plugins: { legend: { display: false } },
         scales: {
           y: { ticks: { callback: v => `$${v / 1000}k` } }
         }
       }
     }
   );
 }
 
 /* ---------- Table ---------- */
 function renderTable(rows) {
   const tbody = rows
     .slice()
     .reverse()
     .map(
       r => `<tr>
         <td>${r.year}</td>
         <td>$${r.market_value.toLocaleString()}</td>
         <td>$${r.land_taxable.toLocaleString()}</td>
         <td>$${r.improvement_taxable.toLocaleString()}</td>
         <td>$${r.land_exempt.toLocaleString()}</td>
         <td>$${r.improvement_exempt.toLocaleString()}</td>
       </tr>`
     )
     .join('');
 
   document.getElementById('valuation-table-container').innerHTML = `
     <table>
       <thead>
         <tr>
           <th>Year</th>
           <th>Market Value</th>
           <th>Taxable Land</th>
           <th>Taxable Improvement</th>
           <th>Exempt Land</th>
           <th>Exempt Improvement</th>
         </tr>
       </thead>
       <tbody>${tbody}</tbody>
     </table>`;
 }
 