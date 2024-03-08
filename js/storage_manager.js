/**
 * Saves or updates profiler data into local storage based on user input.
 * @param {number} rowNum - The row number in the profiler table to save or update data for.
 */
function saveOrUpdateProfilerData(rowNum) {
  // Ensure the page is fully loaded
  if (!document.body.classList.contains('loaded')) {
    return;
  }

  // Collect common form fields
  const siteId = document.querySelector('input[name="site-id"]').value;
  const licenseKey = document.querySelector('input[name="license-key"]').value;
  const clientCleanup = document.querySelector('input[name="client-cleanup"]').checked;
  const eventTracking = document.querySelector('input[name="enable-event-tracking"]').checked;

  // Gather dynamic data fields from the table
  let dynamicDataFields = {};
  document.querySelectorAll(`#dataTable thead th`).forEach((th, index) => {
    const inputName = th.textContent.toLowerCase().replace(/\s+/g, '_');
    const inputValue = document.querySelector(`#dataTable tbody tr td:nth-child(${index + 1}) input`).value;
    dynamicDataFields[inputName] = inputValue.split(',').map(item => item.trim());
  });

  // Load existing profiler data from local storage
  let profilersData = JSON.parse(localStorage.getItem('profilersData')) || {};
  if (profilersData["config"] !== undefined) {
    profilersData = profilersData["config"]["profilers"];
  }

  // Fetch and validate the current row
  const row = document.querySelector(`#profilersTable tbody tr:nth-child(${rowNum})`);
  if (!row) {
    console.error('Row not found for rowNum:', rowNum);
    return;
  }

  // Collect profiler specific data
  const labelValue = row.querySelector('input[name="label"]').value;
  let machineName = generateMachineName(row.querySelector('input[name="machine_name"]').value || labelValue);

  // Prepare profiler data for saving
  const profilerData = {
    sources: captureCategoryConfig(row.cells[2]),
    processors: captureCategoryConfig(row.cells[3]),
    destinations: captureCategoryConfig(row.cells[4]),
    label: labelValue,
    name: machineName,
    description: row.querySelector('textarea[name="description"]').value,
    deferred: row.querySelector('input[name="deferred"]').checked,
    status: row.querySelector('input[name="status"]').checked,
    weight: 1
  };

  // Update local storage with new profiler data
  profilersData[machineName] = profilerData;
  const newSettingsAndData = {
    site: siteId,
    license_key: licenseKey,
    client_cleanup: clientCleanup,
    event_tracking: eventTracking,
    config: {
      data: dynamicDataFields,
      profilers: profilersData
    }
  };

  localStorage.setItem('profilersData', JSON.stringify(newSettingsAndData));
  updateTextareaContent();
}

/**
 * Loads profiler data from local storage and updates the form.
 * @param {HTMLElement} row - The table row element where profiler data will be loaded.
 * @param {Object} properties - The profiler properties to load.
 */
async function loadProfilerData(row, properties) {
  document.getElementById('loadingOverlay').style.display = 'block';
  // Sequentially handle each category of profiler data
  await handleCategory(row, 'sources', properties.sources || [], 300);
  await handleCategory(row, 'processors', properties.processors || [], 300);
  await handleCategory(row, 'destinations', properties.destinations || [], 300);
  await wait(100); // Wait for UI to update
  row.classList.add('loaded');
  document.getElementById('loadingOverlay').style.display = 'none';
}

/**
 * Populates the profiler forms from data stored in local storage.
 */
function populateProfilersFromLocalStorage() {
  const profilersData = JSON.parse(localStorage.getItem('profilersData')) || {};
  Object.keys(profilersData).forEach(profilerKey => {
    const profiler = profilersData[profilerKey];
    // Call addProfilerForm for each profiler in local storage
    addProfilerForm(profiler);
  });
}
