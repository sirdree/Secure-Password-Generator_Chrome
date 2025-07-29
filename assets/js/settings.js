// Shared default settings configuration
const DEFAULT_SETTINGS = {
  security: {
    requireSpecialChars: false,
    avoidAmbiguous: false,
    localEncryption: true
  },
  defaults: {
    defaultLength: 18,
    defaultLowercase: true,
    defaultUppercase: true,
    defaultNumbers: true
  },
  autoCopy: {
    autoCopy: false,
    clearClipboard: 0
  },
  history: {
    historySize: 10,
    autoClearHistory: 0
  },
  appearance: {
    theme: 'dark',
    colorTheme: 'purple'
  }
};

// Make settings available globally (compatible with both popup and service worker)
if (typeof window !== 'undefined') {
  window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
} else if (typeof globalThis !== 'undefined') {
  globalThis.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
}