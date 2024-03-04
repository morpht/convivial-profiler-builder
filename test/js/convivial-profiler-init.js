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

function getAllLocalStorage() {
  let storageObj = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key !== 'convivial_profiler' && key !== 'profilersData') {
      storageObj[key] = localStorage.getItem(key);
    } 
  }

  return storageObj;
}

function getAllCookies() {
  return document.cookie.split(';').reduce((cookies, cookie) => {
      const [name, value] = cookie.split('=').map(c => c.trim());
      cookies[name] = decodeURIComponent(value);
      return cookies;
  }, {});
}

(function (window, ConvivialProfiler) {
  document.addEventListener('DOMContentLoaded', function () {
    refreshTree();

    document.querySelectorAll('.execute-profilers').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        executeProfilers();
      });
    });

    document.querySelectorAll('.clear-explorer-btn').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        clearAll();
        refreshTree();
      });
    });
  });

  function clearAll() {
    localStorage.clear();
    sessionStorage.clear();
  
    swal({
      title: "Cleared!",
      text: "Profiler data in the local and session storage cleared.",
      icon: "success",
      button: "OK",
    });
  }

  function executeProfilers() {
    try {
      window.convivialProfiler.collect();
      logMessage('The profilers have run successfully. You can now inspect the "Profiler Explorer".', 'success');
      refreshTree();
    }
    catch ({ name, message }) {
      logMessage(`${name} Error during the profiler execution: ${message}`, 'error');
    }
  }

  function refreshTree() {
    const allLocalStorage = getAllLocalStorage();
    const allCookies = getAllCookies();
  
    const dataToDisplay = {
        localStorage: allLocalStorage,
        cookies: allCookies
    };
    // Clear previous content
    const container = document.getElementById('jsonTreeContainer');
    container.innerHTML = '';
  
    // Initialize JSON view
    $(container).JSONView(JSON.stringify(dataToDisplay, null, 2));
    
    const jsonData = JSON.parse(localStorage.getItem('profilersData')) || {};
    const div = document.querySelector('#profilersTable .row .profiler-items');
  
    if (Object.keys(jsonData).length > 0) {
      Object.entries(jsonData.config.profilers).forEach(([name, profiler], index) => {
        const containsExampleData = profiler.sources.some(source => "example_data" in source);
  
        if (containsExampleData) {
          // Generate the profiler section HTML
          const profilerHTML = `
            <div class="profiler-section">
              <h4 class="mb-4 mt-4">${profiler.label}</h4>
              ${generateAccordion(jsonData, name, profiler.sources, 'sources-' + index)}
            </div>
          `;
  
          // Append the profiler section to the div
          div.innerHTML += profilerHTML;
        }
      });
    }
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
          return `<a href="#" class="btn btn-warning btn-sm mb-1" data-profiler="${profiler_name}" data-source-type="${item.type}" data-source-name="${sourceElement}" data-example-data="${value}">${value}</a>`;
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
    let copy = { ...source };
    delete copy.type;
    delete copy.example_data;
    const firstKey = Object.keys(copy).find(key => key !== 'type' && key !== 'example_data');
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
