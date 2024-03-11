/**
* Imports profiler configuration from a JSON string provided in a textarea and stores it in local storage.
* Reloads the page to reflect changes.
*/
const importJSON = () => {
  // Retrieve JSON string from textarea
  const jsonContent = document.getElementById('jsonContent').value || '{}';
 
  // Parse the JSON string to an object
  const data = JSON.parse(jsonContent);
 
  // Store the parsed object into local storage
  localStorage.setItem('convivial_profiler_builder', JSON.stringify(data));
 
  // Reload the page to reflect changes
  location.reload();
};
 
/**
 * Fetches JSON data from a URL and populates the input textarea with the response.
 */
const fetchJSON = () => {
  const url = document.getElementById('importUrl').value;
  if (url) {
    fetch(url)
    .then(response => response.json())
    .then(data => {
      const jsonContent = document.getElementById('jsonContent');
      jsonContent.value = JSON.stringify(data, null, 2);
    })
    .catch(error => swal({
      title: "Error",
      text: `${error}`,
      icon: "error",
      button: "OK",
    }));
  } 
}
 
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
 
  // Reload the page
  location.reload();
 };
 
 /**
 * Updates the content of the textarea with the current profiler configuration from local storage.
 */
 const updateTextareaContent = () => {
  // Retrieve the textarea element for output
  const jsonContent = document.getElementById('jsonContent');
 
  if (jsonContent) {
    // Get profiler data from local storage
    const data = localStorage.getItem('convivial_profiler_builder') || '{}';
 
    // Format the JSON string for display
    jsonContent.value = JSON.stringify(JSON.parse(data), null, 2);
  }
 };
