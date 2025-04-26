// charts.js
import { formatCurrency } from './utils.js';

// In-memory store of Chart.js instances
const charts = {};

/**
 * Smooths an array of numbers using a simple moving average.
 */
function smoothLine(data, windowSize = 3) {
  const smoothed = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end   = Math.min(data.length - 1, i + Math.floor(windowSize / 2));
    let sum = 0, count = 0;
    for (let j = start; j <= end; j++) {
      sum += data[j];
      count++;
    }
    smoothed.push(sum / count);
  }
  return smoothed;
}

// Shared Chart.js options
const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: { bottom: 20 }
  },
  scales: {
    x: {
      display: true,
      grid: { color: 'rgba(200,200,200,0.3)' },
      ticks: {
        maxRotation: 45,
        minRotation: 45,
        autoSkip: true,
        maxTicksLimit: 10,
        font: { size: 10 }
      }
    },
    y: {
      display: true,
      beginAtZero: true,
      title: { display: true, text: '# Properties' },
      grid: { color: 'rgba(200,200,200,0.3)' }
    }
  },
  plugins: { legend: { display: false } }
};

/**
 * Calls your Cloud Functions to get the histogram bins for a given metric.
 */
async function fetchHistogramBins(metric) {
  let url;
  switch (metric) {
    case 'current-values':
      url = 'https://us-east4-musa5090s25-team4.cloudfunctions.net/get_tax_year_assessment_bins?year=2025&scale=log';
      break;
    case 'previous-values':
      url = 'https://us-east4-musa5090s25-team4.cloudfunctions.net/get_tax_year_assessment_bins?year=2024&scale=log';
      break;
    case 'absolute-change':
      url = 'https://us-east4-musa5090s25-team4.cloudfunctions.net/get_tax_year_assessment_bins?year=2024&scale=log';
      break;
    case 'percent-change':
      url = 'https://us-east4-musa5090s25-team4.cloudfunctions.net/get_tax_year_assessment_bins?year=2024&scale=log';
      break;
    default:
      throw new Error(`Unknown metric: ${metric}`);
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch bins: ${res.statusText}`);
  return res.json();  // expects [{ lower_bound, upper_bound, property_count, … }, …]
}

/**
 * Create or reveal a chart container & canvas, then initialize the Chart.js instance.
 */
export function createOrShowChart(chartId, chartConfig) {
  const cfg = chartConfig.find(c => c.id === chartId);
  if (!cfg) return;

  let container = document.getElementById(`chart-container-${chartId}`);
  if (!container) {
    container = document.createElement('div');
    container.id = `chart-container-${chartId}`;
    container.className = 'chart-container';
    container.style.cssText = `
      max-height: 0; opacity: 0; overflow: hidden;
      transition: max-height 0.5s ease, opacity 0.5s ease;
    `;
    // Title
    const titleEl = document.createElement('div');
    titleEl.className = 'chart-title';
    titleEl.textContent = cfg.chartTitle;
    container.appendChild(titleEl);
    // Canvas
    const canvas = document.createElement('canvas');
    canvas.id = chartId;
    container.appendChild(canvas);
    // Attach
    document.getElementById('charts-container').appendChild(container);
    // Instantiate Chart
    createChart(chartId, canvas.id);
  }

  // Animate in
  setTimeout(() => {
    container.style.maxHeight = '280px';
    container.style.opacity   = '1';
  }, 50);
}

/**
 * Hide & destroy a chart.
 */
export function hideChart(chartId) {
  const container = document.getElementById(`chart-container-${chartId}`);
  if (!container) return;
  container.style.maxHeight = '0';
  container.style.opacity   = '0';
  setTimeout(() => {
    container.remove();
    if (charts[chartId]) {
      charts[chartId].destroy();
      delete charts[chartId];
    }
  }, 500);
}

/**
 * Build the initial empty Chart.js instance (bar + hidden line).
 */
function createChart(chartId, canvasId) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  charts[chartId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: '# Properties',
          type: 'bar',
          data: [],
          backgroundColor: 'rgba(128,128,128,0.7)'
        },
        {
          label: 'Trend',
          type: 'line',
          data: [],
          borderColor: '#747e80',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 0
        }
      ]
    },
    options: commonChartOptions
  });
}

/**
 * Update every active chart by re-fetching bins & redrawing.
 */
export function updateAllCharts(activeCharts) {
  activeCharts.forEach(id => updateChartData(id));
}

/**
 * Fetch bin data for one chart, then push into its Chart.js instance.
 */
export async function updateChartData(chartId) {
  const chart = charts[chartId];
  if (!chart) return;

  try {
    const bins = await fetchHistogramBins(chartId);
    // Build labels & counts
    const labels = bins.map(b =>
      // show lower→upper
      `${formatCurrency(b.lower_bound)}–${formatCurrency(b.upper_bound)}`
    );
    const counts = bins.map(b => b.property_count);

    // Apply to Chart.js
    chart.data.labels = labels;
    chart.data.datasets[0].data = counts;
    chart.data.datasets[0].backgroundColor = {
      'current-values':  '#a4c1ce',
      'previous-values': '#f1d2b7',
      'percent-change':  '#e39c5c',
      'absolute-change': '#a89d3c'
    }[chartId] || 'rgba(128,128,128,0.7)';

    chart.data.datasets[1].data = smoothLine(counts, 5);
    chart.update();
  } catch (err) {
    console.error('Error updating chart', chartId, err);
  }
}

export { charts };
