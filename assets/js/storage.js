// Storage management utilities
class StorageManager {
  constructor() {
    this.defaultSettings = {
      security: { requireSpecialChars: false, avoidAmbiguous: false, localEncryption: false },
      defaults: { defaultLength: 18, defaultLowercase: true, defaultUppercase: true, defaultNumbers: true, defaultCustom: false, defaultCustomChars: '!@#$%^&*()+-=?{}', randomLengthMin: 18, randomLengthMax: 25 },
      autoCopy: { autoCopy: false, clearClipboard: 0 },
      history: { historySize: 10, autoClearHistory: 0 },
      appearance: { theme: 'light', colorTheme: 'blue' }
    };
  }

  // Save password to history
  async saveToHistory(password) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['passwordHistory', 'settings'], async (result) => {
        if (chrome.runtime.lastError) {
          console.error('Failed to get history for saving:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }
        
        let history = result.passwordHistory || [];
        const settings = result.settings || this.defaultSettings;
        const historySize = parseInt(settings.history.historySize) || 10;
        
        // Prepare the password entry
        let passwordEntry = {
          password: password,
          timestamp: new Date().toISOString()
        };
        
        // Encrypt the password if encryption is enabled
        if (settings.security.localEncryption) {
          try {
            const encryptedPassword = await encryptPassword(password);
            if (encryptedPassword) {
              passwordEntry.password = encryptedPassword;
              passwordEntry.encrypted = true;
            }
          } catch (error) {
            console.error('Failed to encrypt password for history:', error);
          }
        }
        
        // Add new password to the beginning of history
        history.unshift(passwordEntry);
        
        // Limit history size based on settings
        if (history.length > historySize) {
          history = history.slice(0, historySize);
        }
        
        // Save updated history
        chrome.storage.local.set({ passwordHistory: history }, () => {
          if (chrome.runtime.lastError) {
            console.error('Failed to save password history:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    });
  }

  // Get password history
  async getHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['passwordHistory', 'settings'], (result) => {
        if (chrome.runtime.lastError) {
          console.error('Failed to load history:', chrome.runtime.lastError);
          resolve({ history: [], settings: this.defaultSettings });
          return;
        }
        resolve({
          history: result.passwordHistory || [],
          settings: result.settings || this.defaultSettings
        });
      });
    });
  }

  // Delete history item
  async deleteHistoryItem(index) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['passwordHistory'], (result) => {
        if (chrome.runtime.lastError) {
          console.error('Failed to get history for deletion:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }
        
        let history = result.passwordHistory || [];
        
        // Remove item at index
        history.splice(index, 1);
        
        // Save updated history
        chrome.storage.local.set({ passwordHistory: history }, () => {
          if (chrome.runtime.lastError) {
            console.error('Failed to save updated history:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            resolve(history);
          }
        });
      });
    });
  }

  // Clear all history
  async clearHistory() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ passwordHistory: [] }, () => {
        if (chrome.runtime.lastError) {
          console.error('Failed to clear history:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  // Get settings
  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['settings'], (result) => {
        if (chrome.runtime.lastError) {
          console.error('Failed to load settings:', chrome.runtime.lastError);
          resolve(this.defaultSettings);
          return;
        }
        resolve(result.settings || this.defaultSettings);
      });
    });
  }

  // Save settings
  async saveSettings(settings) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ settings: settings }, () => {
        if (chrome.runtime.lastError) {
          console.error('Failed to save settings:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
}

// Make storage manager available globally
window.StorageManager = StorageManager;