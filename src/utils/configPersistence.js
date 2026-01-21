/**
 * Configuration Persistence Utilities
 * Handles localStorage, URL encoding, and JSON export/import
 */

const STORAGE_KEY = 'golfSimulatorConfig';
const STORAGE_VERSION = '1.0';

/**
 * Save configuration to localStorage
 */
export function saveToLocalStorage(config) {
  try {
    const data = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      config
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

/**
 * Load configuration from localStorage
 */
export function loadFromLocalStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);
    return data.config;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * Clear localStorage
 */
export function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return false;
  }
}

/**
 * Encode configuration to URL-safe base64 string
 */
export function encodeConfigToURL(config) {
  try {
    const json = JSON.stringify(config);
    const base64 = btoa(json);
    // Make URL-safe
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (error) {
    console.error('Failed to encode config to URL:', error);
    return null;
  }
}

/**
 * Decode configuration from URL parameter
 */
export function decodeConfigFromURL(encoded) {
  try {
    // Restore base64 padding and characters
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const json = atob(base64);
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to decode config from URL:', error);
    return null;
  }
}

/**
 * Get configuration from URL parameters
 */
export function getConfigFromURL() {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('config');

    if (!encoded) return null;

    return decodeConfigFromURL(encoded);
  } catch (error) {
    console.error('Failed to get config from URL:', error);
    return null;
  }
}

/**
 * Generate shareable URL with configuration
 */
export function generateShareURL(config) {
  try {
    const encoded = encodeConfigToURL(config);
    if (!encoded) return null;

    const baseURL = window.location.origin + window.location.pathname;
    return `${baseURL}?config=${encoded}`;
  } catch (error) {
    console.error('Failed to generate share URL:', error);
    return null;
  }
}

/**
 * Export configuration as JSON file
 */
export function exportConfigToJSON(config, filename = 'golf-simulator-config.json') {
  try {
    const data = {
      version: STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
      config
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Failed to export config to JSON:', error);
    return false;
  }
}

/**
 * Import configuration from JSON file
 */
export function importConfigFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data.config || data); // Support both wrapped and unwrapped formats
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
