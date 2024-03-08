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
    // Retrieves the requested item from local storage using the provided key
    const storageValue = localStorage.getItem(event.data.key);

    // Posts the retrieved item back to the source of the message
    event.source.postMessage({
      key: event.data.key,
      value: storageValue
    }, "*"); // The "*" target origin means no preference (not recommended for production use due to security implications)
  }
}, false);
