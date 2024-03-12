/**
* Delays execution for a given number of milliseconds.
* @param {number} ms - Milliseconds to wait before resolving the promise.
* @returns {Promise} - A promise that resolves after the specified delay.
*/
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
* Generates a machine-readable name from a human-readable label.
* Converts spaces to underscores and makes all characters lowercase.
* @param {string} label - The label to convert into a machine name.
* @returns {string} - The generated machine name.
*/
const generateMachineName = (label) => label.toLowerCase().replace(/\s+/g, '_');

/**
* Loads and displays markdown documentation from a remote URL.
* Uses the 'marked' library to parse markdown into HTML.
*/
const loadDocumentation = () => {
 fetch('https://raw.githubusercontent.com/morpht/convivial-profiler/main/README.md')
   .then(response => {
     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
     return response.text();
   })
   .then(markdown => {
     const htmlContent = marked.parse(markdown);
     document.getElementById('documentation-content').innerHTML = htmlContent;
   })
   .catch(error => console.error('Error fetching README:', error));
};

/**
 * Checks if a given string is a valid JSON object.
 * @param {string} content
 * @returns {boolean}
 */
function isJsonString(content) {
  try {
    const parsed = JSON.parse(content);
    return typeof parsed !== 'string';
  } catch (error) {
    return false;
  }
}
