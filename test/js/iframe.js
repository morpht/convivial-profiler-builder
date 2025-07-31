// Requesting localStorage data from parent window.
window.parent.postMessage({ action: 'getLocalStorage', key: 'convivial_profiler_builder' }, '*');
window.testBuilder = {
  onConfigReady: null,
};

// Listening for reply from parent window.
window.addEventListener('message', function (event) {
  // Early exit if no valid data received
  const value = event.data.value;
  if (!value || value === 'undefined' || value === 'null') {
    console.log('No valid config data received from parent');
    window.testBuilder.convivialProfiler = {};
    localStorage.setItem('convivial_profiler_builder', '{}');
    
    if (typeof window.testBuilder.onConfigReady === 'function') {
      window.testBuilder.onConfigReady();
    }
    return;
  }

  try {
    window.testBuilder.convivialProfiler = JSON.parse(value);
    localStorage.setItem('convivial_profiler_builder', value);
  } catch (error) {
    console.warn('Failed to parse config data:', error);
    window.testBuilder.convivialProfiler = {};
    localStorage.setItem('convivial_profiler_builder', '{}');
  }
  
  if (typeof window.testBuilder.onConfigReady === 'function') {
    window.testBuilder.onConfigReady();
  }
}, false);
