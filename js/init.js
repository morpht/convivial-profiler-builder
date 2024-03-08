/**
 * Initializes the application once the DOM content has fully loaded.
 */
document.addEventListener('DOMContentLoaded', function () {
  // Initialize the configuration settings for the application.
  initConfiguration();
  // Load the documentation content from an external source.
  loadDocumentation();
  // Initialize the table with dynamic functionalities.
  initTable();
});

/**
 * Sets up event listeners for various buttons on the page.
 */
document.getElementById('addColumnBtn').addEventListener('click', addColumn);
document.getElementById('addProfiler').addEventListener('click', addProfiler);
document.getElementById('clearProfilersData').addEventListener('click', clearProfilersData);
document.getElementById('saveAll').addEventListener('click', function () {
  // Placeholder for the save functionality.
});

