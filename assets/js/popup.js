// Default settings configuration (inline to avoid service worker issues)
const DEFAULT_SETTINGS = {
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

// Make sure all code runs only after DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize modules
  const generator = new window.PasswordGenerator();
  const storage = new window.StorageManager();
  const defaultSettings = DEFAULT_SETTINGS;
  
  // Cache DOM Elements for better performance
  const elements = {
    // Tab elements
    tabButtons: document.querySelectorAll('.tab-button'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    
    // Password Generator Elements
    lowercaseCheckbox: document.getElementById('lowercase'),
    uppercaseCheckbox: document.getElementById('uppercase'),
    numbersCheckbox: document.getElementById('numbers'),
    customCheckbox: document.getElementById('custom'),
    customCharsContainer: document.getElementById('customCharsContainer'),
    customCharsInput: document.getElementById('customChars'),
    lengthInput: document.getElementById('length'),
    randomLengthCheckbox: document.getElementById('randomLength'),
    generateBtn: document.getElementById('generateBtn'),
    passwordOutput: document.getElementById('passwordOutput'),
    copyBtn: document.getElementById('copyBtn'),
    historyList: document.getElementById('historyList'),
    
    // Strength indicator elements
    passwordStrength: document.getElementById('passwordStrength'),
    strengthFill: document.getElementById('strengthFill'),
    strengthText: document.getElementById('strengthText'),
    
    // Settings Elements
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn')
  };
  
  // Tab switching functionality
  elements.tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Get the tab id from data-tab attribute
      const tabId = this.getAttribute('data-tab');
      
      // Update active tab button
      elements.tabButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Update active tab pane
      elements.tabPanes.forEach(pane => pane.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
      
      // If switching to history tab, update history display
      if (tabId === 'history') {
        updateHistoryDisplay();
      }
    });
  });
  
  // Show/hide custom chars input based on checkbox
  elements.customCheckbox.addEventListener('change', function() {
    console.log('🔄 Custom checkbox changed:', {
      checked: this.checked,
      willShow: this.checked ? 'block' : 'none',
      trigger: 'user interaction or programmatic'
    });
    elements.customCharsContainer.style.display = this.checked ? 'block' : 'none';
  });
  
  // Handle random length checkbox
  elements.randomLengthCheckbox.addEventListener('change', async function() {
    if (this.checked) {
      // Get current settings for random length range
      const settings = await storage.getSettings();
      const min = settings.defaults.randomLengthMin || 18;
      const max = settings.defaults.randomLengthMax || 25;
      const randomLen = Math.floor(Math.random() * (max - min + 1)) + min;
      elements.lengthInput.value = randomLen;
      elements.lengthInput.disabled = true;
    } else {
      elements.lengthInput.disabled = false;
    }
  });

  // Add input validation for length
  elements.lengthInput.addEventListener('input', window.Utils.debounce(function() {
    const value = parseInt(this.value, 10);
    if (isNaN(value) || value < 12 || value > 36) {
      this.style.borderColor = '#ff4444';
      this.title = 'Length must be between 12 and 36 characters';
    } else {
      this.style.borderColor = '';
      this.title = '';
    }
  }, 300));

  // Sanitize custom character input
  elements.customCharsInput.addEventListener('input', function() {
    this.value = window.Utils.sanitizeInput(this.value);
  });

  // Add validation for random length min/max fields (with null checks)
  const randomLengthMinElement = document.getElementById('randomLengthMin');
  const randomLengthMaxElement = document.getElementById('randomLengthMax');
  
  if (randomLengthMinElement) {
    randomLengthMinElement.addEventListener('input', window.Utils.debounce(function() {
      const min = parseInt(this.value, 10);
      const maxElement = document.getElementById('randomLengthMax');
      const max = maxElement ? parseInt(maxElement.value, 10) : NaN;
      
      if (isNaN(min) || min < 12 || min > 36) {
        this.style.borderColor = '#ff4444';
        this.title = 'Min length must be between 12 and 36';
      } else if (!isNaN(max) && min > max) {
        this.style.borderColor = '#ff4444';
        this.title = 'Min length cannot be greater than max length';
      } else {
        this.style.borderColor = '';
        this.title = '';
      }
    }, 300));
  }

  if (randomLengthMaxElement) {
    randomLengthMaxElement.addEventListener('input', window.Utils.debounce(function() {
      const max = parseInt(this.value, 10);
      const minElement = document.getElementById('randomLengthMin');
      const min = minElement ? parseInt(minElement.value, 10) : NaN;
      
      if (isNaN(max) || max < 12 || max > 36) {
        this.style.borderColor = '#ff4444';
        this.title = 'Max length must be between 12 and 36';
      } else if (!isNaN(min) && max < min) {
        this.style.borderColor = '#ff4444';
        this.title = 'Max length cannot be less than min length';
      } else {
        this.style.borderColor = '';
        this.title = '';
      }
    }, 300));
  }

  // Handle default custom characters checkbox (with null check)
  const defaultCustomElement = document.getElementById('defaultCustom');
  if (defaultCustomElement) {
    defaultCustomElement.addEventListener('change', function() {
      const container = document.getElementById('defaultCustomCharsContainer');
      if (container) {
        container.style.display = this.checked ? 'block' : 'none';
      }
    });
  }

  // Sanitize default custom characters input (with null check)
  const defaultCustomCharsElement = document.getElementById('defaultCustomChars');
  if (defaultCustomCharsElement) {
    defaultCustomCharsElement.addEventListener('input', function() {
      this.value = window.Utils.sanitizeInput(this.value);
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + G to generate password
    if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
      e.preventDefault();
      elements.generateBtn.click();
    }
    
    // Ctrl/Cmd + C to copy password (when password output is focused)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement === elements.passwordOutput) {
      e.preventDefault();
      elements.copyBtn.click();
    }
    
    // Escape to clear password
    if (e.key === 'Escape') {
      elements.passwordOutput.value = '';
      elements.passwordStrength.style.display = 'none';
    }
    
    // Tab navigation between tabs (1-4)
    if (e.key >= '1' && e.key <= '4' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const tabIndex = parseInt(e.key) - 1;
      if (elements.tabButtons[tabIndex]) {
        elements.tabButtons[tabIndex].click();
      }
    }
  });
  
  // Generate password
  elements.generateBtn.addEventListener('click', async function() {
    try {
      const options = {
        lowercase: elements.lowercaseCheckbox.checked,
        uppercase: elements.uppercaseCheckbox.checked,
        numbers: elements.numbersCheckbox.checked,
        custom: elements.customCheckbox.checked,
        customChars: elements.customCharsInput.value,
        length: elements.lengthInput.value,
        randomLength: elements.randomLengthCheckbox.checked
      };
      
      const password = await generator.generate(options);
      if (password) {
        elements.passwordOutput.value = password;
        
        // Update length input if random was used
        if (options.randomLength) {
          elements.lengthInput.value = password.length;
        }
        
        // Show password strength
        updatePasswordStrength(password);
        
        // Add to history
        await storage.saveToHistory(password);
        
        // Auto-copy if enabled
        const settings = await storage.getSettings();
        if (settings.autoCopy.autoCopy) {
          copyToClipboard(password);
          
          // Clear clipboard after specified time if set
          const clearAfter = parseInt(settings.autoCopy.clearClipboard);
          if (clearAfter > 0) {
            setTimeout(() => {
              navigator.clipboard.writeText('').catch(err => 
                console.error('Failed to clear clipboard:', err)
              );
            }, clearAfter * 1000);
          }
        }
      }
    } catch (error) {
      console.error('Password generation failed:', error);
      alert(error.message || 'Failed to generate password. Please try again.');
    }
  });
  
  // Copy password to clipboard
  elements.copyBtn.addEventListener('click', function() {
    if (elements.passwordOutput.value) {
      copyToClipboard(elements.passwordOutput.value);
    }
  });
  
  // Helper function to copy to clipboard with visual feedback
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Visual feedback for copy success
        elements.copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
          elements.copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        }, 1000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }

  // Update password strength indicator
  function updatePasswordStrength(password) {
    if (!password) {
      elements.passwordStrength.style.display = 'none';
      return;
    }

    const strength = window.Utils.calculatePasswordStrength(password);
    elements.passwordStrength.style.display = 'block';
    elements.strengthFill.style.width = `${(strength.score / 9) * 100}%`;
    elements.strengthFill.style.backgroundColor = strength.color;
    elements.strengthText.textContent = strength.text;
    elements.strengthText.style.color = strength.color;
  }
  
  // Update history display
  async function updateHistoryDisplay() {
    try {
      const { history, settings } = await storage.getHistory();
      elements.historyList.innerHTML = '';
      
      if (history.length === 0) {
        elements.historyList.innerHTML = '<p class="empty-history">No password history yet.</p>';
        return;
      }
      
      // Process each history item
      for (let index = 0; index < history.length; index++) {
        const item = history[index];
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        // Format date
        const date = new Date(item.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        // Get the password (decrypt if needed)
        let password;
        if (item.encrypted && isEncryptedData(item.password)) {
          password = await decryptPassword(item.password);
          if (!password) {
            password = "[Decryption failed]";
          }
        } else {
          password = item.password;
        }
        
        historyItem.innerHTML = `
          <div class="history-password" title="${password}">${password}</div>
          <div class="history-actions">
            <button class="history-copy-btn btn btn-sm" data-password="${password}" title="Copy password">
              <i class="fas fa-copy"></i>
            </button>
            <button class="history-delete-btn btn btn-sm" data-index="${index}" title="Delete from history">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
        
        elements.historyList.appendChild(historyItem);
      }
      
      // Add event listeners to history item buttons
      document.querySelectorAll('.history-copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const password = this.getAttribute('data-password');
          copyToClipboard(password);
        });
      });
      
      document.querySelectorAll('.history-delete-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
          const index = parseInt(this.getAttribute('data-index'), 10);
          try {
            await storage.deleteHistoryItem(index);
            await updateHistoryDisplay(); // Refresh display
          } catch (error) {
            console.error('Failed to delete history item:', error);
          }
        });
      });
    } catch (error) {
      console.error('Failed to update history display:', error);
      elements.historyList.innerHTML = '<p class="empty-history">Failed to load history.</p>';
    }
  }
  
  // Clear History Button
  if (elements.clearHistoryBtn) {
    elements.clearHistoryBtn.addEventListener('click', async function() {
      if (confirm('Are you sure you want to clear all password history?')) {
        try {
          await storage.clearHistory();
          alert('Password history cleared successfully!');
          if (document.getElementById('history').classList.contains('active')) {
            updateHistoryDisplay();
          }
        } catch (error) {
          console.error('Failed to clear history:', error);
          alert('Failed to clear history. Please try again.');
        }
      }
    });
  }
  
  // Settings functionality
  
  // Load settings
  function loadSettings() {
    chrome.storage.local.get(['settings'], function(result) {
      if (chrome.runtime.lastError) {
        console.error('Failed to load settings:', chrome.runtime.lastError);
        return;
      }
      
      const settings = result.settings || defaultSettings;
      
      // Security settings
      if (document.getElementById('requireSpecialChars')) {
        document.getElementById('requireSpecialChars').checked = settings.security.requireSpecialChars;
      }
      if (document.getElementById('avoidAmbiguous')) {
        document.getElementById('avoidAmbiguous').checked = settings.security.avoidAmbiguous;
      }
      if (document.getElementById('localEncryption')) {
        document.getElementById('localEncryption').checked = settings.security.localEncryption;
      }
      
      // Defaults settings
      if (document.getElementById('defaultLength')) {
        document.getElementById('defaultLength').value = settings.defaults.defaultLength;
      }
      if (document.getElementById('defaultLowercase')) {
        document.getElementById('defaultLowercase').checked = settings.defaults.defaultLowercase;
      }
      if (document.getElementById('defaultUppercase')) {
        document.getElementById('defaultUppercase').checked = settings.defaults.defaultUppercase;
      }
      if (document.getElementById('defaultNumbers')) {
        document.getElementById('defaultNumbers').checked = settings.defaults.defaultNumbers;
      }
      if (document.getElementById('defaultCustom')) {
        document.getElementById('defaultCustom').checked = settings.defaults.defaultCustom;
        // Show/hide the custom characters container
        const container = document.getElementById('defaultCustomCharsContainer');
        container.style.display = settings.defaults.defaultCustom ? 'block' : 'none';
      }
      if (document.getElementById('defaultCustomChars')) {
        document.getElementById('defaultCustomChars').value = settings.defaults.defaultCustomChars;
      }
      if (document.getElementById('randomLengthMin')) {
        document.getElementById('randomLengthMin').value = settings.defaults.randomLengthMin;
      }
      if (document.getElementById('randomLengthMax')) {
        document.getElementById('randomLengthMax').value = settings.defaults.randomLengthMax;
      }
      
      // Auto-copy settings
      if (document.getElementById('autoCopy')) {
        document.getElementById('autoCopy').checked = settings.autoCopy.autoCopy;
      }
      if (document.getElementById('clearClipboard')) {
        document.getElementById('clearClipboard').value = settings.autoCopy.clearClipboard;
      }
      
      // History settings
      if (document.getElementById('historySize')) {
        document.getElementById('historySize').value = settings.history.historySize;
      }
      if (document.getElementById('autoClearHistory')) {
        document.getElementById('autoClearHistory').value = settings.history.autoClearHistory;
      }
      
      // Appearance settings
      if (document.getElementById('darkTheme') && settings.appearance.theme === 'dark') {
        document.getElementById('darkTheme').checked = true;
      } else if (document.getElementById('lightTheme')) {
        document.getElementById('lightTheme').checked = true;
      }
      
      if (document.getElementById('colorTheme')) {
        document.getElementById('colorTheme').value = settings.appearance.colorTheme;
      }
      
      // Apply theme
      applyTheme(settings.appearance.theme, settings.appearance.colorTheme);
    });
  }
  
  // Save settings
  if (elements.saveSettingsBtn) {
    elements.saveSettingsBtn.addEventListener('click', function() {
      const newSettings = {
        security: {
          requireSpecialChars: document.getElementById('requireSpecialChars').checked,
          avoidAmbiguous: document.getElementById('avoidAmbiguous').checked,
          localEncryption: document.getElementById('localEncryption').checked
        },
        defaults: {
          defaultLength: parseInt(document.getElementById('defaultLength').value),
          defaultLowercase: document.getElementById('defaultLowercase').checked,
          defaultUppercase: document.getElementById('defaultUppercase').checked,
          defaultNumbers: document.getElementById('defaultNumbers').checked,
          defaultCustom: document.getElementById('defaultCustom').checked,
          defaultCustomChars: document.getElementById('defaultCustomChars').value,
          randomLengthMin: parseInt(document.getElementById('randomLengthMin').value),
          randomLengthMax: parseInt(document.getElementById('randomLengthMax').value)
        },
        autoCopy: {
          autoCopy: document.getElementById('autoCopy').checked,
          clearClipboard: document.getElementById('clearClipboard').value
        },
        history: {
          historySize: document.getElementById('historySize').value,
          autoClearHistory: document.getElementById('autoClearHistory').value
        },
        appearance: {
          theme: document.querySelector('input[name="theme"]:checked').value,
          colorTheme: document.getElementById('colorTheme').value
        }
      };
      
      // Get current settings to check if encryption was just turned on
      chrome.storage.local.get(['settings', 'passwordHistory'], async function(result) {
        const oldSettings = result.settings || defaultSettings;
        const history = result.passwordHistory || [];
        
        // Check if encryption setting has changed
        const encryptionTurnedOn = !oldSettings.security.localEncryption && newSettings.security.localEncryption;
        const encryptionTurnedOff = oldSettings.security.localEncryption && !newSettings.security.localEncryption;
        
        // If encryption was just turned on, encrypt existing passwords
        if (encryptionTurnedOn && history.length > 0) {
          const updatedHistory = [];
          
          for (let item of history) {
            // Skip already encrypted items
            if (item.encrypted) {
              updatedHistory.push(item);
              continue;
            }
            
            // Encrypt the password
            const encryptedPassword = await encryptPassword(item.password);
            if (encryptedPassword) {
              updatedHistory.push({
                password: encryptedPassword,
                timestamp: item.timestamp,
                encrypted: true
              });
            } else {
              // If encryption fails, keep original
              updatedHistory.push(item);
            }
          }
          
          // Save the updated history
          chrome.storage.local.set({ passwordHistory: updatedHistory });
        }
        
        // If encryption was just turned off, decrypt existing passwords
        if (encryptionTurnedOff && history.length > 0) {
          const updatedHistory = [];
          
          for (let item of history) {
            // Skip non-encrypted items
            if (!item.encrypted) {
              updatedHistory.push(item);
              continue;
            }
            
            // Decrypt the password
            const decryptedPassword = await decryptPassword(item.password);
            if (decryptedPassword) {
              updatedHistory.push({
                password: decryptedPassword,
                timestamp: item.timestamp,
                encrypted: false
              });
            } else {
              // If decryption fails, keep encrypted version but mark as not encrypted
              item.encrypted = false;
              updatedHistory.push(item);
            }
          }
          
          // Save the updated history
          chrome.storage.local.set({ passwordHistory: updatedHistory });
        }
        
        // Save the new settings
        chrome.storage.local.set({ settings: newSettings }, function() {
          if (chrome.runtime.lastError) {
            console.error('Failed to save settings:', chrome.runtime.lastError);
            // Show error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'alert alert-danger py-1 mt-2 mb-0 text-center';
            errorMsg.textContent = 'Failed to save settings. Please try again.';
            
            const parent = elements.saveSettingsBtn.parentNode;
            parent.insertBefore(errorMsg, elements.saveSettingsBtn.nextSibling);
            
            setTimeout(() => {
              errorMsg.remove();
            }, 3000);
            return;
          }
          
          // Show success message
          const successMsg = document.createElement('div');
          successMsg.className = 'alert alert-success py-1 mt-2 mb-0 text-center';
          successMsg.textContent = 'Settings saved!';
          
          const parent = elements.saveSettingsBtn.parentNode;
          parent.insertBefore(successMsg, elements.saveSettingsBtn.nextSibling);
          
          // Apply theme
          applyTheme(newSettings.appearance.theme, newSettings.appearance.colorTheme);
          
          // IMPORTANT: Apply the new default values to the main tab immediately
          console.log('💾 Settings saved, applying new defaults to main tab...');
          applyDefaultValues(newSettings);
          
          // Remove success message after 2 seconds
          setTimeout(() => {
            successMsg.remove();
          }, 2000);
        });
      });
    });
  }
  
  // Apply theme function
  function applyTheme(theme, colorTheme) {
    // Remove any existing theme classes
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.remove('color-blue', 'color-green', 'color-purple', 'color-red');
    
    // Add selected theme classes
    document.body.classList.add(`theme-${theme}`);
    if (colorTheme) {
      document.body.classList.add(`color-${colorTheme}`);
    }
  }
  
  // Initialize
  function initialize() {
    console.log('🚀 Starting initialization...');
    
    // Load settings first
    loadSettings();
    
    // Then apply defaults from settings with a slight delay to ensure DOM is ready
    setTimeout(() => {
      chrome.storage.local.get(['settings'], function(result) {
        if (chrome.runtime.lastError) {
          console.error('Failed to load initial settings:', chrome.runtime.lastError);
          applyDefaultValues(defaultSettings);
          return;
        }
        
        const settings = result.settings || defaultSettings;
        console.log('📊 Loaded settings for initialization:', settings);
        console.log('🎯 About to apply default values...');
        applyDefaultValues(settings);
      });
    }, 50); // Small delay to ensure DOM elements are fully accessible
  }

  // Helper function to apply default values
  function applyDefaultValues(settings) {
    // Ensure we have all the required defaults (migration for existing users)
    const safeSettings = {
      ...settings,
      defaults: {
        ...defaultSettings.defaults,
        ...settings.defaults
      }
    };
    
    // Apply basic default values
    elements.lengthInput.value = safeSettings.defaults.defaultLength;
    elements.lowercaseCheckbox.checked = safeSettings.defaults.defaultLowercase;
    elements.uppercaseCheckbox.checked = safeSettings.defaults.defaultUppercase;
    elements.numbersCheckbox.checked = safeSettings.defaults.defaultNumbers;
    
    if (safeSettings.defaults.defaultCustom && safeSettings.defaults.defaultCustomChars) {
      elements.customCheckbox.checked = true;
      elements.customCharsContainer.style.display = 'block';
      elements.customCharsInput.value = safeSettings.defaults.defaultCustomChars;
      
      // Force trigger the change event to ensure UI is properly synced
      const changeEvent = new Event('change', { bubbles: true });
      elements.customCheckbox.dispatchEvent(changeEvent);
      
      
    } else {
      elements.customCheckbox.checked = false;
      elements.customCharsContainer.style.display = 'none';
      elements.customCharsInput.value = '';
      
      // Force trigger the change event
      const changeEvent = new Event('change', { bubbles: true });
      elements.customCheckbox.dispatchEvent(changeEvent);
    }
    
    // Additional verification step
    setTimeout(() => {
      console.log('🔍 Post-apply verification:', {
        checkboxChecked: elements.customCheckbox?.checked,
        containerDisplay: elements.customCharsContainer?.style.display,
        inputValue: elements.customCharsInput?.value,
        settingsShouldEnable: safeSettings.defaults.defaultCustom && safeSettings.defaults.defaultCustomChars
      });
    }, 100);
  }
  
  // Initialize on load
  initialize();
});