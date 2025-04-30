// utils.js

import { updateAllCharts } from './charts.js';

/**
 * Get color based on value and quantile breakpoints with specific color ramp
 */
export function getColorByQuantile(value, colorRamp) {
  // Quantile breakpoints as specified
  const breakpoints = [100000, 146900, 192900, 248900, 351400, 10000000];
  
  // Find which quantile the value belongs to
  if (value < breakpoints[0]) {
    return colorRamp[0];
  } else if (value < breakpoints[1]) {
    return colorRamp[0];
  } else if (value < breakpoints[2]) {
    return colorRamp[1];
  } else if (value < breakpoints[3]) {
    return colorRamp[2];
  } else if (value < breakpoints[4]) {
    return colorRamp[3];
  } else {
    return colorRamp[4];
  }
}

/**
 * Get color based on specific metric type
 */
export function getColorForMetric(value, metricType) {
  // Define color ramps for each metric
  const colorRamps = {
    'current-values': ["#ebe6dfff", "#c3beb9ff", "#9cadb4ff", "#40a7b9ff", "#007f99ff"],
    'previous-values': ["#e9d7b8ff", "#e8c9b3ff", "#c59ca4ff", "#a48d9eff", "#606d94ff"],
    'absolute-change': ["#3900b3ff", "#714dbfff", "#9e6b90ff", "#cf9270ff", "#ebb698ff"],
    'percent-change': ["#6690ffff", "#526aadff", "#423b38ff", "#945e4cff", "#ff9573ff"]
  };

  // Get the appropriate color ramp
  const colorRamp = colorRamps[metricType];

  // Handle percent change differently
  if (metricType === 'percent-change') {
    return getColorForPercentChangeWithRamp(value, colorRamp);
  }
  
  return getColorByQuantile(value, colorRamp);
}

/**
 * For percent change using the blue and brown color ramp
 */
export function getColorForPercentChangeWithRamp(pct, colorRamp) {
  // Define breakpoints for percentage change
  // Assuming negative changes map to blue side, positive to brown side
  if (pct < -10) {
    return colorRamp[0];  // Most blue
  } else if (pct < -5) {
    return colorRamp[1];  // Medium blue
  } else if (pct < 5) {
    return colorRamp[2];  // Neutral
  } else if (pct < 10) {
    return colorRamp[3];  // Medium brown
  } else {
    return colorRamp[4];  // Most brown
  }
}

/**
 * Normalize a value between 0–1 over [min, max], then
 * interpolate from blue (low) to red (high).
 * NOTE: This is kept for backward compatibility but 
 * not used for vector tile styling anymore.
 */
export function getColorForValue(value, min, max) {
  const normalized = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const r = Math.floor(normalized * 255);
  const b = Math.floor((1 - normalized) * 255);
  return `rgb(${r}, 0, ${b})`;
}

/**
 * For percent-change: negative → bluish, positive → reddish.
 * NOTE: This is kept for backward compatibility but
 * not used for vector tile styling anymore.
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
      
      // 6) Update the color legend
      if (window.updateColorLegend) {
        window.updateColorLegend(metric);
      }
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