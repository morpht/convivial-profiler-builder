/**
 * Default URLs for the Convivial Profiler's sources, processors, and destinations.
 */
const defaultUrls = {
  sources: 'https://raw.githubusercontent.com/morpht/convivial_profiler/refs/heads/1.0.x/convivial_profiler.profiler_source.yml',
  processors: 'https://raw.githubusercontent.com/morpht/convivial_profiler/1.0.x/convivial_profiler.profiler_processor.yml',
  destinations: 'https://raw.githubusercontent.com/morpht/convivial_profiler/1.0.x/convivial_profiler.profiler_destination.yml'
};

/**
 * Runtime URLs that might be updated with user-defined values from local storage.
 */
let urls = { ...defaultUrls };

/**
 * Updates the URLs for fetching profiler configurations based on settings from local storage.
 */
const updateFetchURLs = () => {
  const settings = JSON.parse(localStorage.getItem('convivial_profiler_builder_settings')) || {};
  urls = { ...defaultUrls, ...settings };
};

/**
 * Initializes the configuration by loading existing settings and setting up event listeners.
 */
const initConfiguration = () => {
  loadConfiguration();

  const configForm = document.getElementById('configForm');
  configForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const profilerSettings = {
      sources: document.getElementById('sourceUrl').value || defaultUrls.sources,
      processors: document.getElementById('processorUrl').value || defaultUrls.processors,
      destinations: document.getElementById('destinationUrl').value || defaultUrls.destinations
    };

    localStorage.setItem('convivial_profiler_builder_settings', JSON.stringify(profilerSettings));
    updateFetchURLs();
    swal({
      title: "Saved!",
      text: "Schema configuration saved.",
      icon: "success",
      button: "OK",
    });
  });
};

/**
 * Loads the profiler configuration from local storage into the form fields.
 */
const loadConfiguration = () => {
  const profilerSettings = JSON.parse(localStorage.getItem('convivial_profiler_builder_settings')) || {};

  document.getElementById('sourceUrl').value = profilerSettings.sources || defaultUrls.sources;
  document.getElementById('processorUrl').value = profilerSettings.processors || defaultUrls.processors;
  document.getElementById('destinationUrl').value = profilerSettings.destinations || defaultUrls.destinations;
};

/**
 * Fetches YAML data for a given category using updated URLs.
 * @param {string} category - The category to fetch ('sources', 'processors', 'destinations').
 * @returns {Promise<Object|null>} The loaded YAML data as an object, or null in case of failure.
 */
const fetchYAMLData = async (category) => {
  try {
    const response = await fetch(urls[category]);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const yamlText = await response.text();
    return jsyaml.load(yamlText);
  } catch (error) {
    console.error(`Failed to fetch YAML data for ${category}:`, error);
    return null;
  }
};

/**
 * Captures configuration data from dynamic form fields related to profiler categories.
 * @param {Element} cell - The table cell containing dynamic form elements.
 * @returns {Array<Object>} An array of configuration objects for the selected category.
 */
const captureCategoryConfig = (cell) => {
  const configs = [];

  if (cell) {
    const selects = cell.querySelectorAll('select:not(.example-data-select):not([name="target_location"])');

    selects.forEach(select => {
      const selectedType = select.value;

      if (selectedType) {
        const config = { type: selectedType };
        let nextSiblingContainer = select.nextSibling;

        while (nextSiblingContainer && !nextSiblingContainer.matches('select')) {
          const inputs = nextSiblingContainer.querySelectorAll('input, textarea, select');

          inputs.forEach(input => {
            let value = input.type === 'checkbox' ? input.checked : input.value;

            if (input.name === 'target_location') {
              value = Array.from(input.options).reduce((obj, option) => {
                obj[option.value] = option.selected ? option.value : "0";
                return obj;
              }, {});
            }

            if (input.name && value !== undefined) {
              if (isJsonString(value)) {
                value = JSON.parse(value);
              }
              config[input.name] = value;
            }
          });

          const exampleDataSelect = nextSiblingContainer.querySelector('.example-data-select');

          if (exampleDataSelect && exampleDataSelect.value !== '') {
            config['example_data'] = exampleDataSelect.value;
          }

          nextSiblingContainer = nextSiblingContainer.nextSibling;
        }

        configs.push(config);
      }
    });
  }

  return configs;
};
