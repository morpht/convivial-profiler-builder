// convivial-profiler-init.js
(function (window, ConvivialProfiler) {
  document.addEventListener('DOMContentLoaded', function () {
    const jsonData = JSON.parse(localStorage.getItem('profilersData')) || {};
    const tbody = document.querySelector('#profilersTable tbody');

    Object.entries(jsonData.config.profilers).forEach(([name, profiler], index) => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>
          <h4 class="mb-4 mt-4">Profiler: ${name}</h4>
          <h5 class="mb-4">Test data:</h5>
          ${generateAccordion(jsonData, name, profiler.sources, 'sources-' + index)}
        </td>
        <td class="w-75">
          <textarea id="testingProfiler" class="form-control mt-4" style="height: 600px;"></textarea>
        </td>
    `;
    });
  });

  function generateAccordion(jsonData, profiler_name, items, parentId) {
    let accordion = `<div class="accordion" id="${parentId}">`;

    items.forEach((item, idx) => {
      const data = jsonData.config.data || {}; // Ensure data is an object
      const collapseId = `collapse${parentId}${idx}`;
      let links = '';

      // Extract the first property value as source element if example_data is not present
      const sourceElement = extractSourceElement(item);

      // Check for example_data and generate links if applicable
      if (item.example_data && Array.isArray(data[item.example_data])) {
        // Generate links for each value in the example_data array
        links = data[item.example_data].map(value => {
          return `<a href="#" class="btn btn-warning btn-sm" data-profiler="${profiler_name}" data-source-type="${item.type}" data-source-name="${sourceElement}" data-example-data="${value}">${value}</a>`;
        }).join(' '); // Join links with a line break
      
      // Build the accordion item HTML
        accordion += `
          <div class="accordion-item">
              <h5 class="accordion-header mb-3" id="heading${collapseId}">
                ➡️ ${sourceElement} (${item.type})
              </h5>
              <div id="${collapseId}" class="accordion-body mb-3">
                ${links}
              </div>
          </div>
        `;
      }
    });

    accordion += `</div>`;
    return accordion;
  }

  function extractSourceElement(source) {
    // Create a copy of the source object without modifying the original
    let copy = { ...source };
    delete copy.type;
    delete copy.example_data;
    // Extract the key of the first property that is not 'type' or 'example_data'
    const firstKey = Object.keys(copy).find(key => key !== 'type' && key !== 'example_data');
    // Return the first property's value or an empty string if not found
    return copy[firstKey] || '';
  }

  window.testBuilder.onConfigReady = function () {
    window.convivialProfiler = new ConvivialProfiler(window.testBuilder.convivialProfiler.config, window.testBuilder.convivialProfiler.site);
    //window.convivialProfiler.collect();
  };
})(window, window.ConvivialProfiler.default);
