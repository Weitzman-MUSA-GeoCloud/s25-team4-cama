// map.js

import { getColorForPercentChange, getColorForValue } from './utils.js';
import { setupVectorTiles } from './vectorTiles.js';

let map;

/**
 * Initializes the Leaflet map with:
 *  • Carto light base layer + Esri satellite toggle
 *  • Show/Hide legend controls
 *  • Zoom control and layer switcher
 *  • Vector‐tile layer that restyles on legend clicks
 *
 * @param {string[]} activeCharts – array whose [0] is the current metric ID
 * @returns {L.Map} the initialized map instance
 */
export function initializeMap(activeCharts) {
  // 1) Create the map
  map = L.map('map', {
    center: [39.9526, -75.1652],
    zoom: 13,
    zoomControl: false
  });

  // 2) Base raster layer (Carto Positron)
  const positron = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }
  ).addTo(map);

  // 3) Satellite alternative
  const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, IGN, and the GIS User Community',
      maxZoom: 19
    }
  );

  // 4) “Show selection” toggle button (must be declared before legend)
  const showBtn = L.control({ position: 'topright' });
  showBtn.onAdd = () => {
    const btn = L.DomUtil.create('a', 'legend-toggle-button');
    btn.innerHTML = '📊';
    btn.href      = '#';
    btn.style.display = 'none'; // initially hidden
    L.DomEvent.on(btn, 'click', e => {
      L.DomEvent.stopPropagation(e).preventDefault(e);
      document.getElementById('legend-container').style.display = '';
      btn.style.display = 'none';
    });
    return btn;
  };
  showBtn.addTo(map);

  // 5) Legend control panel
  const legend = L.control({ position: 'topright' });
  legend.onAdd = () => {
    const div = L.DomUtil.create('div', 'legend');
    div.id = 'legend-container';
    div.innerHTML = `
      <div class="legend-header">
        <span>Select:</span>
        <span class="legend-close">Hide</span>
      </div>
      <div class="metric-item active" data-metric="current-values">
        Current assessment values
      </div>
      <div class="metric-item" data-metric="previous-values">
        Prior‐year assessment values
      </div>
      <div class="metric-item" data-metric="percent-change">
        Percentage change
      </div>
      <div class="metric-item" data-metric="absolute-change">
        Absolute change
      </div>
    `;
    L.DomEvent.disableClickPropagation(div);
    div.querySelector('.legend-close').addEventListener('click', () => {
      div.style.display = 'none';
      showBtn.getContainer().style.display = '';
    });
    return div;
  };
  legend.addTo(map);

  // 6) Zoom control (top left)
  L.control.zoom({ position: 'topleft' }).addTo(map);

  // 7) Layer switcher (bottom right)
  L.control
    .layers({ Light: positron, Satellite: satellite }, null, {
      position: 'bottomright',
      collapsed: true
    })
    .addTo(map);

  // 8) Vector‐tile layer & styling updates
  const vectorTileHandler = setupVectorTiles(map, activeCharts);
  map.on('updatevectortiles', () => {
    vectorTileHandler.updateStyle();
  });

  // 9) Return the initialized map
  return map;
}

export { map };
