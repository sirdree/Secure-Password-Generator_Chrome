// Make sure all code runs only after DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  // Password Generator Elements
  const lowercaseCheckbox = document.getElementById('lowercase');
  const uppercaseCheckbox = document.getElementById('uppercase');
  const numbersCheckbox = document.getElementById('numbers');
  const customCheckbox = document.getElementById('custom');
  const customCharsContainer = document.getElementById('customCharsContainer');
  const customCharsInput = document.getElementById('customChars');
  const lengthInput = document.getElementById('length');
  const randomLengthCheckbox = document.getElementById('randomLength');
  const generateBtn = document.getElementById('generateBtn');
  const passwordOutput = document.getElementById('passwordOutput');
  const copyBtn = document.getElementById('copyBtn');
  const historyList = document.getElementById('historyList');
  
  // Settings Elements
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  
  // Default settings
  const defaultSettings = {
    security: {
      requireSpecialChars: false,
      avoidAmbiguous: false,
      localEncryption: false
    },
    defaults: {
      defaultLength: 16,
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
      theme: 'light',
      colorTheme: 'blue'
    }
  };
  
  // Character sets
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
  const ambiguousChars = '1lI0O';
  
  // Tab switching functionality
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Get the tab id from data-tab attribute
      const tabId = this.getAttribute('data-tab');
      
      // Update active tab button
      tabButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Update active tab pane
      tabPanes.forEach(pane => pane.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
      
      // If switching to history tab, update history display
      if (tabId === 'history') {
        chrome.storage.local.get(['passwordHistory', 'settings'], function(result) {
          updateHistoryDisplay(result.passwordHistory || [], result.settings || defaultSettings);
        });
      }
    });
  });
  
  // Show/hide custom chars input based on checkbox
  customCheckbox.addEventListener('change', function() {
    customCharsContainer.style.display = this.checked ? 'block' : 'none';
  });
  
  // Handle random length checkbox
  randomLengthCheckbox.addEventListener('change', function() {
    if (this.checked) {
      const randomLen = Math.floor(Math.random() * (20 - 16 + 1)) + 16;
      lengthInput.value = randomLen;
      lengthInput.disabled = true;
    } else {
      lengthInput.disabled = false;
    }
  });
  
  // Generate password
  generateBtn.addEventListener('click', function() {
    const password = generatePassword();
    if (password) {
      passwordOutput.value = password;
      
      // Add to history
      saveToHistory(password);
      
      // Auto-copy if enabled
      chrome.storage.local.get(['settings'], function(result) {
        const settings = result.settings || defaultSettings;
        if (settings.autoCopy.autoCopy) {
          copyToClipboard(password);
          
          // Clear clipboard after specified time if set
          const clearAfter = parseInt(settings.autoCopy.clearClipboard);
          if (clearAfter > 0) {
            setTimeout(() => {
              navigator.clipboard.writeText('');
            }, clearAfter * 1000);
          }
        }
      });
    }
  });
  
  // Copy password to clipboard
  copyBtn.addEventListener('click', function() {
    if (passwordOutput.value) {
      copyToClipboard(passwordOutput.value);
    }
  });
  
  // Helper function to copy to clipboard with visual feedback
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Visual feedback for copy success
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        }, 1000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }
  
  // Generate password function
  function generatePassword() {
    // Validate at least one character set is selected
    if (!lowercaseCheckbox.checked && 
        !uppercaseCheckbox.checked && 
        !numbersCheckbox.checked && 
        !(customCheckbox.checked && customCharsInput.value.trim() !== '')) {
      alert('Please select at least one character set!');
      return '';
    }
    
    // Get settings
    let settings;
    try {
      const storedSettings = JSON.parse(localStorage.getItem('settings')) || defaultSettings;
      settings = storedSettings;
    } catch (e) {
      settings = defaultSettings;
    }
    
    // Determine character set to use
    let chars = '';
    if (lowercaseCheckbox.checked) chars += lowercaseChars;
    if (uppercaseCheckbox.checked) chars += uppercaseChars;
    if (numbersCheckbox.checked) chars += numberChars;
    
    // Add special characters if required in settings
    if (settings.security && settings.security.requireSpecialChars) {
      chars += specialChars;
    }
    
    // Add custom characters if specified
    if (customCheckbox.checked && customCharsInput.value.trim() !== '') {
      chars += customCharsInput.value.trim();
    }
    
    // Remove ambiguous characters if set in settings
    if (settings.security && settings.security.avoidAmbiguous) {
      chars = Array.from(chars).filter(char => !ambiguousChars.includes(char)).join('');
    }
    
    // Determine password length
    let passLength;
    passLength = parseInt(lengthInput.value, 10);
    
    // Validate length value
    if (isNaN(passLength) || passLength < 12 || passLength > 36) {
      passLength = 16; // Default if invalid
      lengthInput.value = passLength;
    }
    
    // Update random length if needed
    if (randomLengthCheckbox.checked) {
      const randomLen = Math.floor(Math.random() * (20 - 16 + 1)) + 16;
      lengthInput.value = randomLen;
      passLength = randomLen;
    }
    
    // Generate password
    let password = '';
    
    // Ensure inclusion of at least one character from each selected set
    if (lowercaseCheckbox.checked) {
      password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
    }
    if (uppercaseCheckbox.checked) {
      password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
    }
    if (numbersCheckbox.checked) {
      password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
    }
    
    // Add a special character if required
    if (settings.security && settings.security.requireSpecialChars) {
      password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    }
    
    // Add a custom character if specified
    if (customCheckbox.checked && customCharsInput.value.trim() !== '') {
      const customChars = customCharsInput.value.trim();
      password += customChars.charAt(Math.floor(Math.random() * customChars.length));
    }
    
    // Fill remaining length with random characters
    for (let i = password.length; i < passLength; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars.charAt(randomIndex);
    }
    
    // Shuffle the password characters
    password = shuffleString(password);
    
    return password;
  }
  
  // Shuffle string function
  function shuffleString(str) {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
  }
  
  // Save password to history
  async function saveToHistory(password) {
    // Get existing history and settings
    chrome.storage.local.get(['passwordHistory', 'settings'], async function(result) {
      let history = result.passwordHistory || [];
      const settings = result.settings || defaultSettings;
      const historySize = parseInt(settings.history.historySize) || 10;
      
      // Prepare the password entry
      let passwordEntry = {
        password: password,
        timestamp: new Date().toISOString()
      };
      
      // Encrypt the password if encryption is enabled
      if (settings.security.localEncryption) {
        const encryptedPassword = await encryptPassword(password);
        if (encryptedPassword) {
          passwordEntry.password = encryptedPassword;
          passwordEntry.encrypted = true;
        }
      }
      
      // Add new password to the beginning of history
      history.unshift(passwordEntry);
      
      // Limit history size based on settings
      if (history.length > historySize) {
        history = history.slice(0, historySize);
      }
      
      // Save updated history
      chrome.storage.local.set({ passwordHistory: history });
    });
  }
  
  // Update history display
  async function updateHistoryDisplay(history, settings) {
    historyList.innerHTML = '';
    
    if (history.length === 0) {
      historyList.innerHTML = '<p class="empty-history">No password history yet.</p>';
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
      
      historyList.appendChild(historyItem);
    }
    
    // Add event listeners to history item buttons
    document.querySelectorAll('.history-copy-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const password = this.getAttribute('data-password');
        copyToClipboard(password);
      });
    });
    
    document.querySelectorAll('.history-delete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'), 10);
        
        chrome.storage.local.get(['passwordHistory'], function(result) {
          let history = result.passwordHistory || [];
          
          // Remove item at index
          history.splice(index, 1);
          
          // Save updated history
          chrome.storage.local.set({ passwordHistory: history }, function() {
            // Update history display
            chrome.storage.local.get(['settings'], function(result) {
              updateHistoryDisplay(history, result.settings || defaultSettings);
            });
          });
        });
      });
    });
  }
  
  // Clear History Button
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear all password history?')) {
        chrome.storage.local.set({ passwordHistory: [] }, function() {
          alert('Password history cleared successfully!');
          if (document.getElementById('history').classList.contains('active')) {
            updateHistoryDisplay([]);
          }
        });
      }
    });
  }
  
  // Settings functionality
  
  // Load settings
  function loadSettings() {
    chrome.storage.local.get(['settings'], function(result) {
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
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', function() {
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
          defaultNumbers: document.getElementById('defaultNumbers').checked
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
          // Show success message
          const successMsg = document.createElement('div');
          successMsg.className = 'alert alert-success py-1 mt-2 mb-0 text-center';
          successMsg.textContent = 'Settings saved!';
          
          const parent = saveSettingsBtn.parentNode;
          parent.insertBefore(successMsg, saveSettingsBtn.nextSibling);
          
          // Apply theme
          applyTheme(newSettings.appearance.theme, newSettings.appearance.colorTheme);
          
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
    // Load settings
    loadSettings();
    
    // Apply defaults from settings
    chrome.storage.local.get(['settings'], function(result) {
      const settings = result.settings || defaultSettings;
      
      // Apply default values
      lengthInput.value = settings.defaults.defaultLength;
      lowercaseCheckbox.checked = settings.defaults.defaultLowercase;
      uppercaseCheckbox.checked = settings.defaults.defaultUppercase;
      numbersCheckbox.checked = settings.defaults.defaultNumbers;
    });
  }
  
  // Initialize on load
  initialize();
});