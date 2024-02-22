// convivial-profiler-init.js
(function (window, ConvivialProfiler) {
  document.addEventListener('DOMContentLoaded', function () {
    const jsonData = JSON.parse(localStorage.getItem('profilersData')) || {};
    console.log(jsonData);
    const tbody = document.querySelector('#profilersTable tbody');
  
    Object.entries(jsonData.config.profilers).forEach(([name, profiler], index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <th scope="row">
              <h5>Name: ${name}</h5>
              <button type="button" class="btn btn-success execute-profiler mt-2 btn-sm disabled">Execute</button>
              <textarea id="testingProfiler" class="form-control mt-4" style="height: 600px;"></textarea>

            </th>
            <td>${generateAccordion(profiler.sources, 'sources-' + index)}</td>
            <td>${generateAccordion(profiler.processors, 'processors-' + index)}</td>
            <td>${generateAccordion(profiler.destinations, 'destinations-' + index)}</td>
        `;
    });
  });
  
  function generateAccordion(items, parentId) {
    let accordion = `<div class="accordion" id="${parentId}">`;
    items.forEach((item, idx) => {
        const collapseId = `collapse${parentId}${idx}`;
        accordion += `
            <div class="accordion-item">
                <h5 class="accordion-header" id="heading${collapseId}">${item.type}</h5>
                <div id="${collapseId}">
                    <div class="accordion-body">
                      ${Object.entries(item).filter(([key]) => key !== 'type').map(([key, value]) => 
                      `<div class="mb-3">
                          <label class="form-label">${value} (${key})</label>
                          <input type="text" class="form-control" name="${key}" value="${value}">
                      </div>`
                ).join('')}
                    </div>
                </div>
            </div>
        `;
    });
    accordion += `</div>`;
    return accordion;
  }
  
  window.testBuilder.onConfigReady = function () {
    window.convivialProfiler = new ConvivialProfiler(window.testBuilder.convivialProfiler.config, window.testBuilder.convivialProfiler.site);
    //window.convivialProfiler.collect();
  };
})(window, window.ConvivialProfiler.default);
