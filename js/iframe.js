/**
 * Listens for message events sent to the window. Supports two types of messages:
 * 1. A simple "reload" message that triggers a page reload.
 * 2. A detailed message requesting a value from local storage, identified by a key,
 *    which then posts the value back to the message source.
 */
window.addEventListener('message', function (event) {
  // Checks if the received message is a simple "reload" command
  if (event.data === "reload") {
    // Reloads the current page
    window.location.reload();
  }

  // Checks if the received message is a request for local storage data
  if (event.data.action === 'getLocalStorage') {
    // Small delay to ensure localStorage is ready after page reload
    setTimeout(() => {
      // Check if event.source still exists (iframe might have been reloaded)
      if (!event.source || typeof event.source.postMessage !== 'function') {
        console.log('Message source no longer available (iframe may have been reloaded)');
        return;
      }
      
      // Retrieves the requested item from local storage using the provided key
      const storageValue = localStorage.getItem(event.data.key);

      try {
        // Posts the retrieved item back to the source of the message
        event.source.postMessage({
          key: event.data.key,
          value: storageValue
        }, "*"); // The "*" target origin means no preference (not recommended for production use due to security implications)
      } catch (error) {
        console.log('Failed to post message back to iframe:', error.message);
      }
    }, 100);
  }
}, false);
