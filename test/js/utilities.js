/**
 * Copies the content of a textarea with the ID 'testingProfiler' to the clipboard
 * and displays a success message using SweetAlert.
 */
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

/**
 * Clears all data from localStorage and sessionStorage and displays a success message.
 */
function clearAll() {
  localStorage.clear();
  sessionStorage.clear();
  deleteAllCookies();
  parent.postMessage("reload", "*");
}

/**
 * Logs a message with a specified type ('info', 'success', 'warning', 'error') into
 * a textarea. Each message type is represented with an emoji.
 * @param {string} message - The message to log.
 * @param {string} type - The type of the message (info, success, warning, error).
 */
function logMessage(message, type) {
  const textarea = document.getElementById('testingProfiler');
  if (!textarea) return;

  const emojis = { 'info': 'ℹ️', 'success': '✅', 'warning': '⚠️', 'error': '❌' };
  const emoji = emojis[type] || emojis['info'];
  const formattedMessage = `${emoji} [${type.toUpperCase()}] - ${message}\n`;

  textarea.value += formattedMessage;
  textarea.scrollTop = textarea.scrollHeight;
}

/**
 * Retrieves all key-value pairs from localStorage, excluding those related to
 * 'convivial_profiler' and 'convivial_profiler_builder'.
 * @returns An object containing all the key-value pairs from localStorage.
 */
function getAllLocalStorage() {
  let storageObj = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key !== 'convivial_profiler' && key !== 'convivial_profiler_builder') {
      storageObj[key] = localStorage.getItem(key);
    } 
  }

  return storageObj;
}

/**
 * Retrieves all cookies from the document and parses them into an object.
 * @returns An object containing all cookies as key-value pairs.
 */
function getAllCookies() {
  return document.cookie.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.split('=').map(c => c.trim());
    if (name != 'ConvivialProfilerClientId') {
      cookies[name] = decodeURIComponent(value);
    }
    return cookies;
  }, {});
}

/**
 * Deletes all cookies from the document by setting their expiry date to the past.
 */
function deleteAllCookies() {
  var cookies = document.cookie.split(';');

  for (var i = 0; i < cookies.length; i++) {
    if (cookies[i].includes('ConvivialProfilerClientId')) {
      continue;
    }
    document.cookie = cookies[i] + "=;expires=" + new Date(0).toUTCString();
  }
}

/**
 * Creates a cookie with a specified name and value and sets its expiry date far in the future.
 * Logs a success message upon creation or an error message if an exception occurs.
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value of the cookie.
 */
function createCookie(name, value) {
  try {
    document.cookie = `${name}=${value};path=/;expires=Fri, 31 Dec 9999 23:59:59 GMT`;
    logMessage(`Cookie with name: ${name} has been created with value ${value}`, 'success');
  } catch (error) {
    logMessage(`Error during cookie creation: ${error.message}`, 'error');
  }
}

/**
 * Creates a meta tag with the specified name and content and appends it to the document's head.
 * Logs a success message upon creation or an error message if an exception occurs.
 * @param {string} name - The name attribute of the meta tag.
 * @param {string} value - The content attribute of the meta tag.
 */
function createMeta(name, value) {
  try {
    const meta = document.createElement('meta');
    meta.name = name;
    meta.content = value;
    document.getElementsByTagName('head')[0].appendChild(meta);
    logMessage(`Metatag with name: ${name} was created with content ${value}`, 'success');
  } catch (error) {
    logMessage(`Error during meta tag creation: ${error.message}`, 'error');
  }
}

/**
 * Extracts the first property value from a source object, excluding 'type' and 'example_data'.
 * This function is used to extract significant information from profiler source objects.
 * @param {Object} source - The source object from which to extract the property.
 * @returns {string} The value of the first property found or an empty string if none found.
 */
function extractSourceElement(source) {
  const copy = { ...source };
  delete copy.type;
  delete copy.example_data;
  const firstKey = Object.keys(copy).find(key => key !== 'type' && key !== 'example_data');
  return copy[firstKey] || '';
}
