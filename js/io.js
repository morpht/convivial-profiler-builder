/**
 * Imports profiler configuration from a JSON string provided in a textarea and stores it in local storage.
 * Reloads the page to reflect changes.
 */
const importJSON = () => {
  // Retrieve JSON string from textarea
  const jsonContent = document.getElementById('jsonContent').value || '{}';
  console.log('Importing JSON:', jsonContent);
  
  // Parse the JSON string to an object with safe parsing
  let data;
  try {
    data = JSON.parse(jsonContent);
  } catch (error) {
    console.error('JSON parse error:', error);
    swal({
      title: "Error",
      text: "Invalid JSON format",
      icon: "error",
      button: "OK",
    });
    return;
  }
  
  console.log('Parsed JSON data:', data);
  // Store the parsed object into local storage
  localStorage.setItem('convivial_profiler_builder', JSON.stringify(data));
  console.log('Data stored in local storage:', localStorage.getItem('convivial_profiler_builder'));
  
  // Update the textarea with the stored content
  updateTextareaContent();
  
  // Remove the "config" query parameter from the URL
  removeConfigUrlParameter();
  
  // Reload the page to reflect changes
  location.reload();
};

/**
 * Fetches JSON data from a URL and populates the input textarea with the response.
 * @returns {Promise} A promise that resolves when the JSON data is fetched and processed.
 */
const fetchJSON = () => {
  return new Promise((resolve, reject) => {
    const url = document.getElementById('importUrl').value;
    if (url) {
      fetch(url)
        .then(response => response.json())
        .then(data => {
          const jsonContent = document.getElementById('jsonContent');
          jsonContent.value = JSON.stringify(data, null, 2);
          resolve();
        })
        .catch(error => {
          swal({
            title: "Error",
            text: `${error}`,
            icon: "error",
            button: "OK",
          });
          reject(error);
        });
    } else {
      resolve();
    }
  });
};

/**
 * Downloads the current profiler configuration as a JSON file.
 */
const downloadJSON = () => {
  // Retrieve profiler configuration JSON string from textarea
  const data = document.getElementById('jsonContent').value || '{}';
  
  // Create a Blob with the JSON data
  const blob = new Blob([data], { type: 'application/json' });
  
  // Generate a URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Create an anchor element to facilitate download
  const a = document.createElement('a');
  a.href = url;
  a.download = 'profiler.json'; // Set the default file name for the download
  a.click(); // Trigger the download
  
  URL.revokeObjectURL(url); // Clean up by revoking the Blob URL
};

/**
 * Clears profiler configuration data from local storage and reloads the page.
 */
const clearProfilersData = () => {
  // Remove profiler data from local storage
  localStorage.removeItem('convivial_profiler_builder');
  
  // Update the textarea content to reflect the removal
  updateTextareaContent();
  
  // Clear all input fields.
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.checked = false;
    input.value = '';
  });
  
  // Reload the page
  location.reload();
};

/**
 * Updates the content of the textarea with the current profiler configuration from local storage.
 */
const updateTextareaContent = () => {
  const jsonContent = document.getElementById('jsonContent');
  if (jsonContent) {
    const rawData = localStorage.getItem('convivial_profiler_builder');
    
    if (!rawData || rawData === 'undefined' || rawData === 'null') {
      jsonContent.value = '{}';
      return;
    }
    
    try {
      const data = JSON.parse(rawData);
      jsonContent.value = JSON.stringify(data, null, 2);
    } catch (error) {
      console.warn('Invalid JSON in localStorage, showing empty object');
      jsonContent.value = '{}';
    }
  }
};

/**
 * Checks for the "config" query parameter in the URL on page load.
 * If the value is a valid URL, it adds the URL to the input field with ID "importUrl" and calls the fetchJSON() function.
 */
async function checkConfigUrlParameter() {
  const urlParams = new URLSearchParams(window.location.search);
  const configUrl = urlParams.get('config');
  
  if (configUrl && isValidUrl(configUrl)) {
    const importUrlInput = document.getElementById('importUrl');
    importUrlInput.value = configUrl;
    
    try {
      await fetchJSON();
      importJSON();
    } catch (error) {
      console.error('Error fetching JSON:', error);
    }
  }
}

/**
 * Removes the "config" query parameter from the URL.
 */
function removeConfigUrlParameter() {
  const url = new URL(window.location.href);
  url.searchParams.delete('config');
  const newUrl = url.toString();
  history.replaceState(null, '', newUrl);
}
