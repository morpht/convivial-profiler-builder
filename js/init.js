/**
 * Initializes the application once the DOM content has fully loaded.
 */
document.addEventListener('DOMContentLoaded', initializeApplication);

/**
 * Initializes the application.
 */
function initializeApplication() {
  initConfiguration();
  initTable();
  setupEventListeners();
  checkConfigUrlParameter();
}

/**
 * Sets up event listeners for various buttons on the page.
 */
function setupEventListeners() {
  document.getElementById('addColumnBtn').addEventListener('click', addColumn);
  document.getElementById('addProfiler').addEventListener('click', addProfiler);
  document.getElementById('clearProfilersData').addEventListener('click', clearProfilersData);
  
  // Update textarea content when export-import tab is shown
  $('#export-import-tab').on('shown.bs.tab', function() {
    updateTextareaContent();
  });
}

