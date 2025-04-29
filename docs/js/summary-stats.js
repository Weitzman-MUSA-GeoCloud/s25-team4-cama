// Function to fetch and update summary statistics
function updateSummaryStatistics() {
    // Fetch property count
    fetch('https://us-east4-musa5090s25-team4.cloudfunctions.net/get_summary_statistic?type=propertiesIncreased')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok for property count');
        }
        return response.json();
      })
      .then(data => {
        // Update the property count element
        const propertyCountElement = document.getElementById('property-count');
        if (propertyCountElement) {
          // For array response
          let value = Array.isArray(data) ? data[0] : data.value;
          if (value !== undefined) {
            // Format number with commas
            const formattedCount = Number(value).toLocaleString();
            propertyCountElement.textContent = formattedCount;
          }
        }
      })
      .catch(error => {
        console.error('Error fetching property count:', error);
      });
  
    // Fetch average percentage change
    fetch('https://us-east4-musa5090s25-team4.cloudfunctions.net/get_summary_statistic?type=percentChangeMean')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok for percentage change');
        }
        return response.json();
      })
      .then(data => {
        // Update the average change element
        const avgChangeElement = document.getElementById('avg-change');
        if (avgChangeElement) {
          // For array response format
          let value = Array.isArray(data) ? data[0] : data.value;
          if (value !== undefined) {
            // Convert to number and format as percentage
            const percentValue = Number(value);
            const direction = percentValue >= 0 ? 'increase' : 'decrease';
            const formattedPercent = Math.abs(percentValue).toFixed(1);
            avgChangeElement.textContent = `${direction} of ${formattedPercent}% on average`;
          }
        }
      })
      .catch(error => {
        console.error('Error fetching percentage change:', error);
      });
  }
  
  // Call the function when the page loads
  document.addEventListener('DOMContentLoaded', updateSummaryStatistics);