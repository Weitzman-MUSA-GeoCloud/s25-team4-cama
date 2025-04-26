// vectorTiles.js

import { getColorForPercentChange, getColorForValue } from './utils.js';

// URL template for your Google Cloud Vector tiles
const VECTOR_TILE_URL = 
  'https://storage.googleapis.com/musa5090s25-team4-public/tiles/properties/{z}/{x}/{y}.pbf';

// The internal layer name in your PBF (from your key dump)
const VECTOR_LAYER_NAME = 'property_tile_info';

// Zoom level at which you switch from raster (points) to vector (polygons)
const VECTOR_TILE_ZOOM_THRESHOLD = 14;

export function setupVectorTiles(map, activeCharts) {
  if (!L.VectorGrid) {
    console.error('Leaflet.VectorGrid plugin is required but not loaded');
    return { updateStyle: () => null, getLayer: () => null };
  }

  let vectorTileLayer = null;

  // Builds or rebuilds the vector‐tile layer with the correct styling
  function createOrUpdateVectorLayer() {

    // Pick the one metric the user has selected
    const metric = activeCharts[0] || 'percent-change';

    vectorTileLayer = L.vectorGrid.protobuf(VECTOR_TILE_URL, {
      vectorTileLayerStyles: {
        // Use your actual layer name from the tiles
        [VECTOR_LAYER_NAME]: props => {
          // Decide fillColor based on the metric
          let fillColor;
          switch (metric) {
            case 'current-values':
              fillColor = getColorForValue(
                props.current_assessed_value || 0,
                10_000,
                1_000_000_000
              );
              break;

            case 'previous-values':
              fillColor = getColorForValue(
                props.tax_year_assessed_value || 0,
                10_000,
                1_000_000_000
              );
              break;

            case 'percent-change': {
              const curr = props.current_assessed_value || 0;
              const prev = props.tax_year_assessed_value   || 0;
              const pct  = prev > 0 ? ((curr - prev) / prev) * 100 : 0;
              fillColor = getColorForPercentChange(pct);
              break;
            }

            case 'absolute-change': {
              const curr = props.current_assessed_value || 0;
              const prev = props.tax_year_assessed_value   || 0;
              const absChange = curr - prev;
              fillColor = getColorForValue(absChange, 10_000, 100_000);
              break;
            }

            default:
              fillColor = '#999999';
          }

          return {
            fill:        false,
            stroke:     true,
            weight:  0

            // or disable outlines completely:
            // stroke: false
          };
        }
      },
      interactive:    true,
      getFeatureId:   f => f.properties.property_id,
      maxNativeZoom:  18,
      minNativeZoom:  10
    });

    // Show an info popup on click
    vectorTileLayer.on('click', e => {
      const p = e.layer.properties;
      const curr = p.current_assessed_value || 0;
      const prev = p.tax_year_assessed_value   || 0;
      const pct  = prev > 0 ? ((curr - prev)/prev)*100 : 0;
      const id   = p.property_id;

      const html = `
        <div class="tooltip">
          <h3>${p.address || 'Property ' + id}</h3>
          <p>Current: $${curr.toLocaleString()}</p>
          <p>2024: $${prev.toLocaleString()}</p>
          <p>Δ%: ${pct >= 0 ? '↑' : '↓'} ${Math.abs(pct).toFixed(1)}%</p>
        </div>
      `;
      L.popup({ className: 'custom-popup' })
        .setLatLng(e.latlng)
        .setContent(html)
        .openOn(map);
    });

    // Only add to map if we're already zoomed in enough
    if (map.getZoom() >= VECTOR_TILE_ZOOM_THRESHOLD) {
      vectorTileLayer.addTo(map);
    }

    return vectorTileLayer;
  }

  // build initial layer
  vectorTileLayer = createOrUpdateVectorLayer();

  // on zoom, toggle it on/off
  map.on('zoomend', () => {
    if (map.getZoom() >= VECTOR_TILE_ZOOM_THRESHOLD) {
      if (!map.hasLayer(vectorTileLayer)) {
        map.addLayer(vectorTileLayer);
      }
      // if you had markers you'd hide them here
    } else {
      if (map.hasLayer(vectorTileLayer)) {
        map.removeLayer(vectorTileLayer);
      }
    }
  });

  return {
    updateStyle: createOrUpdateVectorLayer,
    getLayer:    () => vectorTileLayer
  };
}
