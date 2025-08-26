window.testBuilder = {
  onConfigReady: null,
  retryCount: 0,
  maxRetries: 10,
  retryDelay: 500
};

// Function to request data from parent with retry logic
function requestDataFromParent() {
  window.testBuilder.retryCount++;
  console.log(`Requesting data from parent (attempt ${window.testBuilder.retryCount}/${window.testBuilder.maxRetries})`);
  window.parent.postMessage({ action: 'getLocalStorage', key: 'convivial_profiler_builder' }, '*');
}

// Start requesting data
requestDataFromParent();

// Listening for reply from parent window.
window.addEventListener('message', function (event) {
  // Check if this is a response to our request
  if (!event.data || event.data.key !== 'convivial_profiler_builder') {
    return;
  }
  
  const value = event.data.value;
  
  // If no valid data and we haven't exceeded retries, try again
  if ((!value || value === 'undefined' || value === 'null' || value === '{}') && 
      window.testBuilder.retryCount < window.testBuilder.maxRetries) {
    setTimeout(requestDataFromParent, window.testBuilder.retryDelay);
    return;
  }
  
  // Process the received data
  if (!value || value === 'undefined' || value === 'null') {
    console.log('No valid config data received from parent after retries');
    window.testBuilder.convivialProfiler = {};
    localStorage.setItem('convivial_profiler_builder', '{}');
  } else {
    try {
      window.testBuilder.convivialProfiler = JSON.parse(value);
      localStorage.setItem('convivial_profiler_builder', value);
      console.log('Successfully received and stored config data');
    } catch (error) {
      console.warn('Failed to parse config data:', error);
      window.testBuilder.convivialProfiler = {};
      localStorage.setItem('convivial_profiler_builder', '{}');
    }
  }
  
  // Call the ready callback
  if (typeof window.testBuilder.onConfigReady === 'function') {
    window.testBuilder.onConfigReady();
  }
}, false);
