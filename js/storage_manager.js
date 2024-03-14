/**
* Saves or updates profiler data into local storage based on user input.
* @param {number} rowNum - The row number in the profiler table to save or update data for.
*/
const saveOrUpdateProfilerData = (rowNum) => {
  // Ensure the page is fully loaded
  if (!document.body.classList.contains('loaded')) {
    return;
  }
 
  // Fetch and validate the current row
  const row = document.querySelector(`#profilersTable tbody tr:nth-child(${rowNum})`);
  if (!row || !row.classList.contains('loaded')) {
    return;
  }
 
  // Collect common form fields
  const siteId = document.querySelector('input[name="site-id"]').value;
  const licenseKey = document.querySelector('input[name="license-key"]').value;
  const clientCleanup = document.querySelector('input[name="client-cleanup"]').checked;
  const eventTracking = document.querySelector('input[name="enable-event-tracking"]').checked;
 
  // Gather dynamic data fields from the table
  const dynamicDataFields = {};
  document.querySelectorAll('#dataTable thead th').forEach((th, index) => {
    const inputName = th.textContent.toLowerCase().replace(/\s+/g, '_');
    const inputValue = document.querySelector(`#dataTable tbody tr:nth-child(${index + 1}) td input`).value;
    dynamicDataFields[inputName] = inputValue.split(',').map(item => item.trim());
  });
 
  // Load existing profiler data from local storage
  let convivialProfilerBuilder = JSON.parse(localStorage.getItem('convivial_profiler_builder')) || {};
  if (convivialProfilerBuilder["config"] !== undefined) {
    convivialProfilerBuilder = convivialProfilerBuilder["config"]["profilers"];
  }
 
  // Collect profiler specific data
  const labelValue = row.querySelector('input[name="label"]').value;
  const machineName = generateMachineName(row.querySelector('input[name="machine_name"]').value || labelValue);
 
  // Prepare profiler data for saving
  const profilerData = {
    sources: captureCategoryConfig(row.cells[1]),
    processors: captureCategoryConfig(row.cells[2]),
    destinations: captureCategoryConfig(row.cells[3]),
    label: labelValue,
    name: machineName,
    description: row.querySelector('textarea[name="description"]').value,
    deferred: row.querySelector('input[name="deferred"]').checked,
    status: row.querySelector('input[name="status"]').checked,
    weight: 1
  };
 
  // Update local storage with new profiler data
  convivialProfilerBuilder[machineName] = profilerData;
  const newSettingsAndData = {
    site: siteId,
    license_key: licenseKey,
    client_cleanup: clientCleanup,
    event_tracking: eventTracking,
    config: {
      data: dynamicDataFields,
      profilers: convivialProfilerBuilder
    }
  };
 
  localStorage.setItem('convivial_profiler_builder', JSON.stringify(newSettingsAndData));
  updateTextareaContent();
 };
 
 /**
 * Loads profiler data from local storage and updates the form.
 * @param {HTMLElement} row - The table row element where profiler data will be loaded.
 * @param {Object} properties - The profiler properties to load.
 */
 const loadProfilerData = async (row, properties) => {
  document.getElementById('loadingOverlay').style.display = 'block';
 
  // Sequentially handle each category of profiler data
  await handleCategory(row, 'sources', properties.sources || [], 300);
  await handleCategory(row, 'processors', properties.processors || [], 300);
  await handleCategory(row, 'destinations', properties.destinations || [], 300);
 
  await wait(100); // Wait for UI to update
  row.classList.add('loaded');
  document.getElementById('loadingOverlay').style.display = 'none';
 };
 
 /**
 * Populates the profiler forms from data stored in local storage.
 */
 const populateProfilersFromLocalStorage = () => {
  const convivialProfilerBuilder = JSON.parse(localStorage.getItem('convivial_profiler_builder')) || {};
  Object.keys(convivialProfilerBuilder).forEach(profilerKey => {
    const profiler = convivialProfilerBuilder[profilerKey];
    // Call addProfilerForm for each profiler in local storage
    addProfilerForm(profiler);
  });
 };
