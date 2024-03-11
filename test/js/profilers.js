(function (window, ConvivialProfiler) {
  document.addEventListener('DOMContentLoaded', () => {
    refreshTree();
    attachEventListeners();
  });
 
  /**
   * Attaches event listeners for executing profilers, clearing data, and handling link clicks.
   */
  const attachEventListeners = () => {
    // Attaches click event listeners to execute profiler buttons and prevent default action.
    document.querySelectorAll('.execute-profilers').forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        executeProfilers();
      });
    });
 
    // Attaches click event listeners to clear explorer buttons, prevent default action, and refresh the tree.
    document.querySelectorAll('.clear-explorer-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        clearAll();
        refreshTree();
      });
    });
 
    // Attaches click event listener to the profiler table for handling specific link clicks.
    document.querySelector('#profilersTable').addEventListener('click', handleProfilerItemLinkClick);
  };
 
  /**
   * Handles click events on profiler item links and triggers appropriate actions based on link data attributes.
   * @param {Event} event - The click event object.
   */
  const handleProfilerItemLinkClick = (event) => {
    if (event.target.matches('.btn-sm')) {
      event.preventDefault();
 
      const profilerName = event.target.getAttribute('data-profiler');
      const itemType = event.target.getAttribute('data-source-type');
      const sourceElement = event.target.getAttribute('data-source-name');
      const value = event.target.getAttribute('data-example-data');
 
      handleLinkClick(profilerName, itemType, sourceElement, value);
      refreshTree();
    }
  };
 
  /**
   * Reloads the page with a specified query parameter if running inside an iframe.
   * @param {string} name - The name of the query parameter.
   * @param {string} value - The value of the query parameter.
   */
  const setQueryParameter = (name, value) => {
    try {
      if (window.self !== window.top) {
        const iframe = window.self;
        const currentUrl = new URL(iframe.location.href);
        const params = currentUrl.searchParams;
 
        if (!params.has(name)) {
          params.set(name, value);
          const newUrl = currentUrl.toString();
          logMessage(`Query parameter ${name} added, reloading page to ${newUrl}`, 'info');
          iframe.location.href = newUrl;
          parent.postMessage("reload", "*");
        } else {
          logMessage(`The query parameter: ${name} already exists.`, 'warning');
        }
      } else {
        logMessage('Not running inside an iframe. No action taken.', 'warning');
      }
    } catch ({ name, message }) {
      logMessage(`${name} Error creating a query parameter: ${message}`, 'error');
    }
  };
 
  /**
   * Executes profilers and logs a success message.
   */
  const executeProfilers = () => {
    try {
      window.convivialProfiler.collect();
      logMessage('The profilers have run successfully. You can now inspect the "Profiler Explorer".', 'success');
      deleteAllCookies();
      refreshTree();
    } catch ({ name, message }) {
      logMessage(`${name} Error during the profiler execution: ${message}`, 'error');
    }
  };
 
  /**
   * Refreshes the tree view displaying localStorage and cookies.
   */
  const refreshTree = () => {
    // Get all localStorage and cookies and display them in the tree view.
    const allLocalStorage = getAllLocalStorage();
    const containerStorage = document.getElementById('jsonTreeContainerStorage');
    containerStorage.innerHTML = '';
    $(containerStorage).JSONView(JSON.stringify(allLocalStorage, null, 2));
    const storageHeading = document.createElement("h4");
    storageHeading.innerHTML = 'Local Storage';
    containerStorage.prepend(storageHeading);

    const allCookies = getAllCookies();
    const containerCookies = document.getElementById('jsonTreeContainerCookies');
    containerCookies.innerHTML = '';
    $(containerCookies).JSONView(JSON.stringify(allCookies, null, 2));
    const cookiesHeading = document.createElement("h4");
    cookiesHeading.innerHTML = 'Cookies';
    containerCookies.prepend(cookiesHeading);

    const jsonData = JSON.parse(localStorage.getItem('convivial_profiler_builder')) || {};
    const div = document.querySelector('#profilersTable .row .profiler-items');
 
    if (Object.keys(jsonData).length > 0) {
      Object.entries(jsonData.config.profilers).forEach(([name, profiler], index) => {
        const containsExampleData = profiler.sources.some(source => "example_data" in source);
 
        if (containsExampleData) {
          const profilerHTML = `
            <div class="profiler-section">
              <h4 class="mb-4 mt-4">${profiler.label}</h4>
              ${generateAccordion(jsonData, name, profiler.sources, 'sources-' + index)}
            </div>
          `;
 
          div.innerHTML += profilerHTML;
        }
      });
    }
  };
 
  /**
   * Generates the accordion HTML for profiler data.
   * @param {object} jsonData - JSON data of profilers.
   * @param {string} profiler_name - Name of the profiler.
   * @param {Array} items - Items to be included in the accordion.
   * @param {string} parentId - ID of the parent element for the accordion.
   * @returns {string} The HTML string for the accordion.
   */
  const generateAccordion = (jsonData, profiler_name, items, parentId) => {
    let accordion = `<div class="accordion" id="${parentId}">`;
 
    items.forEach((item, idx) => {
      const data = jsonData.config.data || {};
      const collapseId = `collapse${parentId}${idx}`;
      let links = '';
 
      const sourceElement = extractSourceElement(item);
 
      if (item.example_data && Array.isArray(data[item.example_data])) {
        links = data[item.example_data].map(value => {
          return `<a href="#" class="btn btn-warning btn-sm mb-1" 
          data-bs-toggle="button" autocomplete="off" data-profiler="${profiler_name}" 
          data-source-type="${item.type}" data-source-name="${sourceElement}" 
          data-example-data="${value}">${value}</a>`;
        }).join(' ');
 
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
  };
 
  /**
   * Handles click events on profiler links, extracting and using data attributes.
   * @param {Event} event - The click event object.
   */
  const handleLinkClick = (profilerName, itemType, sourceElement, value) => {
    logMessage(`Clicked link data: profilerName=${profilerName}, itemType=${itemType}, 
    sourceElement=${sourceElement}, value=${value}`, 'info');
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
      default:
        break;
    }
  };
 
  // Requesting localStorage data from parent window to initialize the profiler.
  window.testBuilder.onConfigReady = () => {
    const config = window.testBuilder.convivialProfiler;
 
    if (Object.keys(config).length > 0) {
      window.convivialProfiler = new ConvivialProfiler(config.config, config.site, config.license_key);
    }
  };
 })(window, window.ConvivialProfiler.default);
