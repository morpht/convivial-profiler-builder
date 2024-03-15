/**
* Initializes the application once the DOM content has fully loaded.
*/
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the configuration settings for the application.
  initConfiguration();
 
  // Initialize the table with dynamic functionalities.
  initTable();
 });
 
 /**
 * Sets up event listeners for various buttons on the page.
 */
 document.getElementById('addColumnBtn').addEventListener('click', addColumn);
 document.getElementById('addProfiler').addEventListener('click', addProfiler);
 document.getElementById('clearProfilersData').addEventListener('click', clearProfilersData);
