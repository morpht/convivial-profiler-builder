/**
* Asynchronously adds a new profiler row to the table.
* @returns {HTMLElement} The newly created row element.
*/
const addProfiler = async () => {
  const tableBody = document.getElementById('profilersTable').querySelector('tbody');
  const row = document.createElement('tr');
  const rowNum = tableBody.rows.length + 1;
  let profilerDetailsClass = 'profiler-details mb-2';
  let dynamicFormClass = false;

  if (!document.body.classList.contains('loaded')) {
    profilerDetailsClass += ' d-none';
    dynamicFormClass = true;
  }

  const propertiesCell = document.createElement('td');
  propertiesCell.innerHTML = `
    <div class="profiler-header mb-2"></div>
    <div class="${profilerDetailsClass}">
      <div class="mb-2">
        <label>Label: <input type="text" class="form-control" name="label"></label>
      </div>
      <div class="mb-2">
          <label>Machine Name: <input type="text" class="form-control" name="machine_name"></label>
      </div>
      <div class="mb-2">
          <label>Description: <textarea class="form-control" name="description"></textarea></label>
      </div>
      <div class="form-check">
          <label class="form-check-label">
              <input type="checkbox" class="form-check-input" name="deferred"> Deferred
          </label>
      </div>
      <div class="form-check">
          <label class="form-check-label">
              <input type="checkbox" class="form-check-input" name="status"> Enabled
          </label>
      </div>
      <button class="btn btn-sm btn-danger mt-3 remove-profiler-btn" type="button">Remove this profiler</button>
    </div>
 `;
  row.appendChild(propertiesCell);

  const categories = ['sources', 'processors', 'destinations'];
  categories.forEach(category => {
    const cell = document.createElement('td');
    cell.classList.add('dynamic-form-cell');
    if (dynamicFormClass) {
      cell.classList.add('invisible');
    }
    cell.classList.add(`${category}-cell`);
    row.appendChild(cell);
    createSelectBoxForCategory(category, cell);
  });

  tableBody.appendChild(row);

  attachRowEventListeners(row, rowNum);

  return row;
};

/**
 * Adds a new column to the table for user-defined data properties.
 */
const addColumn = () => {
  const columnName = prompt("Enter the name for the new data property:", "");
  if (columnName) {
    const key = columnName.toLowerCase().replace(/\s+/g, '_');
    const dataRow = createDataRow(columnName, key);
    const table = document.getElementById('dataTable');
    table.appendChild(dataRow);
  }
};

/**
 * Creates a new data row element for the table.
 * @param {string} columnName The name of the column.
 * @param {string} key The key name for the data property.
 * @returns {HTMLElement} The created data row element.
 */
const createDataRow = (columnName, key) => {
  const dataRow = document.createElement('tr');

  const labelDataCell = createLabelDataCell(columnName);
  dataRow.appendChild(labelDataCell);

  const dataCell = createDataCell(key);
  dataRow.appendChild(dataCell);

  return dataRow;
};

/**
 * Creates a new label data cell element.
 * @param {string} columnName The name of the column.
 * @returns {HTMLElement} The created label data cell element.
 */
const createLabelDataCell = (columnName) => {
  const labelDataCell = document.createElement('td');
  labelDataCell.textContent = columnName;
  labelDataCell.scope = 'row';
  labelDataCell.className = 'col-1';
  return labelDataCell;
};

/**
 * Creates a new data cell element with an input field.
 * @param {string} key The key name for the data property.
 * @returns {HTMLElement} The created data cell element.
 */
const createDataCell = (key) => {
  const dataCell = document.createElement('td');
  dataCell.scope = 'row';
  dataCell.className = 'col-11';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = `Enter values separated by comma for ${key}...`;
  input.setAttribute('name', key);
  input.className = 'form-control mb-2 mt-2';

  dataCell.appendChild(input);
  return dataCell;
};

/**
 * Dynamically adds a new column to the table based on existing data.
 * @param {string} key The key name for the data property.
 * @param {Array|string} values The values for the data property.
 */
const addDynamicColumn = (key, values) => {
  const columnName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const dataRow = createDataRow(columnName, key);

  const input = dataRow.querySelector('input');
  input.value = Array.isArray(values) ? values.join(',') : values;

  const tableRow = document.getElementById('tableRow');
  tableRow.appendChild(dataRow);
};

/**
* Populates static fields within a row based on given properties.
* @param {HTMLElement} row The row element to populate.
* @param {Object} properties The properties to populate the row with.
*/
const populateStaticFields = async (row, properties) => {
  const header = row.querySelector('.profiler-header');
  header.innerHTML = properties.label;
  const inputs = {
    label: 'input[name="label"]',
    name: 'input[name="machine_name"]',
    description: 'textarea[name="description"]',
    deferred: 'input[name="deferred"]',
    status: 'input[name="status"]'
  };
  Object.entries(inputs).forEach(([key, selector]) => {
    const input = row.querySelector(selector);
    if (!input) return;
    if (key === 'deferred' || key === 'status') {
      input.checked = properties[key];
    } else {
      input.value = properties[key];
    }
  });
};

/**
* Attaches event listeners to all input elements within a row.
* @param {HTMLElement} row The row element to attach event listeners to.
* @param {number} rowNum The row number for reference in event handling.
*/
const attachRowEventListeners = (row, rowNum) => {
  const inputs = row.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('change', () => saveOrUpdateProfilerData(rowNum));
  });

  const removeButton = row.querySelector('.remove-profiler-btn');
  removeButton.addEventListener('click', (event) => {
    event.preventDefault();
    removeProfiler(rowNum);
    row.closest('tr').remove();
    swal({
      title: "Profiler Removed",
      text: "The profiler has been removed.",
      icon: "success",
      button: "OK",
    });
  });
};

/**
* Attaches event listeners to all input elements in the settings and data tables.
*/
const attachHeaderEventListeners = () => {
  const settingsInputs = document.querySelectorAll('#settingsTable input');
  const dataInputs = document.querySelectorAll('#dataTable input');

  settingsInputs.forEach(input => {
    input.addEventListener('change', () => saveOrUpdateSettingsData());
  });

  dataInputs.forEach(input => {
    input.addEventListener('change', () => saveOrUpdateSettingsData());
  });
};

/**
* Initializes the table with profiler data from local storage.
*/
const initTable = async () => {
  const storedData = JSON.parse(localStorage.getItem('convivial_profiler_builder')) || {};
  const convivialProfilerBuilder = storedData.config ? storedData.config.profilers : {}; // Update for new data structure

  if (storedData.site) document.querySelector('input[name="site-id"]').value = storedData.site;
  if (storedData.license_key) document.querySelector('input[name="license-key"]').value = storedData.license_key;
  if (storedData.hasOwnProperty('client_cleanup')) document.querySelector('input[name="client-cleanup"]').checked = storedData.client_cleanup;
  if (storedData.hasOwnProperty('event_tracking')) document.querySelector('input[name="enable-event-tracking"]').checked = storedData.event_tracking;

  if (storedData.config && storedData.config.data) {
    Object.entries(storedData.config.data).forEach(([key, values]) => {
      addDynamicColumn(key, values);
    });
  }

  attachHeaderEventListeners();

  for (const [profilerName, properties] of Object.entries(convivialProfilerBuilder)) {
    const addProfilerBtn = document.getElementById('addProfiler');
    if (addProfilerBtn) {
      addProfilerBtn.click();
      await wait(50);
    }

    const lastRow = document.querySelector('#profilersTable tbody tr:last-child');
    const profilerHeader = document.querySelector('#profilersTable tbody tr:last-child .profiler-header');
    const propfilerDetails = document.querySelector('#profilersTable tbody tr:last-child .profiler-details');
    const dynamicForms = document.querySelectorAll('#profilersTable tbody tr:last-child .dynamic-form-cell');

    if (!lastRow) continue;

    populateStaticFields(lastRow, properties);

    lastRow.addEventListener('dblclick', function () {
      if (!this.classList.contains('loaded')) {
        loadProfilerData(this, properties);
      } else {
        dynamicForms.forEach(cell => {
          cell.classList.toggle('d-none');
        });
      }

      profilerHeader.classList.toggle('d-none');
      propfilerDetails.classList.toggle('d-none');

      dynamicForms.forEach(cell => {
        cell.classList.toggle('invisible');
      });
    });
  }

  // Hide the loading overlay and display the table.
  document.getElementById('loadingOverlay').style.display = 'none';
  document.body.className = 'loaded';
};
