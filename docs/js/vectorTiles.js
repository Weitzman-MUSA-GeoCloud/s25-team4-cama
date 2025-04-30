// vectorTiles.js

import { getColorForMetric } from './utils.js';

// URL template for your Google Cloud Vector tiles
const VECTOR_TILE_URL = 
  'https://storage.googleapis.com/musa5090s25-team4-public/tiles/properties/{z}/{x}/{y}.pbf';

// The internal layer name in your PBF
const VECTOR_LAYER_NAME = 'property_tile_info';

// Zoom level at which you switch from raster (points) to vector (polygons)
const VECTOR_TILE_ZOOM_THRESHOLD = 14;

export function setupVectorTiles(map, activeCharts) {
  if (!L.VectorGrid) {
    console.error('Leaflet.VectorGrid plugin is required but not loaded');
    return { updateStyle: () => null, getLayer: () => null };
  }

  // Create a custom pane to ensure proper layering
  if (!map.getPane('propertyPane')) {
    map.createPane('propertyPane');
    map.getPane('propertyPane').style.zIndex = 650;
    map.getPane('propertyPane').style.pointerEvents = 'auto';
  }

  let vectorTileLayer = null;
  
  // Color ramps for different metrics
  const colorRamps = {
    'current-values': ["#ebe6dfff", "#c3beb9ff", "#9cadb4ff", "#40a7b9ff", "#007f99ff"],
    'previous-values': ["#e9d7b8ff", "#e8c9b3ff", "#c59ca4ff", "#a48d9eff", "#606d94ff"],
    'absolute-change': ["#3900b3ff", "#714dbfff", "#9e6b90ff", "#cf9270ff", "#ebb698ff"],
    'percent-change': ["#6690ffff", "#526aadff", "#423b38ff", "#945e4cff", "#ff9573ff"]
  };

  // Creates a new version of the vector tile layer with the correct styling
  function createOrUpdateVectorLayer() {
    // Remove existing layer if present
    if (vectorTileLayer && map.hasLayer(vectorTileLayer)) {
      map.removeLayer(vectorTileLayer);
    }

    // Get the active metric
    const metric = activeCharts[0] || 'percent-change';
    console.log("Applying style for metric:", metric);

    // Get the appropriate color ramp
    const colorRamp = colorRamps[metric] || colorRamps['percent-change'];

    // Create custom error handler for vector tiles
    // This will help us debug which tiles are 404ing
    const customFetch = (url, options) => {
      return fetch(url, options)
        .then(response => {
          if (!response.ok) {
            // Just log the error but don't throw - this way we still get the tiles that do load
            console.log(`Tile error: ${response.status} for ${url}`);
          }
          return response;
        })
        .catch(error => {
          console.error(`Fetch error for ${url}:`, error);
          throw error;
        });
    };

    // Create the vector tile layer with proper styling
    vectorTileLayer = L.vectorGrid.protobuf(VECTOR_TILE_URL, {
      pane: 'propertyPane',
      fetchOptions: {
        // Use our custom fetch function
        fetch: customFetch
      },
      // Style only the successfully loaded tiles
      vectorTileLayerStyles: {
        [VECTOR_LAYER_NAME]: (properties) => {
          // Skip if no properties or no property_id (likely an error tile)
          if (!properties || !properties.property_id) {
            return { fill: false, stroke: false };
          }
          
          // Decide color based on the metric
          let fillColor;
          
          try {
            switch (metric) {
              case 'current-values': {
                const value = Number(properties.current_assessed_value || 0);
                fillColor = value > 0 ? getColorByQuantile(value, colorRamp) : '#4285F4';
                break;
              }
              case 'previous-values': {
                const value = Number(properties.tax_year_assessed_value || 0);
                fillColor = value > 0 ? getColorByQuantile(value, colorRamp) : '#4285F4';
                break;
              }
              case 'percent-change': {
                const curr = Number(properties.current_assessed_value || 0);
                const prev = Number(properties.tax_year_assessed_value || 0);
                if (curr > 0 && prev > 0) {
                  const pct = ((curr - prev) / prev) * 100;
                  fillColor = getPercentChangeColor(pct, colorRamp);
                } else {
                  fillColor = '#4285F4';
                }
                break;
              }
              case 'absolute-change': {
                const curr = Number(properties.current_assessed_value || 0);
                const prev = Number(properties.tax_year_assessed_value || 0);
                const absChange = Math.abs(curr - prev);
                fillColor = (curr > 0 || prev > 0) ? getColorByQuantile(absChange, colorRamp) : '#4285F4';
                break;
              }
              default:
                fillColor = '#4285F4';
            }
          } catch (e) {
            console.error("Error styling property:", e);
            fillColor = '#4285F4';
          }

          // Return the style for this property
          return {
            fill: true,
            fillColor: fillColor,
            fillOpacity: 0.8,
            stroke: true,
            color: '#FFFFFF',
            weight: 1,
            opacity: 0.8
          };
        }
      },
      // Error handling for tiles
      tileError: (err, tile) => {
        console.log('Tile error:', err, tile);
        // Continue without throwing to get the tiles that do load
        return;
      },
      interactive: true,
      getFeatureId: f => f.properties.property_id,
      maxNativeZoom: 18,
      minNativeZoom: 10,
      rendererFactory: L.svg.tile,
      className: 'property-vector-tiles'
    });

    // Show popup on click
    vectorTileLayer.on('click', e => {
      if (!e.layer || !e.layer.properties) return;
      
      const p = e.layer.properties;
      const curr = Number(p.current_assessed_value || 0);
      const prev = Number(p.tax_year_assessed_value || 0);
      const pct = prev > 0 ? ((curr - prev)/prev)*100 : 0;
      const id = p.property_id;

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

    // Only add to map if zoomed in enough
    if (map.getZoom() >= VECTOR_TILE_ZOOM_THRESHOLD) {
      vectorTileLayer.addTo(map);
    }

    return vectorTileLayer;
  }

  // Helper function to get color based on quantile ranges
  function getColorByQuantile(value, colorRamp) {
    // Quantile breakpoints as specified
    const breakpoints = [100000, 146900, 192900, 248900, 351400];
    
    if (value < breakpoints[0]) {
      return colorRamp[0];
    } else if (value < breakpoints[1]) {
      return colorRamp[0]; // First two ranges use same color
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

  // Helper function for percent change
  function getPercentChangeColor(pct, colorRamp) {
    if (pct < -10) {
      return colorRamp[0];
    } else if (pct < -5) {
      return colorRamp[1];
    } else if (pct < 5) {
      return colorRamp[2];
    } else if (pct < 10) {
      return colorRamp[3];
    } else {
      return colorRamp[4];
    }
  }

  // Initialize vector tile layer
  vectorTileLayer = createOrUpdateVectorLayer();

  // On zoom, toggle it on/off
  map.on('zoomend', () => {
    if (map.getZoom() >= VECTOR_TILE_ZOOM_THRESHOLD) {
      if (!map.hasLayer(vectorTileLayer)) {
        map.addLayer(vectorTileLayer);
      }
    } else {
      if (map.hasLayer(vectorTileLayer)) {
        map.removeLayer(vectorTileLayer);
      }
    }
  });

  // Handle map style updates
  map.on('updatevectortiles', () => {
    console.log("Updating vector tiles style...");
    vectorTileLayer = createOrUpdateVectorLayer();
  });

  // Add CSS for styling
  addCustomCSS();

  return {
    updateStyle: createOrUpdateVectorLayer,
    getLayer: () => vectorTileLayer
  };
}

// Add custom CSS
function addCustomCSS() {
  if (document.getElementById('vector-tile-styles')) {
    return; // Already added
  }

  const style = document.createElement('style');
  style.id = 'vector-tile-styles';
  style.innerHTML = `
    /* Custom styling for vector tiles */
    .property-vector-tiles {
      pointer-events: auto !important;
    }
    
    /* We need to override any styles that might be styling the 404 fill-in polygons */
    .leaflet-tile-loaded path:not(.property-vector-tiles path) {
      fill-opacity: initial !important;
      fill: initial !important;
    }
    
    /* Make sure our popups look good */
    .custom-popup .leaflet-popup-content-wrapper {
      border-radius: 4px;
    }
    
    .tooltip h3 {
      margin: 0 0 5px 0;
    }
    
    .tooltip p {
      margin: 3px 0;
    }
  `;
  document.head.appendChild(style);
}