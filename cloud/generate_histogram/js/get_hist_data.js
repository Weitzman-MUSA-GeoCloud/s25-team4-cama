async function loadHistData() {

  const response = await fetch('https://us-east4-musa5090s25-team4.cloudfunctions.net/get_tax_year_assessment_bins_log');

  const data = await response.json();

  console.log(data);
  return(data)
}

export { loadHistData }