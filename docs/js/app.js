// app.js

import { initializeMap } from './map.js';
import { setupEventListeners } from './utils.js';
import { createOrShowChart, hideChart, updateAllCharts } from './charts.js';
import { chartConfig, defaultActiveChart } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1) State & defaults
    const activeCharts = [ defaultActiveChart ];

  // 2) Initialize only the vector-tile map
    const map = initializeMap(activeCharts);


  // 3) Wire up legend clicks → vector-tile restyle + histogram fetch
    setupEventListeners(
        activeCharts,
        chartConfig,
        map,
        { createOrShowChart, hideChart }
    );

    // 4) Show & draw the default histogram
    createOrShowChart(defaultActiveChart, chartConfig);
    updateAllCharts(activeCharts);

    // 5) Dark-mode toggle
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        toggle.addEventListener('change', () => {
        document.body.classList.toggle('dark');
        // Optionally persist choice:
        // localStorage.setItem('dark', document.body.classList.contains('dark'));
        });

    // Optional: on load, restore previous setting:
    // if (localStorage.getItem('dark') === 'true') {
    //   toggle.checked = true;
    //   document.body.classList.add('dark');
    // }
    }
});



