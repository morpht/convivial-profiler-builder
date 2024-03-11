// Requesting localStorage data from parent window.
window.parent.postMessage({ action: 'getLocalStorage', key: 'convivial_profiler_builder' }, '*');
window.testBuilder = {
  onConfigReady: null,
};

// Listening for reply from parent window.
window.addEventListener('message', function (event) {
  window.testBuilder.convivialProfiler = JSON.parse(event.data.value || '{}');
  localStorage.setItem('convivial_profiler_builder', event.data.value);
  if (typeof window.testBuilder.onConfigReady === 'function') {
    window.testBuilder.onConfigReady();
  }
}, false);
