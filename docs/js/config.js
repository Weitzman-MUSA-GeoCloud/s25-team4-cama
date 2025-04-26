// Configuration for the application
// config.js
export const chartConfig = [
    {
      id: 'current-values',
      title: 'Current absolute assessment $ values',
      chartType: 'current-value-chart',
      chartTitle: 'Current assessment value distribution…',
      apiUrl: 'https://us-east4-musa5090s25-team4.cloudfunctions.net/get_tax_year_assessment_bins?year=2025&scale=log'
    },
    {
      id: 'previous-values',
      title: 'Tax year 2024 absolute assessment $ values',
      chartType: 'previous-value-chart',
      chartTitle: 'Prior‐year assessment value distribution…',
      apiUrl: 'https://us-east4-musa5090s25-team4.cloudfunctions.net/get_tax_year_assessment_bins?year=2024&scale=log'
    },
    {
      id: 'percent-change',
      title: 'Change (%) in assessment since tax year 2024',
      chartType: 'percent-change-chart',
      chartTitle: 'Percent change since last assessment…',
      apiUrl: 'https://us-east4-musa5090s25-team4.cloudfunctions.net/get_pct_change_bins?year=2024&scale=log'
    },
    {
      id: 'absolute-change',
      title: 'Change ($) in assessment since tax year 2024',
      chartType: 'absolute-change-chart',
      chartTitle: 'Absolute change in assessment…',
      apiUrl: 'https://us-east4-musa5090s25-team4.cloudfunctions.net/get_absolute_change_bins?year=2024&scale=log'
    }
  ];
  



  export const defaultActiveChart = 'percent-change';
export const defaultMapSettings = { center: [39.9526, -75.1652], zoom: 13 };
  
