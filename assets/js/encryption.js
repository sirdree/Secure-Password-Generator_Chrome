// Encryption and decryption utilities

// Generate a random encryption key if not already created
async function getOrCreateEncryptionKey() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['encryptionKey'], async function(result) {
        if (result.encryptionKey) {
          // Key exists, return it as ArrayBuffer
          resolve(new Uint8Array(result.encryptionKey).buffer);
        } else {
          // Generate a new encryption key
          const key = await window.crypto.subtle.generateKey(
            {
              name: "AES-GCM",
              length: 256
            },
            true,
            ["encrypt", "decrypt"]
          );
          
          // Export the key to raw format
          const exportedKey = await window.crypto.subtle.exportKey("raw", key);
          
          // Store the key in local storage (as array for JSON storage)
          const keyArray = Array.from(new Uint8Array(exportedKey));
          chrome.storage.local.set({ encryptionKey: keyArray });
          
          resolve(exportedKey);
        }
      });
    });
  }
  
  // Import the raw key data into a CryptoKey
  async function importEncryptionKey(keyData) {
    return await window.crypto.subtle.importKey(
      "raw",
      keyData,
      {
        name: "AES-GCM",
        length: 256
      },
      false,
      ["encrypt", "decrypt"]
    );
  }
  
  // Encrypt a password
  async function encryptPassword(password) {
    try {
      // Get or create the encryption key
      const keyData = await getOrCreateEncryptionKey();
      const key = await importEncryptionKey(keyData);
      
      // Generate random IV for this encryption
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt the password
      const encodedPassword = new TextEncoder().encode(password);
      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        key,
        encodedPassword
      );
      
      // Convert to a format that can be stored in JSON
      return {
        encrypted: Array.from(new Uint8Array(encryptedData)),
        iv: Array.from(iv)
      };
    } catch (err) {
      console.error("Encryption error:", err);
      return null;
    }
  }
  
  // Decrypt an encrypted password
  async function decryptPassword(encryptedData) {
    try {
      // Get the encryption key
      const keyData = await getOrCreateEncryptionKey();
      const key = await importEncryptionKey(keyData);
      
      // Prepare the encrypted data and IV
      const encrypted = new Uint8Array(encryptedData.encrypted).buffer;
      const iv = new Uint8Array(encryptedData.iv);
      
      // Decrypt the password
      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        key,
        encrypted
      );
      
      // Convert back to string
      return new TextDecoder().decode(decryptedData);
    } catch (err) {
      console.error("Decryption error:", err);
      return null;
    }
  }
  
  // Helper function to check if an object looks like encrypted data
  function isEncryptedData(obj) {
    return obj && 
           typeof obj === 'object' && 
           Array.isArray(obj.encrypted) && 
           Array.isArray(obj.iv);
  }