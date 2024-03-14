/**
 * Saves or updates the profiler data.
 * @param {number} rowNum - The row number of the profiler.
 */
const saveOrUpdateProfilerData = (rowNum) => {
  if (!isPageFullyLoaded()) {
    return;
  }

  const row = getProfilerRow(rowNum);
  if (!row) {
    return;
  }

  const commonFields = extractCommonFields();
  const dynamicDataFields = extractDynamicDataFields();
  const profilerData = extractProfilerData(row);

  saveCommonFields(commonFields);
  saveDynamicDataFields(dynamicDataFields);
  saveProfilerData(profilerData);
  updateTextareaContent();
};

/**
 * Saves or updates the settings and test data.
 */
const saveOrUpdateSettingsData = () => {
  if (!isPageFullyLoaded()) {
    return;
  }

  const commonFields = extractCommonFields();
  const dynamicDataFields = extractDynamicDataFields();

  saveCommonFields(commonFields);
  saveDynamicDataFields(dynamicDataFields);
  updateTextareaContent();
};

/**
 * Removes a profiler from the stored values in the local storage.
 * @param {number} rowNum - The row number of the profiler to remove.
 */
const removeProfiler = (rowNum) => {
  const row = getProfilerRow(rowNum);
  if (!row) {
    return;
  }

  const machineName = row.querySelector('input[name="machine_name"]').value;
  if (machineName) {
    let convivialProfilerBuilder = JSON.parse(localStorage.getItem('convivial_profiler_builder')) || {};
    if (convivialProfilerBuilder.config && convivialProfilerBuilder.config.profilers) {
      delete convivialProfilerBuilder.config.profilers[machineName];
      localStorage.setItem('convivial_profiler_builder', JSON.stringify(convivialProfilerBuilder));
      updateTextareaContent();
    }
  }
};

/**
 * Checks if the page is fully loaded.
 * @returns {boolean} - True if the page is fully loaded, false otherwise.
 */
const isPageFullyLoaded = () => {
  return document.body.classList.contains('loaded');
};

/**
 * Retrieves the profiler row element based on the row number.
 * @param {number} rowNum - The row number of the profiler.
 * @returns {HTMLElement|null} - The profiler row element if found and loaded, null otherwise.
 */
const getProfilerRow = (rowNum) => {
  const row = document.querySelector(`#profilersTable tbody tr:nth-child(${rowNum})`);
  return row && row.classList.contains('loaded') ? row : null;
};

/**
 * Extracts the common field values from the form.
 * @returns {Object} - An object containing the common field values.
 */
const extractCommonFields = () => {
  const siteId = document.querySelector('input[name="site-id"]').value;
  const licenseKey = document.querySelector('input[name="license-key"]').value;
  const clientCleanup = document.querySelector('input[name="client-cleanup"]').checked;
  const eventTracking = document.querySelector('input[name="enable-event-tracking"]').checked;

  return {
    siteId,
    licenseKey,
    clientCleanup,
    eventTracking
  };
};

/**
 * Extracts the dynamic data field values from the table.
 * @returns {Object} - An object containing the dynamic data field values.
 */
const extractDynamicDataFields = () => {
  const dynamicDataFields = {};
  document.querySelectorAll('#dataTable thead th').forEach((th, index) => {
    const inputName = th.textContent.toLowerCase().replace(/\s+/g, '_');
    const inputValue = document.querySelector(`#dataTable tbody tr:nth-child(${index + 1}) td input`).value;
    dynamicDataFields[inputName] = inputValue.split(',').map(item => item.trim());
  });
  return dynamicDataFields;
};

/**
 * Extracts the profiler data from the row element.
 * @param {HTMLElement} row - The profiler row element.
 * @returns {Object} - An object containing the profiler data.
 */
const extractProfilerData = (row) => {
  const labelValue = row.querySelector('input[name="label"]').value;
  const machineName = generateMachineName(row.querySelector('input[name="machine_name"]').value || labelValue);

  return {
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
};

/**
 * Saves the common fields to local storage.
 * @param {Object} commonFields - An object containing the common field values.
 */
const saveCommonFields = (commonFields) => {
  let convivialProfilerBuilder = JSON.parse(localStorage.getItem('convivial_profiler_builder')) || {};
  convivialProfilerBuilder.site = commonFields.siteId;
  convivialProfilerBuilder.license_key = commonFields.licenseKey;
  convivialProfilerBuilder.client_cleanup = commonFields.clientCleanup;
  convivialProfilerBuilder.event_tracking = commonFields.eventTracking;
  localStorage.setItem('convivial_profiler_builder', JSON.stringify(convivialProfilerBuilder));
};

/**
 * Saves the dynamic data fields to local storage.
 * @param {Object} dynamicDataFields - An object containing the dynamic data field values.
 */
const saveDynamicDataFields = (dynamicDataFields) => {
  let convivialProfilerBuilder = JSON.parse(localStorage.getItem('convivial_profiler_builder')) || {};
  convivialProfilerBuilder.config = convivialProfilerBuilder.config || {};
  convivialProfilerBuilder.config.data = dynamicDataFields;
  localStorage.setItem('convivial_profiler_builder', JSON.stringify(convivialProfilerBuilder));
};

/**
 * Saves the profiler data to local storage.
 * @param {Object} profilerData - An object containing the profiler data.
 */
const saveProfilerData = (profilerData) => {
  let convivialProfilerBuilder = JSON.parse(localStorage.getItem('convivial_profiler_builder')) || {};
  convivialProfilerBuilder.config = convivialProfilerBuilder.config || {};
  convivialProfilerBuilder.config.profilers = convivialProfilerBuilder.config.profilers || {};
  convivialProfilerBuilder.config.profilers[profilerData.name] = profilerData;
  localStorage.setItem('convivial_profiler_builder', JSON.stringify(convivialProfilerBuilder));
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
