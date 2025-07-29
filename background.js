// This background script ensures the extension functions properly
// It runs in the background and handles various Chrome extension events

// Default settings (duplicated from settings.js for service worker compatibility)
const defaultSettings = {
  security: {
    requireSpecialChars: false,
    avoidAmbiguous: false,
    localEncryption: false
  },
  defaults: {
    defaultLength: 18,
    defaultLowercase: true,
    defaultUppercase: true,
    defaultNumbers: true,
    defaultCustom: false,
    defaultCustomChars: '!@#$%^&*()+-=?{}',
    randomLengthMin: 18,
    randomLengthMax: 25
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
    theme: 'light',
    colorTheme: 'blue'
  }
};

// Listen for installation
chrome.runtime.onInstalled.addListener(function() {
  console.log('Password Generator Extension installed');
  
  // Initialize storage with empty password history and default settings
  chrome.storage.local.get(['settings'], function(result) {
    if (!result.settings) {
      chrome.storage.local.set({
        passwordHistory: [],
        settings: defaultSettings
      }, function() {
        console.log('Password history and default settings initialized');
      });
    }
  });
  
  // Auto-clear history check (runs daily)
  setInterval(checkHistoryExpiration, 86400000); // 24 hours
});

// Check for expired history entries
function checkHistoryExpiration() {
  chrome.storage.local.get(['passwordHistory', 'settings'], function(result) {
    const history = result.passwordHistory || [];
    const settings = result.settings || defaultSettings;
    const autoClearDays = parseInt(settings.history.autoClearHistory);
    
    if (autoClearDays > 0 && history.length > 0) {
      const now = new Date();
      const filteredHistory = history.filter(item => {
        const itemDate = new Date(item.timestamp);
        const diffTime = Math.abs(now - itemDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= autoClearDays;
      });
      
      if (filteredHistory.length < history.length) {
        chrome.storage.local.set({ passwordHistory: filteredHistory });
        console.log('Old history entries cleared');
      }
    }
  });
}