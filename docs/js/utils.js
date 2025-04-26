// utils.js

import { updateAllCharts } from './charts.js';

/**
 * Normalize a value between 0–1 over [min, max], then
 * interpolate from blue (low) to red (high).
 */
export function getColorForValue(value, min, max) {
  const normalized = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const r = Math.floor(normalized * 255);
  const b = Math.floor((1 - normalized) * 255);
  return `rgb(${r}, 0, ${b})`;
}

/**
 * For percent-change: negative → bluish, positive → reddish.
 */
export function getColorForPercentChange(pct) {
  if (pct < 0) {
    const intensity = Math.min(Math.abs(pct) / 50, 1);
    const blue = Math.floor(128 + intensity * 127);
    return `rgb(0, 0, ${blue})`;
  } else {
    const intensity = Math.min(pct / 50, 1);
    const red = Math.floor(128 + intensity * 127);
    return `rgb(${red}, 0, 0)`;
  }
}


/**
 * Format a number as USD currency with no decimals.
 */
export function formatCurrency(value) {
  return value.toLocaleString('en-US', {
    style:                 'currency',
    currency:              'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/**
 * Generate N linearly spaced bins between min and max.
 */
export function generateBins(min, max, count) {
  const bins = [];
  const step = (max - min) / count;
  for (let i = 0; i <= count; i++) {
    bins.push(min + step * i);
  }
  return bins;
}

/**
 * Wire up your clickable legend items (.metric-item) for single-selection.
 *
 * When clicked, this will:
 *  1) Highlight the selected card
 *  2) Set activeCharts = [thatMetric]
 *  3) Show its histogram, hide the others
 *  4) Fire map.updatevectortiles to restyle your vector layer
 *  5) Fetch & redraw the histogram from your API
 *
 * @param {string[]} activeCharts  Array with exactly one metric ID
 * @param {object[]} chartConfig   Your config.js array (with id, title, apiUrl, etc)
 * @param {L.Map}    map           The Leaflet map instance
 * @param {object}   fns           { createOrShowChart, hideChart }
 */
export function setupEventListeners(
  activeCharts,
  chartConfig,
  map,
  { createOrShowChart, hideChart }
) {
  const items = Array.from(document.querySelectorAll('.legend .metric-item'));
  if (!items.length) return;

  items.forEach(item => {
    item.addEventListener('click', () => {
      const metric = item.dataset.metric;
      if (!metric) return;

      // 1) Highlight this one
      items.forEach(i => i.classList.toggle('active', i === item));

      // 2) Reset activeCharts to just this
      activeCharts.length = 0;
      activeCharts.push(metric);

      // 3) Show its histogram, hide the rest
      chartConfig.forEach(cfg => {
        if (cfg.id === metric) createOrShowChart(cfg.id, chartConfig);
        else                  hideChart(cfg.id);
      });

      // 4) Restyle your vector tiles
      map.fire('updatevectortiles');

      // 5) Fetch & redraw the histogram
      updateAllCharts(activeCharts);
    });
  });

  // 6) Bootstrap the default on load
  const defaultMetric = activeCharts[0];
  const defaultItem   = items.find(i => i.dataset.metric === defaultMetric);
  if (defaultItem) {
    defaultItem.classList.add('active');
    defaultItem.click();
  }
}
