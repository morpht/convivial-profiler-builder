// Requesting localStorage data from parent
window.parent.postMessage({action: 'getLocalStorage', key: 'profilersData'}, '*');

// Listening for reply from parent
window.addEventListener('message', function(event) {
  console.log('Data from parent localStorage:', event.data);
}, false);

window.testBuilder = {};
window.testBuilder.convivialProfiler = {
  "site": "convivial-profile-builder",
  "license_key": "community",
  "client_cleanup": true,
  "event_tracking": true,
  "config": {
    "profilers": JSON.parse(localStorage.getItem('profilersData') || '{}')
  }
};
