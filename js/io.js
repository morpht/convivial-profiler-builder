/**
 * Imports profiler configuration from a JSON string provided in a textarea and stores it in local storage.
 * Reloads the page to reflect changes.
 */
function importJSON() {
  // Retrieve JSON string from textarea
  const jsonInput = document.getElementById('jsonInput').value || '{}';
  // Parse the JSON string to an object
  const data = JSON.parse(jsonInput);
  // Store the parsed object into local storage
  localStorage.setItem('profilersData', JSON.stringify(data));
  // Reload the page to reflect changes
  location.reload();
}

/**
 * Downloads the current profiler configuration as a JSON file.
 */
function downloadJSON() {
  // Retrieve profiler configuration JSON string from textarea
  const data = document.getElementById('jsonOutput').value || '{}';
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
}

/**
 * Clears profiler configuration data from local storage and reloads the page.
 */
function clearProfilersData() {
  // Remove profiler data from local storage
  localStorage.removeItem('profilersData');
  // Update the textarea content to reflect the removal
  updateTextareaContent();
  // Reload the page
  location.reload();
}

/**
 * Updates the content of the textarea with the current profiler configuration from local storage.
 */
function updateTextareaContent() {
  // Retrieve the textarea element for output
  const jsonOutput = document.getElementById('jsonOutput');
  if (jsonOutput) {
    // Get profiler data from local storage
    const data = localStorage.getItem('profilersData') || '{}';
    // Format the JSON string for display
    jsonOutput.value = JSON.stringify(JSON.parse(data), null, 2);
  }
}
