// convivial-profiler-init.js

function copyToClipboard() {
  const textarea = document.getElementById('testingProfiler');
  textarea.select();
  document.execCommand('copy');

  swal({
    title: "Copied!",
    text: "Log copied to clipboard.",
    icon: "success",
    button: "OK",
  });
}

function logMessage(message, type) {
  const textarea = document.getElementById('testingProfiler');
  if (!textarea) return;

  const emojis = {
    'info': 'ℹ️',
    'success': '✅',
    'warning': '⚠️',
    'error': '❌'
  };

  const emoji = emojis[type] || emojis['info'];
  const formattedMessage = `${emoji} [${type.toUpperCase()}] - ${message}\n`;

  textarea.value += formattedMessage;
  textarea.scrollTop = textarea.scrollHeight;
}

function extractProfiler(jsonData, profilerId) {
  const profiler = jsonData.config.profilers[profilerId];
  jsonData.config.profilers = { [profilerId]: profiler };

  return jsonData;
}

(function (window, ConvivialProfiler) {
  document.addEventListener('DOMContentLoaded', function () {
    const jsonTreeModal = new bootstrap.Modal(document.getElementById('jsonTreeModal'));
    const jsonData = JSON.parse(localStorage.getItem('profilersData')) || {};
    const tbody = document.querySelector('#profilersTable tbody');

    if (Object.keys(jsonData).length > 0) {
      Object.entries(jsonData.config.profilers).forEach(([name, profiler], index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
          <td>
            <h4 class="mb-4 mt-4">${profiler.label}</h4>
            ${generateAccordion(jsonData, name, profiler.sources, 'sources-' + index)}
          </td>
          <td class="w-75 code-container">
            <div id="profilersTree"></div>
            <textarea id="testingProfiler" class="code-editor form-control" style="height: 600px;"></textarea>
            <button onclick="copyToClipboard()" class="btn btn-secondary copy">Copy</button>
          </td>
      `;
      });
    }

    // Event listener for clicks on links
    document.getElementById('explorer').addEventListener('click', function () {
      const jsonData = window.convivialProfiler || {}; // Adjust based on actual data structure
      // Clear previous content
      const container = document.getElementById('jsonTreeContainer');
      container.innerHTML = '';

      // Initialize JSON view
      $(container).JSONView(JSON.stringify(jsonData, null, 2), { collapsed: true });

      // Show the modal
      jsonTreeModal.show();
    });

    // Attach click event listener to all buttons with class 'execute-profilers'
    document.querySelectorAll('.execute-profilers').forEach(function (button) {
      button.addEventListener('click', function (event) {
        // Prevent the default action if needed
        event.preventDefault();
        executeProfilers();
      });
    });
  });

  function executeProfilers() {
    window.convivialProfiler.collect();

    const jsonData = JSON.parse(localStorage.getItem('convivial_profiler')) || {};
    const prettyJsonString = JSON.stringify(jsonData, null, 2); // 2 spaces for indentation
    logMessage(prettyJsonString, 'info');
  }

  // Generate the accordion HTML.
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
                ➡️ ${item.type}
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

  // Extract the first property value from the source object.
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

  // Placeholder for your custom logic
  function handleLinkClick(profilerName, itemType, sourceElement, value) {
    logMessage(`Clicked link data: profilerName=${profilerName}, itemType=${itemType}, sourceElement=${sourceElement}, value=${value}`, 'info');
    switch (itemType) {
      case 'cookie':
        createCookie(sourceElement, value);
        break;
      case 'meta':
        createMeta(sourceElement, value);
        break;
      case 'query':
        setQueryParameter(sourceElement, value);
        break;
      case 'time':
        //(sourceElement, value);
        break;
      default:
        break;
    }

    // Call the collect method to send the updated data to the parent window.
  }

  function createCookie(name, value) {
    try {
      document.cookie = name + "=" + value + "; expires=Fri, 31 Dec 9999 23:59:59 GMT";
      logMessage(`Cookie with name: ${name} has been created with value ${value}`, 'success');
    } catch ({ name, message }) {
      logMessage(`${name} Error during cookie creation: ${message}`, 'error');
    }
  }

  function createMeta(name, value) {
    try {
      var meta = document.createElement('meta');
      meta.name = name;
      meta.content = value;
      document.getElementsByTagName('head')[0].appendChild(meta);
      logMessage(`Metatag with name: ${name} was created with content ${value}`, 'success');
    } catch ({ name, message }) {
      logMessage(`${name} Error during meta tag creation: ${message}`, 'error');
    }
  }

  function setQueryParameter(name, value) {
    try {
      // Check if the current window is running inside an iframe
      if (window.self !== window.top) {
        // It's inside an iframe
        var iframe = window.self; // Reference to the current iframe window
        var currentUrl = new URL(iframe.location.href);
        var params = currentUrl.searchParams;

        // Check if the query parameter exists
        if (!params.has(name)) {

          params.set(name, value); // Set the query parameter if it doesn't exist
          var newUrl = currentUrl.toString();
          logMessage(`Query parameter ${name} added, reloading page to ${newUrl}`, 'info');
          iframe.location.href = newUrl; // Reload the iframe with the updated URL
          location.reload(); // Reload the parent window
        }
        else {
          logMessage(`The query parameter: ${name} already exists.`, 'warning');
        }
      } else {
        // Not inside an iframe, or you may want to handle this case differently
        logMessage('Not running inside an iframe. No action taken.', 'warning');
      }
    } catch ({ name, message }) {
      logMessage(`${name} Error creating a query parameter: ${message}`, 'error');
    }
  }

  // Event listener for clicks on links
  document.querySelector('#profilersTable').addEventListener('click', function (event) {
    if (event.target.matches('.btn-sm')) { // Check if the clicked element has the class 'btn-sm'
      event.preventDefault(); // Prevent default link behavior

      // Extract data attributes
      const profilerName = event.target.getAttribute('data-profiler');
      const itemType = event.target.getAttribute('data-source-type');
      const sourceElement = event.target.getAttribute('data-source-name');
      const value = event.target.getAttribute('data-example-data');

      // Call your custom function with the extracted values
      handleLinkClick(profilerName, itemType, sourceElement, value);
    }
  });

  window.testBuilder.onConfigReady = function () {
    let config = window.testBuilder.convivialProfiler;

    if (Object.keys(config).length > 0) {
      window.convivialProfiler = new ConvivialProfiler(config.config, config.site, config.license_key);
    }
  };
})(window, window.ConvivialProfiler.default);
