// Password generation logic
class PasswordGenerator {
  constructor() {
    // Character sets
    this.lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    this.uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.numberChars = '0123456789';
    this.specialChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    this.ambiguousChars = '1lI0O';
  }

  // Validate password generation options
  validateOptions(options) {
    const { lowercase, uppercase, numbers, custom, customChars } = options;
    return lowercase || uppercase || numbers || (custom && customChars.trim() !== '');
  }

  // Generate password with given options
  async generate(options) {
    const { lowercase, uppercase, numbers, custom, customChars, length, randomLength } = options;
    
    // Validate at least one character set is selected
    if (!this.validateOptions(options)) {
      throw new Error('Please select at least one character set!');
    }
    
    // Get settings from chrome storage
    const DEFAULT_SETTINGS = {
      security: { requireSpecialChars: false, avoidAmbiguous: false, localEncryption: false },
      defaults: { defaultLength: 18, defaultLowercase: true, defaultUppercase: true, defaultNumbers: true, defaultCustom: false, defaultCustomChars: '!@#$%^&*()_+-=[]{}|;:,.<>?', randomLengthMin: 18, randomLengthMax: 25 },
      autoCopy: { autoCopy: false, clearClipboard: 0 },
      history: { historySize: 10, autoClearHistory: 0 },
      appearance: { theme: 'light', colorTheme: 'blue' }
    };
    
    let settings = DEFAULT_SETTINGS;
    try {
      const result = await new Promise((resolve) => {
        chrome.storage.local.get(['settings'], resolve);
      });
      settings = result.settings || DEFAULT_SETTINGS;
    } catch (e) {
      console.error('Failed to load settings:', e);
      settings = DEFAULT_SETTINGS;
    }
    
    // Determine character set to use
    let chars = '';
    if (lowercase) chars += this.lowercaseChars;
    if (uppercase) chars += this.uppercaseChars;
    if (numbers) chars += this.numberChars;
    
    // Add special characters if required in settings
    if (settings.security && settings.security.requireSpecialChars) {
      chars += this.specialChars;
    }
    
    // Add custom characters if specified
    if (custom && customChars.trim() !== '') {
      const customCharsStr = customChars.trim();
      chars += customCharsStr;
    } else {
      console.log('❌ Custom characters not added:', {
        customFlag: custom,
        customCharsValue: customChars,
        customCharsEmpty: !customChars || customChars.trim() === ''
      });
    }
    
    // Remove ambiguous characters if set in settings
    if (settings.security && settings.security.avoidAmbiguous) {
      chars = Array.from(chars).filter(char => !this.ambiguousChars.includes(char)).join('');
    }
    
    // Determine password length
    let passLength = parseInt(length, 10);
    
    // Validate length value
    if (isNaN(passLength) || passLength < 12 || passLength > 36) {
      passLength = 18; // Default if invalid
    }
    
    // Update random length if needed
    if (randomLength) {
      const min = settings.defaults.randomLengthMin || 18;
      const max = settings.defaults.randomLengthMax || 25;
      passLength = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Generate password
    let password = '';
    
    // Ensure inclusion of at least one character from each selected set
    if (lowercase) {
      password += this.lowercaseChars.charAt(Math.floor(Math.random() * this.lowercaseChars.length));
    }
    if (uppercase) {
      password += this.uppercaseChars.charAt(Math.floor(Math.random() * this.uppercaseChars.length));
    }
    if (numbers) {
      password += this.numberChars.charAt(Math.floor(Math.random() * this.numberChars.length));
    }
    
    // Add a special character if required
    if (settings.security && settings.security.requireSpecialChars) {
      password += this.specialChars.charAt(Math.floor(Math.random() * this.specialChars.length));
    }
    
    // Add a custom character if specified
    if (custom && customChars.trim() !== '') {
      const customCharsStr = customChars.trim();
      const randomCustomChar = customCharsStr.charAt(Math.floor(Math.random() * customCharsStr.length));
      password += randomCustomChar;
      console.log('✨ Added guaranteed custom character:', {
        customChar: randomCustomChar,
        fromCharset: customCharsStr,
        passwordSoFar: password
      });
    }
    
    // Fill remaining length with random characters
    for (let i = password.length; i < passLength; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars.charAt(randomIndex);
    }
    
    // Shuffle the password characters
    password = this.shuffleString(password);
    
    return password;
  }

  // Shuffle string function
  shuffleString(str) {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
  }
}

// Make generator available globally
window.PasswordGenerator = PasswordGenerator;