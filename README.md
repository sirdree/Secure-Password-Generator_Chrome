# Secure Password Generator v1.3.1

A Chrome extension that generates strong, customizable passwords with built-in password history and encryption.

![Extension Banner](screenshots/banner-extension.png)

## Features

- **Strong Password Generation**: Create secure passwords with custom length and character sets
- **Customizable Options**: Include lowercase, uppercase, numbers, and custom characters
- **Password History**: Save generated passwords for later reference
- **Local Encryption**: Encrypt your password history for added security
- **Dark Mode**: Choose between light and dark themes for comfortable viewing
- **Color Themes**: Personalize your extension with different color schemes

## Screenshots

| Light Theme | Dark Theme |
|-------------|------------|
| ![Light Theme](screenshots/light-theme.png) | ![Dark Theme](screenshots/dark-theme.png) |

### Password Generation
![Password Generation](screenshots/password-generation.png)

### Settings Panel
![Settings](screenshots/settings.png)

## Installation

### Chrome Web Store
1. Visit the [Chrome Web Store](https://chromewebstore.google.com/detail/perfect-password-generato/iinlllpojdhmlapkkhnmiclnfddiagmh) - Approved :)
2. Click "Add to Chrome"
3. The extension will be installed and appear in your extensions toolbar

### Manual Installation - For test purpose if needed
1. Download the latest release from the [Releases page](https://github.com/sirdree/Secure-Password-Generator_Chrome/releases/tag/v.1)
2. Unzip the file
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer Mode" in the top-right corner
5. Click "Load unpacked" and select the unzipped folder
6. The extension will be installed and appear in your extensions toolbar

## Usage

### Generating Passwords

1. Click the extension icon in your toolbar
2. Configure your password options:
   - Select character types (lowercase, uppercase, numbers, custom)
   - Set password length (12-36 characters)
   - Enable random length for more unpredictable passwords
3. Click "Generate Password"
4. Copy the password using the copy button

### Viewing Password History

1. Click the history tab (clock icon)
2. View your previously generated passwords
3. Copy or delete individual passwords as needed
4. Use "Clear All History" in settings to remove all saved passwords

### Customizing Settings

1. Click the settings tab (gear icon)
2. Adjust security settings:
   - Require special characters for stronger passwords
   - Avoid ambiguous characters (1, l, I, 0, O) for better readability
   - Enable password encryption for stored history
3. Set default options for new passwords
4. Configure auto-copy options
5. Manage history settings and preferences
6. Change appearance (light/dark theme and color scheme)

## Security Features

### Password Encryption

When enabled, all passwords in your history are encrypted using AES-GCM 256-bit encryption via the Web Crypto API:

- Each password is encrypted with a unique initialization vector
- Encryption is performed locally within the extension
- Encrypted passwords cannot be viewed from Chrome's storage
- Decryption happens automatically when viewing history

### Privacy

- All data is stored locally in your browser
- No data is transmitted to external servers
- No tracking or analytics
- No permissions beyond what's needed for core functionality

## Technical Details

### Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **UI Framework**: Bootstrap 5
- **Icons**: Font Awesome
- **Storage**: Chrome Storage API
- **Encryption**: Web Crypto API (AES-GCM)

### Directory Structure

```
secure-password-generator/
├── icons/                              # Extension icons
├── assets/
│   ├── css/                            # CSS files
│   │   ├── bootstrap.min.css
│   │   ├── fontawesome.min.css
│   │   ├── styles.css
│   │   └── theme.css
│   ├── js/                             # JavaScript files
│   │   ├── accordion.js
│   │   ├── bootstrap.bundle.min.js
│   │   ├── encryption.js
│   │   ├── generator.js
│   │   ├── popup.js
│   │   ├── settings.js
│   │   ├── storage.js
│   │   └── utils.js
│   └── webfonts/                       # Font Awesome webfonts
├── popup.html                          # Main extension interface
├── bootstrap-init.js                   # Bootstrap initialization
├── background.js                       # Background service worker
└── manifest.json                       # Extension manifest
```

## Development

### Prerequisites

- Chrome browser
- Basic knowledge of HTML, CSS, and JavaScript
- Text editor or IDE (VS Code recommended)

## Changelogs

Summary of Improvements and New Features

  🐛 Bug Fixes

  - Fixed accordion sections - Settings tabs can now be closed properly (removed conflicting accordion.js)
  - Fixed variable reference error - Resolved "lengthInput is not defined" error
  - Fixed service worker compatibility - Removed problematic settings.js file
  - Fixed borderColor TypeError - Added null checks for DOM elements
  - Fixed custom characters toggle sync - Settings now apply immediately without requiring extension restart

  ✨ New Features

  - Random Length Range Settings - Configure min/max values for random length (default: 18-25 characters)
  - Custom Characters Default Setting - Enable custom characters by default with predefined special characters (!@#$%^&*()+-=?{})
  - Real-time Settings Application - Changes in settings now apply immediately to the main tab interface

  🎨 UI/UX Improvements

  - Enhanced Dark Theme:
    - Uniform dark background across entire container
    - Distinguished tab borders with colored highlights for active tabs
    - Better visual hierarchy and contrast
    - Color theme integration (Blue, Green, Purple, Red) works seamlessly in dark mode
  - Improved Settings Sync - Default values are applied instantly when saved
  - Better Error Handling - Added comprehensive null checks and validation

  🔧 Technical Improvements

  - Modular Architecture - Better code organization and separation of concerns
  - Performance Optimizations - Cached DOM elements and debounced input validation
  - Enhanced Security - Better input sanitization and validation
  - Improved Storage Management - More robust Chrome storage handling with error recovery

  🚀 Enhanced Functionality

  - Password Strength Indicator - Visual feedback with color-coded strength levels
  - Keyboard Shortcuts - Added hotkeys for common actions (Ctrl+G to generate, etc.)
  - Migration Support - Backward compatibility for existing users upgrading settings

### Setup for Development

1. Clone this repository:
   ```
   git clone https://github.com/sirdree/Secure-Password-Generator_Chrome.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer Mode" in the top-right corner

4. Click "Load unpacked" and select the cloned repository folder

5. Make changes to the code and reload the extension to see updates

### Building for Production

1. Ensure all files are minified for production
2. Create a zip file containing all necessary files
3. Submit to the Chrome Web Store or distribute for manual installation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Bootstrap for the UI components
- Font Awesome for the icons
- All contributors and users of this extension

---

Made with ❤️ by [Ervin]

## Do you like my work? Consider supporting me...

[Support me via PayPal](https://www.paypal.com/donate/?hosted_button_id=GJGXEPFP2SWFW)

- or using this QR Code

![using this qr code](screenshots/donate_qr_code.png)
