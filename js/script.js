const defaultUrls = {
  sources: 'https://raw.githubusercontent.com/eleonel/Convivial-Profiler/1.0.x/convivial_profiler.profiler_source.yml',
  processors: 'https://raw.githubusercontent.com/eleonel/Convivial-Profiler/1.0.x/convivial_profiler.profiler_processor.yml',
  destinations: 'https://raw.githubusercontent.com/eleonel/Convivial-Profiler/1.0.x/convivial_profiler.profiler_destination.yml'
};

let urls = { ...defaultUrls }; // Copy default URLs

document.getElementById('clearProfilersData').addEventListener('click', function () {
  localStorage.removeItem('profilersData');
  alert('Profilers data cleared from local storage.');

  // Optionally, refresh the page or UI to reflect the changes
  location.reload(); // Use with caution; this will reload the page
  // OR you might want to just clear the UI elements related to the profilersData without reloading the page.
});

document.addEventListener('DOMContentLoaded', function () {
  // Load stored configuration on page load
  loadConfiguration();
  populateProfilersFromLocalStorage(); // New function to populate the form

  document.getElementById('configForm').addEventListener('submit', function (e) {
      e.preventDefault();

      const profilerSettings = {
          sources: document.getElementById('sourceUrl').value || defaultUrls.sources,
          processors: document.getElementById('processorUrl').value || defaultUrls.processors,
          destinations: document.getElementById('destinationUrl').value || defaultUrls.destinations
      };

      localStorage.setItem('profiler_settings', JSON.stringify(profilerSettings));

      // Optionally, refresh the application state to use the new URLs
      updateFetchURLs();
  });

  buildTreeFromLocalStorage();
});

function loadConfiguration() {
  const profilerSettings = JSON.parse(localStorage.getItem('profiler_settings'));
  if (profilerSettings) {
      document.getElementById('sourceUrl').value = profilerSettings.sources || '';
      document.getElementById('processorUrl').value = profilerSettings.processors || '';
      document.getElementById('destinationUrl').value = profilerSettings.destinations || '';
  }
}

function updateFetchURLs() {
  const settings = JSON.parse(localStorage.getItem('profiler_settings')) || {};
  urls.sources = settings.sources || defaultUrls.sources;
  urls.processors = settings.processors || defaultUrls.processors;
  urls.destinations = settings.destinations || defaultUrls.destinations;
}

document.getElementById('addProfiler').addEventListener('click', addProfiler);

async function fetchYAMLData(category) {
  // Load settings from localStorage, fallback to defaultUrls if not set
  const settings = JSON.parse(localStorage.getItem('profiler_settings')) || {};
  const url = settings[category] || defaultUrls[category];

  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const yamlText = await response.text();
      return jsyaml.load(yamlText);
  } catch (error) {
      console.error(`Failed to fetch YAML data for ${category}:`, error);
      return null;
  }
}

async function createSelectBoxForCategory(category, cell) {
  const data = await fetchYAMLData(category);

  // Function to create select box and form container
  const createSelectBoxAndFormContainer = () => {
      // Container for select and its dynamic form
      const selectFormContainer = document.createElement('div');
      cell.appendChild(selectFormContainer);

      let select = document.createElement('select');
      select.className = 'form-control mb-2';
      select.name = category;
      select.innerHTML = `<option value="">Select ${category}</option>` +
          Object.keys(data).map(key => `<option value="${key}">${data[key].label}</option>`).join('');
      selectFormContainer.appendChild(select);

      select.onchange = () => handleCategoryChange(select, selectFormContainer, data);
  };

  // Add "Add another ..." button if not already present
  if (!cell.querySelector('.add-another-btn')) {
      const addButton = document.createElement('button');
      addButton.textContent = `Add ${category.slice(0, -1)}`;
      addButton.className = 'btn btn-sm btn-secondary mb-2 add-another-btn';
      addButton.type = 'button';
      addButton.onclick = createSelectBoxAndFormContainer;
      cell.appendChild(addButton);
  }

  // Call the function to create the initial select box and form container
  //createSelectBoxAndFormContainer();

  
}

async function handleCategoryChange(select, container, data) {
  const selectedOptionData = data[select.value];
  if (selectedOptionData && selectedOptionData.form) {
      // Append new form elements within the container
      createFormElements(selectedOptionData.form, container, select.name, select.value);
  }

  // Trigger save to include all dynamic forms
  const currentRow = select.closest('tr');
  const rowIndex = Array.from(currentRow.parentNode.children).indexOf(currentRow) + 1;
  saveOrUpdateProfilerData(rowIndex);
}


async function addProfiler() {
  const tableBody = document.getElementById('profilersTable').querySelector('tbody');
  const row = document.createElement('tr');
  const rowNum = tableBody.rows.length + 1;

  // Number cell
  const numberCell = document.createElement('th');
  numberCell.scope = 'row';
  numberCell.textContent = rowNum;
  row.appendChild(numberCell);

  // Properties cell (combining Label, Description, Deferred, Status)
  const propertiesCell = document.createElement('td');
  propertiesCell.innerHTML = `
          <div class="mb-2">
              <label>Label: <input type="text" class="form-control" name="label"></label>
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
                  <input type="checkbox" class="form-check-input" name="status"> Status
              </label>
          </div>
      `;
  row.appendChild(propertiesCell);

  // Existing logic to add a profiler row
  const categories = ['sources', 'processors', 'destinations'];
  categories.forEach(category => {
      const cell = document.createElement('td');
      cell.classList.add(`${category}-cell`);
      row.appendChild(cell);
      createSelectBoxForCategory(category, cell);
  });

  tableBody.appendChild(row);

  attachRowEventListeners(row, rowNum);

  return row;
}

function attachRowEventListeners(row, rowNum) {
  const inputs = row.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
      input.addEventListener('change', () => saveOrUpdateProfilerData(rowNum));
  });
}

function createFormElements(formDefinition, container, category, selectedType) {
  // Clear out any previously added dynamic form elements
  const existingDynamicElements = container.querySelectorAll('.dynamic-form-element');
  existingDynamicElements.forEach(el => el.remove());

  Object.entries(formDefinition).forEach(([key, field]) => {
      const formGroup = document.createElement('div');
      formGroup.className = 'dynamic-form-element';
      container.appendChild(formGroup);

      let input;
      const label = document.createElement('label');
      label.textContent = field['#title'];
      formGroup.appendChild(label);

      switch (field['#type']) {
          case 'textfield':
          case 'number':
          case 'date':
              input = document.createElement('input');
              input.type = field['#type'] === 'textfield' ? 'text' : field['#type'];
              break;
          case 'textarea':
              input = document.createElement('textarea');
              break;
          case 'select':
              input = document.createElement('select');
              if (field['#options']) {
                  Object.entries(field['#options']).forEach(([optionValue, optionLabel]) => {
                      const option = document.createElement('option');
                      option.value = optionValue;
                      option.textContent = optionLabel;
                      input.appendChild(option);
                  });
              }
              break;
          case 'checkbox':
              input = document.createElement('input');
              input.type = 'checkbox';
              formGroup.className = 'form-check dynamic-form-element';
              label.className = 'form-check-label';
              label.insertBefore(input, label.firstChild); // Insert checkbox before label text
              break;
          default:
              input = document.createElement('input');
              input.type = 'text'; // Default type
      }

      input.className = 'form-control';
      input.name = key;
      input.placeholder = field['#description'];
      if (field['#default_value']) input.value = field['#default_value'];
      if (field['#required']) input.required = true;

      if (field['#type'] !== 'checkbox') {
          // For non-checkbox types, append input after label
          formGroup.appendChild(input);
      }

      // Attach event listener to input for updating localStorage on change
      input.addEventListener('change', function () {
          const currentRow = this.closest('tr');
          const rowIndex = Array.from(currentRow.parentNode.children).indexOf(currentRow) + 1;
          saveOrUpdateProfilerData(rowIndex);
      });
  });
}

// Invoke saveOrUpdateProfilerData for input changes
function attachInputEventListeners(container, rowNum) {
  const inputs = container.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
      input.addEventListener('change', () => saveOrUpdateProfilerData(rowNum - 1));
  });
}

function generateMachineName(label) {
  return label.toLowerCase().replace(/\s+/g, '_');
}

function populateProfilersFromLocalStorage() {
  const profilersData = JSON.parse(localStorage.getItem('profilersData')) || {};
  Object.keys(profilersData).forEach((profilerKey) => {
      const profiler = profilersData[profilerKey];
      // Call addProfilerForm with the correct profiler data
      addProfilerForm(profiler);
  });
}

async function addProfilerForm(profiler) {
  // Assuming you have a function to add a new profiler section
  const newRow = await addProfiler(); // Add a new profiler and get a reference to its container

  // Populate the profiler form fields with saved data
  newRow.querySelector('[name="label"]').value = profiler.label || '';
  newRow.querySelector('[name="description"]').value = profiler.description || '';
  newRow.querySelector('[name="deferred"]').checked = !!profiler.deferred;
  newRow.querySelector('[name="status"]').checked = !!profiler.status;

  // You'll also need to set the selected values for sources, processors, and destinations
  // This might involve setting the value of a <select> element and then triggering
  // any event listeners that add the dynamic form elements based on that selection.
  setSelectValueAndTriggerChange(newRow.querySelector('[name="sources"]'), profiler.sources);
  setSelectValueAndTriggerChange(newRow.querySelector('[name="processors"]'), profiler.processors);
  setSelectValueAndTriggerChange(newRow.querySelector('[name="destinations"]'), profiler.destinations);

  // Continue to populate any additional dynamic fields as necessary
}

async function setSelectValueAndTriggerChange(selectElement, value, profilerKey) {
  if (!selectElement || !value) return;

  // Assuming value is an array with objects having a 'type' property
  if (value.length > 0 && value[0].type) {
      selectElement.value = value[0].type;

      // Trigger the change event to create dynamic form elements
      selectElement.dispatchEvent(new Event('change'));

      // Wait for the dynamic elements to be created
      // This can be tricky as it depends on how you're dynamically creating these elements
      // Here's a simple approach using a timeout to wait for the elements to be created
      // A more robust solution would be to have a callback or event listener for when dynamic elements are ready
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for dynamic elements to be created

      // Now, populate the dynamic form elements with values
      populateDynamicFormElements(selectElement.closest('td'), value[0], profilerKey);
  }
}

function populateDynamicFormElements(container, formData, profilerKey) {
  Object.keys(formData).forEach(key => {
      const inputElement = container.querySelector(`[name="${key}"]`);
      if (inputElement) {
          inputElement.value = formData[key];
          // For checkboxes, you might need to handle them specifically
          if (inputElement.type === 'checkbox') {
              inputElement.checked = formData[key];
          }
      }
  });
}

function saveOrUpdateProfilerData(rowNum) {
  const profilersData = JSON.parse(localStorage.getItem('profilersData')) || {};
  const row = document.querySelector(`#profilersTable tbody tr:nth-child(${rowNum})`);

  if (!row) {
      console.error('Row not found for rowNum:', rowNum);
      return;
  }

  const labelValue = row.querySelector('input[name="label"]').value;
  const machineName = generateMachineName(labelValue);

  const profilerData = {
      sources: captureCategoryConfig(row.cells[2]), // Assuming 3rd cell is for sources
      processors: captureCategoryConfig(row.cells[3]), // Assuming 4th cell is for processors
      destinations: captureCategoryConfig(row.cells[4]), // Assuming 5th cell is for destinations
      label: labelValue,
      name: machineName,
      description: row.querySelector('textarea[name="description"]').value,
      deferred: row.querySelector('input[name="deferred"]').checked,
      status: row.querySelector('input[name="status"]').checked,
      weight: 1
  };

  profilersData[machineName] = profilerData;
  localStorage.setItem('profilersData', JSON.stringify(profilersData));
  updateTextareaContent();
  buildTreeFromLocalStorage(); // Refresh the tree
}

function updateTextareaContent() {
  const jsonOutput = document.getElementById('jsonOutput');
  if (jsonOutput) {
      const data = localStorage.getItem('profilersData') || '{}';
      jsonOutput.value = JSON.stringify(JSON.parse(data), null, 2);
  }
}

function downloadJSON() {
  const data = document.getElementById('jsonOutput').value || '{}';
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'profiler.json';
  a.click();
  URL.revokeObjectURL(url);
}

function buildTreeFromLocalStorage() {
  const profilersData = JSON.parse(localStorage.getItem('profilersData') || '{}');
  const treeData = convertDataToJsTreeFormat(profilersData);

  // Check if jsTree has already been initialized on the #profilersTree
  if ($('#profilersTree').data('jstree')) {
      // jsTree is already initialized, refresh its data
      $('#profilersTree').jstree(true).settings.core.data = treeData;
      $('#profilersTree').jstree(true).refresh();
  } else {
      // Initialize jsTree for the first time
      $('#profilersTree').jstree({
          'core': {
              'data': treeData,
              "themes" : { "stripes" : true },
          }
      });
  }
}

// Function to convert profiler data to jsTree format
function convertDataToJsTreeFormat(profilersData) {
  return Object.entries(profilersData).map(([key, profiler]) => ({
      text: profiler.label || key,
      state: {
          opened: true // Open all nodes for visibility
      },
      children: [
          {
              text: 'Sources',
              children: profiler.sources?.map(source => {
                  const sourceDetails = Object.entries(source).map(([key, detail]) => ({
                      text: `${detail.type}: ${detail.name || detail.attribute_name || ''}`
                  }));
                  return { text: `Source ${key}`, children: sourceDetails };
              }) || []
          },
          {
              text: 'Processors',
              children: profiler.processors?.map(processor => {
                  const processorDetails = Object.entries(processor).map(([key, detail]) => ({
                      text: `${detail.type}: ${detail.storage_key || ''}, Normalize: ${detail.normalize ? 'Yes' : 'No'}`
                  }));
                  return { text: `Processor ${key}`, children: processorDetails };
              }) || []
          },
          {
              text: 'Destinations',
              children: profiler.destinations?.map(destination => {
                  const destinationDetails = Object.entries(destination).map(([key, detail]) => ({
                      text: `${detail.type}: ${detail.target_key || ''}`
                  }));
                  return { text: `Destination ${key}`, children: destinationDetails };
              }) || []
          }
      ]
  }));
}


function captureCategoryConfig(cell) {
  const configs = [];
  if (cell) {
      const select = cell.querySelector('select');
      const selectedType = select ? select.value : '';
      if (selectedType) {
          const config = { };
          // Query all relevant form elements
          const allElements = cell.querySelectorAll('input, select, textarea');
          var index = 0;
          allElements.forEach(input => {
              // Filter out select elements with names 'sources', 'processors', 'destinations'
              if (input.tagName.toLowerCase() === 'select' && ['sources', 'processors', 'destinations'].includes(input.name)) {
                  index++;
                  config[index] = { type: selectedType };
                  return; // Skip this iteration

              }
              console.log(input.name);
              const value = input.type === 'checkbox' ? input.checked : input.value;
              if (input.name && value !== undefined) {
                  config[index][input.name] = value ;
              }
          });
          configs.push(config);
      }
  }
  return configs;
}
