let windowConfigs = null;
let configLoadedCallbacks = [];

// Load configurations
fetch('config/windowConfig.json')
    .then(response => response.json())
    .then(data => {
        windowConfigs = data;
        // Notify all waiting callbacks
        configLoadedCallbacks.forEach(callback => callback(windowConfigs));
        configLoadedCallbacks = []; // Clear the callbacks
    })
    .catch(error => console.error('Error loading window configurations:', error));

export function getWindowConfigs() {
    return new Promise((resolve) => {
        if (windowConfigs) {
            resolve(windowConfigs);
        } else {
            configLoadedCallbacks.push(resolve);
        }
    });
}