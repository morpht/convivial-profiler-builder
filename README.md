# Convivial Profiler Builder

[![Continous Integration](https://github.com/morpht/convivial-profiler-builder/actions/workflows/main.yml/badge.svg)](https://github.com/morpht/convivial-profiler-builder/actions?query=branch%3Amain)

The Profiler Builder is a web application designed for creating, managing, and exporting profiler configurations. It allows users to dynamically build profiler setups by specifying sources, processors, and destinations, and then export these configurations as JSON. Additionally, it provides functionality to import profiler configurations and visualize them in a tree structure for easy inspection.

## Features

- **Dynamic Profiler Creation**: Users can add profiler rows to define new profiler configurations with sources, processors, and destinations.
- **YAML Configuration Fetching**: The application fetches YAML configuration data for sources, processors, and destinations from predefined URLs, allowing for real-time updates and configuration.
- **Local Storage Integration**: Profiler configurations are stored in the browser's local storage, ensuring that data persists across sessions.
- **JSON Export and Import**: Profiler configurations can be exported to a JSON file for use in other applications or imported to restore a previous configuration.
- **Interactive Tree Visualization**: Using the jsTree library, the application provides a hierarchical visualization of profiler configurations stored in local storage, offering an intuitive overview of sources, processors, and destinations.

## Structure

- **HTML**: The main interface is built with HTML, structured into sections for UI Builder, Export, Import, Inspector, Documentation, and Configuration.
- **CSS**: Bootstrap is used for styling, ensuring a responsive and modern interface.
- **JavaScript**: The core functionality is implemented in JavaScript, handling dynamic UI updates, local storage management, YAML data fetching, and tree visualization.

## Setup and Usage

1. **Initial Setup**: Include Bootstrap, jsTree, and YAML parsing libraries in your HTML file.
2. **Configuration**: Use the Configuration tab to set URLs for fetching sources, processors, and destinations YAML data.
3. **Creating Profilers**: In the UI Builder tab, click "Add Profiler" to start defining a new profiler. Specify sources, processors, and destinations as required.
4. **Exporting and Importing**: Use the Export tab to download your profiler configurations as JSON, or the Import tab to load an existing configuration.
5. **Visualization**: The Inspector tab displays a tree view of your profiler configurations, providing a clear overview of their structure.

## Important Notes

- The application uses local storage to persist profiler configurations. Ensure your browser supports local storage.
- When importing configurations, ensure the JSON format matches the application's expected structure to avoid errors.
- The YAML URLs in the Configuration tab must point to valid YAML files for sources, processors, and destinations data.
