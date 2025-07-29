// Utility functions
class Utils {
  // Debounce function to limit function calls
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function to limit function calls per time period
  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Input validation utilities
  static validateLength(length) {
    const num = parseInt(length, 10);
    return !isNaN(num) && num >= 12 && num <= 36;
  }

  static sanitizeInput(input) {
    return input.replace(/[<>]/g, '');
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Password strength calculation
  static calculatePasswordStrength(password) {
    if (!password) return { score: 0, text: 'Very Weak', color: '#ff4444' };

    let score = 0;
    const checks = {
      length: password.length >= 12,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      noRepeat: !/(.)\1{2,}/.test(password),
      longEnough: password.length >= 18
    };

    // Calculate score based on criteria
    Object.values(checks).forEach(check => {
      if (check) score += 1;
    });

    // Bonus points for length
    if (password.length >= 20) score += 1;
    if (password.length >= 24) score += 1;

    // Determine strength level
    if (score <= 3) return { score, text: 'Very Weak', color: '#ff4444' };
    if (score <= 4) return { score, text: 'Weak', color: '#ff8844' };
    if (score <= 6) return { score, text: 'Fair', color: '#ffaa44' };
    if (score <= 7) return { score, text: 'Good', color: '#88aa44' };
    if (score <= 8) return { score, text: 'Strong', color: '#44aa44' };
    return { score, text: 'Very Strong', color: '#00aa00' };
  }

  // Format timestamp for display
  static formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today ${date.toLocaleTimeString()}`;
    } else if (diffDays === 1) {
      return `Yesterday ${date.toLocaleTimeString()}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

// Make Utils available globally
window.Utils = Utils;