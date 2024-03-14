/**
* Asynchronously creates a select box for a specific category within a given cell.
* @param {string} category The category to create a select box for (e.g., sources, processors, destinations).
* @param {HTMLElement} cell The table cell element where the select box will be placed.
*/
const createSelectBoxForCategory = async (category, cell) => {
  const data = await fetchYAMLData(category);
 
  const createSelectBoxAndFormContainer = () => {
    const selectFormContainer = document.createElement('div');
    selectFormContainer.className = 'dynamic-form-container';
    cell.appendChild(selectFormContainer);
 
    const select = document.createElement('select');
    select.className = 'form-control mb-2 mt-2';
    select.name = category;
    select.innerHTML = `<option value="">Select ${category}</option>` +
      Object.keys(data).map(key => `<option value="${key}">${data[key].label}</option>`).join('');
    selectFormContainer.appendChild(select);
 
    select.onchange = () => handleCategoryChange(select, selectFormContainer, data, cell);
  };
 
  if (!cell.querySelector('.add-another-btn')) {
    const addButton = document.createElement('button');
    addButton.textContent = `Add ${category.slice(0, -1)}`;
    addButton.className = 'btn btn-sm btn-secondary mb-2 mt-2 add-another-btn';
    addButton.type = 'button';
    addButton.onclick = createSelectBoxAndFormContainer;
    cell.appendChild(addButton);
  }
 };
 
 /**
 * Handles the process of populating a specific category with items and applying necessary delays between actions.
 * @param {HTMLElement} row The table row element that corresponds to a profiler configuration.
 * @param {string} category The category being handled (e.g., sources, processors, destinations).
 * @param {Array} items The items to populate the category with.
 * @param {number} delay The delay (in milliseconds) between actions.
 */
 const handleCategory = async (row, category, items, delay) => {
  const cell = row.querySelector(`.${category}-cell`);
  if (!cell) return;

  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    const item = items[itemIndex];
    const addButton = cell.querySelector('.add-another-btn');
    if (addButton) {
      addButton.click();
      await wait(delay);
    }

    const selects = cell.querySelectorAll(`select[name="${category}"]`);
    const lastSelect = selects[selects.length - 1];
    if (!lastSelect) continue;

    if (item.type) {
      lastSelect.value = item.type;
      lastSelect.dispatchEvent(new Event('change'));
      await wait(delay);

      for (const [key, value] of Object.entries(item)) {
        if (key !== 'type') {
          await wait(delay * 2);
          const lastInput = cell.querySelector(`[name="${key}"]:last-of-type`);
          if (lastInput) {
            if (lastInput.name === 'target_location') {
              // Loop through all the options in the select element
              Array.from(lastInput.options).forEach(option => {
                // Check if the option's value is different than "0" in the value object
                option.selected = value[option.value] !== "0";
              });
              
              continue;
            }

            if (lastInput.type === 'checkbox') {
              lastInput.checked = value;
              continue;
            }

            lastInput.value = typeof value === 'object' ? JSON.stringify(value) : value;
          }

          if (key === 'example_data') {
            const exampleDataSelect = cell.querySelector(`select.example-data-select[data-source-index="${itemIndex}"]`);
            if (exampleDataSelect) {
              exampleDataSelect.value = value;
            }
          }
        }
      }
    }
  }
};
 
 /**
 * Handles the change event of a select element by creating form elements based on the selected option.
 * @param {HTMLSelectElement} select The select element that triggered the change event.
 * @param {HTMLElement} container The container element where form elements will be created.
 * @param {Object} data The data object containing configuration for the selected option.
 * @param {HTMLElement} cell The table cell element associated with the category.
 */
 const handleCategoryChange = async (select, container, data, cell) => {
  const selectedOptionData = data[select.value];
  if (selectedOptionData && selectedOptionData.form) {
    const sourceIndex = Array.from(cell.querySelectorAll('select[name="' + select.name + '"]')).indexOf(select);
    createFormElements(selectedOptionData.form, container, select.name, select.value, sourceIndex);
  }
  else {
    if (select.nextElementSibling && select.nextElementSibling.classList.contains('dynamic-form-element')) {
      select.nextElementSibling.remove();
    } 
  }
 
  const currentRow = select.closest('tr');
  const rowIndex = Array.from(currentRow.parentNode.children).indexOf(currentRow) + 1;
  saveOrUpdateProfilerData(rowIndex);
 
  const existingAddButton = cell.querySelector('.add-another-btn');
 
  if (existingAddButton) {
    existingAddButton.remove();
  }
 
  createSelectBoxForCategory(select.name, cell);
 };
 
 /**
 * Attaches change event listeners to input elements within a container.
 * @param {HTMLElement} container The container element where input elements are located.
 * @param {number} rowNum The row number associated with the profiler configuration.
 */
 const attachInputEventListeners = (container, rowNum) => {
  const inputs = container.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('change', () => saveOrUpdateProfilerData(rowNum - 1));
  });
 };
 
 /**
 * Sets the value of a select element and triggers a change event.
 * @param {HTMLSelectElement} selectElement The select element to set the value for.
 * @param {*} value The value to set on the select element.
 * @param {string} profilerKey The key associated with the profiler configuration.
 */
const setSelectValueAndTriggerChange = async (selectElement, value, profilerKey) => {
  if (!selectElement || !value) return;
 
  if (value.length > 0 && value[0].type) {
    selectElement.value = value[0].type;
    selectElement.dispatchEvent(new Event('change'));
    await new Promise(resolve => setTimeout(resolve, 100));
    populateDynamicFormElements(selectElement.closest('td'), value[0], profilerKey);
  }
 };
 
 /**
 * Creates form elements based on a given form definition.
 * @param {Object} formDefinition The definition of the form elements to create.
 * @param {HTMLElement} container The container element where form elements will be placed.
 * @param {string} category The category associated with the form elements (e.g., sources).
 * @param {string} selectedType The type of the selected option that triggered the form creation.
 * @param {number} sourceIndex The index of the source element within its category.
 */
const createFormElements = (formDefinition, container, category, selectedType, sourceIndex) => {
  const existingDynamicElements = container.querySelectorAll('.dynamic-form-element');
  existingDynamicElements.forEach(el => el.remove());
  let lastFormGroup = '';
 
  for (const [key, field] of Object.entries(formDefinition)) {
    const formGroup = document.createElement('div');
    formGroup.className = 'dynamic-form-element';
    container.appendChild(formGroup);
 
    const label = document.createElement('label');
    label.textContent = field['#title'];
    formGroup.appendChild(label);
 
    let input;
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
          for (const [optionValue, optionLabel] of Object.entries(field['#options'])) {
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = optionLabel;
            input.appendChild(option);
          }
        }
        break;
      case 'checkboxes':
        input = document.createElement('select');
        if (field['#options']) {
          for (const [optionValue, optionLabel] of Object.entries(field['#options'])) {
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = optionLabel;
            input.appendChild(option);
          }
        }
        input.multiple = true;
        break;
      case 'checkbox':
        input = document.createElement('input');
        input.type = 'checkbox';
        formGroup.className = 'form-check dynamic-form-element';
        label.className = 'form-check-label';
        label.insertBefore(input, label.firstChild);
        break;
      default:
        input = document.createElement('input');
        input.type = 'text';
    }
 
    input.className = 'form-control';
    input.name = key;
    input.placeholder = field['#description'];
    if (field['#default_value']) input.value = field['#default_value'];
    if (field['#required']) input.required = true;
 
    if (field['#type'] !== 'checkbox') {
      formGroup.appendChild(input);
    }
 
    lastFormGroup = formGroup;
 
    input.addEventListener('change', () => {
      const currentRow = input.closest('tr');
      const rowIndex = Array.from(currentRow.parentNode.children).indexOf(currentRow) + 1;
      saveOrUpdateProfilerData(rowIndex);
    });
  }
 
  if (category === 'sources') {
    const selectBox = createSelectBoxFromTableInputs("dataTable", selectedType, sourceIndex);
    lastFormGroup.appendChild(selectBox);
    selectBox.addEventListener('change', () => {
      const currentRow = selectBox.closest('tr');
      const rowIndex = Array.from(currentRow.parentNode.children).indexOf(currentRow) + 1;
      saveOrUpdateProfilerData(rowIndex);
    });
  }
 };
 
 /**
 * Creates a select box from table input elements.
 * @param {string} tableName The name of the table containing input elements.
 * @param {string} category The category associated with the form elements (e.g., sources).
 * @param {number} sourceIndex The index of the source element within its category.
 * @returns {HTMLSelectElement} The created select box.
 */
 const createSelectBoxFromTableInputs = (tableName, category, sourceIndex) => {
  const table = document.getElementById(tableName);
  const inputs = table.querySelectorAll('input[type="text"]');
 
  const select = document.createElement('select');
  select.className = 'example-data-select form-control mb-2 mt-2';
  select.name = 'example_data';
  select.setAttribute('data-source-index', sourceIndex);
  select.innerHTML = `<option value="">Choose Example Data for "${category}" source</option>`;
 
  inputs.forEach(input => {
    const name = input.name;
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    select.appendChild(option);
  });
 
  return select;
 };
 
 /**
 * Adds a new profiler form based on the provided profiler data.
 * @param {Object} profiler The profiler data to populate the new form with.
 */
 const addProfilerForm = async (profiler) => {
  const newRow = await addProfiler();
 
  newRow.querySelector('[name="label"]').value = profiler.label || '';
  newRow.querySelector('[name="machine_name"]').value = profiler.name || '';
  newRow.querySelector('[name="description"]').value = profiler.description || '';
  newRow.querySelector('[name="deferred"]').checked = !!profiler.deferred;
  newRow.querySelector('[name="status"]').checked = !!profiler.status;
 
  setSelectValueAndTriggerChange(newRow.querySelector('[name="sources"]'), profiler.sources);
  setSelectValueAndTriggerChange(newRow.querySelector('[name="processors"]'), profiler.processors);
  setSelectValueAndTriggerChange(newRow.querySelector('[name="destinations"]'), profiler.destinations);
 };
 
 /**
 * Populates dynamic form elements with data from a given profiler configuration.
 * @param {HTMLElement} container The container element where dynamic form elements are located.
 * @param {Object} formData The data to populate the form elements with.
 * @param {string} profilerKey The key associated with the profiler configuration.
 */
  const populateDynamicFormElements = (container, formData, profilerKey) => {
  Object.keys(formData).forEach(key => {
    const inputElement = container.querySelector(`[name="${key}"]`);
    if (inputElement) {
      inputElement.value = formData[key];
      if (inputElement.type === 'checkbox') {
        inputElement.checked = formData[key];
      }
    }
  });
 };
