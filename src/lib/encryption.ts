// Note: PEPPER should be moved to server-side environment variables
// This is a placeholder - actual pepper should come from secure server config
const PEPPER_PLACEHOLDER = 'aviation_sort_pepper_placeholder_v2_secure';

export interface EncryptionResult {
  success: boolean;
  data?: string;
  error?: string;
  errorCode?: string;
}

export interface SessionData {
  username: string;
  created: number;
  lastActivity: number;
}

const STORAGE_KEYS = {
  TOKEN: 'aviation_sort_token',
  SESSIONS: 'aviation_sort_sessions',
  CRYPTO_KEY: 'aviation_sort_crypto_key'
};

const SESSION_TIMEOUT = 3600;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 300000;

// Error codes for better error handling
export const ERROR_CODES = {
  ENCRYPTION_FAILED: 'ENC_001',
  DECRYPTION_FAILED: 'DEC_001',
  INVALID_INPUT: 'INV_001',
  STORAGE_ERROR: 'STO_001',
  VALIDATION_ERROR: 'VAL_001',
  RATE_LIMIT_EXCEEDED: 'RAT_001'
} as const;

// SECURITY WARNING: This module contains client-side encryption utilities.
// For production applications, sensitive operations should be moved to server-side.
// Client-side encryption can be bypassed by determined attackers.

/**
 * Enhanced encryption utilities with improved error handling and security
 */
export const encryption = {
  /**
   * Generate a new AES-GCM crypto key
   * @returns Promise<CryptoKey>
   */
  async generateKey(): Promise<CryptoKey> {
    try {
      return await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to generate encryption key:', error);
      throw new Error(`Key generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async exportKey(key: CryptoKey): Promise<string> {
    try {
      const exported = await crypto.subtle.exportKey('raw', key);
      return this.arrayBufferToBase64(exported);
    } catch (error) {
      console.error('Failed to export key:', error);
      throw new Error('Key export failed');
    }
  },

  async importKey(keyData: string): Promise<CryptoKey> {
    try {
      if (!keyData || typeof keyData !== 'string') {
        throw new Error('Invalid key data');
      }
      const keyBuffer = this.base64ToArrayBuffer(keyData);
      return await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to import key:', error);
      throw new Error('Key import failed');
    }
  },

  async encrypt(plaintext: string, key?: CryptoKey): Promise<EncryptionResult> {
    try {
      if (!plaintext || typeof plaintext !== 'string') {
        return { 
          success: false, 
          error: 'Invalid plaintext input',
          errorCode: ERROR_CODES.INVALID_INPUT
        };
      }

      if (plaintext.length > 1000000) {
        return { 
          success: false, 
          error: 'Plaintext too large (max 1MB)',
          errorCode: ERROR_CODES.INVALID_INPUT
        };
      }

      const cryptoKey = key || await this.getOrCreateKey();
      const encoder = new TextEncoder();
      const data = encoder.encode(plaintext);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        data
      );
      
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);
      
      return { success: true, data: this.arrayBufferToBase64(combined) };
    } catch (error) {
      console.error('Encryption failed:', error);
      return { 
        success: false, 
        error: `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorCode: ERROR_CODES.ENCRYPTION_FAILED
      };
    }
  },

  async decrypt(ciphertext: string, key?: CryptoKey): Promise<EncryptionResult> {
    try {
      if (!ciphertext || typeof ciphertext !== 'string') {
        return { 
          success: false, 
          error: 'Invalid ciphertext input',
          errorCode: ERROR_CODES.INVALID_INPUT
        };
      }

      const cryptoKey = key || await this.getOrCreateKey();
      const combined = this.base64ToArrayBuffer(ciphertext);
      
      if (combined.byteLength < 13) {
        return { 
          success: false, 
          error: 'Invalid ciphertext format',
          errorCode: ERROR_CODES.DECRYPTION_FAILED
        };
      }

      const iv = new Uint8Array(combined.slice(0, 12));
      const encryptedData = new Uint8Array(combined.slice(12));
      
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encryptedData
      );
      
      const decoder = new TextDecoder();
      return { success: true, data: decoder.decode(decryptedBuffer) };
    } catch (error) {
      console.error('Decryption failed:', error);
      return { 
        success: false, 
        error: 'Decryption failed - invalid ciphertext or key',
        errorCode: ERROR_CODES.DECRYPTION_FAILED
      };
    }
  },

  async getOrCreateKey(): Promise<CryptoKey> {
    try {
      // Use sessionStorage for better security - keys are cleared when session ends
      const storedKey = sessionStorage.getItem(STORAGE_KEYS.CRYPTO_KEY);
      if (storedKey) {
        return await this.importKey(storedKey);
      }
      const newKey = await this.generateKey();
      const exported = await this.exportKey(newKey);
      sessionStorage.setItem(STORAGE_KEYS.CRYPTO_KEY, exported);
      return newKey;
    } catch (error) {
      console.error('Failed to get or create key:', error);
      throw new Error('Key management failed');
    }
  },

  hashPassword(password: string): string {
    // WARNING: Password hashing should be done server-side only
    // Client-side hashing exposes passwords to potential attacks
    console.warn('Password hashing on client-side is insecure. Use server-side hashing instead.');

    try {
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const salt = this.generateRandomBytes(32);
      const pepperBytes = new TextEncoder().encode(PEPPER_PLACEHOLDER);
      const passwordBytes = new TextEncoder().encode(password);
      const combined = new Uint8Array(salt.length + pepperBytes.length + passwordBytes.length);
      combined.set(salt, 0);
      combined.set(pepperBytes, 32);
      combined.set(passwordBytes, 64);

      return this.arrayBufferToBase64(salt) + '.' + this.sha256Sync(combined);
    } catch (error) {
      console.error('Password hashing failed:', error);
      throw new Error('Password hashing failed');
    }
  },

  verifyPassword(password: string, storedHash: string): boolean {
    // WARNING: Password verification should be done server-side only
    console.warn('Password verification on client-side is insecure. Use server-side verification instead.');

    try {
      if (!password || !storedHash) {
        return false;
      }

      const parts = storedHash.split('.');
      if (parts.length !== 2) return false;

      const salt = this.base64ToArrayBuffer(parts[0]);
      const storedPwdHash = parts[1];
      const pepperBytes = new TextEncoder().encode(PEPPER_PLACEHOLDER);
      const passwordBytes = new TextEncoder().encode(password);

      const combined = new Uint8Array(salt.byteLength + pepperBytes.length + passwordBytes.length);
      combined.set(new Uint8Array(salt), 0);
      combined.set(pepperBytes, salt.byteLength);
      combined.set(passwordBytes, salt.byteLength + pepperBytes.length);

      const computedHash = this.sha256Sync(combined);
      return this.timingSafeEqual(computedHash, storedPwdHash);
    } catch {
      return false;
    }
  },

  generateToken(length: number = 32): string {
    try {
      const bytes = this.generateRandomBytes(length);
      return this.arrayBufferToBase64(bytes)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    } catch (error) {
      console.error('Token generation failed:', error);
      throw new Error('Token generation failed');
    }
  },

  hashData(data: string): string {
    try {
      // Validate input to prevent injection attacks
      if (typeof data !== 'string' || data.length > 10000) {
        throw new Error('Invalid data for hashing');
      }

      const encoder = new TextEncoder();
      const bytes = encoder.encode(data + PEPPER_PLACEHOLDER);
      return this.sha256Sync(bytes);
    } catch (error) {
      console.error('Data hashing failed:', error);
      throw new Error('Data hashing failed');
    }
  },

  generateRandomBytes(length: number): Uint8Array {
    try {
      return crypto.getRandomValues(new Uint8Array(length));
    } catch (error) {
      console.error('Random bytes generation failed:', error);
      throw new Error('Random bytes generation failed');
    }
  },

  sha256Sync(data: Uint8Array | ArrayBuffer): string {
    try {
      const hashBuffer = crypto.subtle.digestSync('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('SHA256 sync failed:', error);
      throw new Error('SHA256 hashing failed');
    }
  },

  async sha256(message: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('SHA256 async failed:', error);
      throw new Error('SHA256 hashing failed');
    }
  },

  pbkdf2(password: string, salt: Uint8Array, iterations: number = 100000): Promise<Uint8Array> {
    try {
      const encoder = new TextEncoder();
      const passwordKey = encoder.encode(password);
      
      return crypto.subtle.importKey(
        'raw',
        passwordKey,
        'PBKDF2',
        false,
        ['deriveBits']
      ).then(key => 
        crypto.subtle.deriveBits(
          {
            name: 'PBKDF2',
            salt,
            iterations,
            hash: 'SHA-256'
          },
          key,
          256
        )
      ).then(buffer => new Uint8Array(buffer));
    } catch (error) {
      console.error('PBKDF2 failed:', error);
      throw new Error('Key derivation failed');
    }
  },

  arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    try {
      const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (error) {
      console.error('Base64 encoding failed:', error);
      throw new Error('Base64 encoding failed');
    }
  },

  base64ToArrayBuffer(base64: string): Uint8Array {
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    } catch (error) {
      console.error('Base64 decoding failed:', error);
      throw new Error('Base64 decoding failed');
    }
  },

  timingSafeEqual(a: string, b: string): boolean {
    if (!a || !b || a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
};

// SECURITY WARNING: Client-side session management is vulnerable to XSS attacks.
// Use secure HTTP-only cookies for server-side session management in production.

export const session = {
  getToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Failed to get token from storage:', error);
      return null;
    }
  },

  setToken(token: string): void {
    if (!token || typeof token !== 'string' || token.length > 1000) {
      throw new Error('Invalid token');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  },

  removeToken(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  },

  async authHeader(): Promise<Record<string, string>> {
    const token = session.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  isAuthenticated(): boolean {
    return !!session.getToken();
  },

  store: {
    getSessions(): Record<string, SessionData> {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    },

    setSession(token: string, data: SessionData): void {
      const sessions = this.getSessions();
      sessions[token] = data;
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    },

    getSession(token: string): SessionData | null {
      const sessions = this.getSessions();
      return sessions[token] || null;
    },

    removeSession(token: string): void {
      const sessions = this.getSessions();
      delete sessions[token];
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    },

    isValid(token: string): boolean {
      const session = this.getSession(token);
      if (!session) return false;
      const now = Date.now();
      if (now - session.lastActivity > SESSION_TIMEOUT) {
        this.removeSession(token);
        return false;
      }
      this.setSession(token, { ...session, lastActivity: now });
      return true;
    },

    cleanup(): void {
      const sessions = this.getSessions();
      const now = Date.now();
      const validSessions: Record<string, SessionData> = {};
      for (const [token, data] of Object.entries(sessions)) {
        if (now - data.lastActivity <= SESSION_TIMEOUT) {
          validSessions[token] = data;
        }
      }
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(validSessions));
    }
  }
};

class RateLimiter {
  private requests: Record<string, number[]> = {};
  private maxRequests = 100;
  private windowMs = 60000;

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    if (!this.requests[identifier]) {
      this.requests[identifier] = [];
    }
    this.requests[identifier] = this.requests[identifier].filter(t => now - t < this.windowMs);
    if (this.requests[identifier].length >= this.maxRequests) {
      return false;
    }
    this.requests[identifier].push(now);
    return true;
  }

  reset(identifier: string): void {
    delete this.requests[identifier];
  }
}

export const rateLimiter = new RateLimiter();

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/['"`]/g, '') // Remove quotes that could be used for injection
    .replace(/[^\w\s@.-]/g, '') // Allow only safe characters
    .trim()
    .substring(0, 500); // Limit length
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain a number');
  return { valid: errors.length === 0, errors };
}

export function generateSecureId(): string {
  const bytes = encryption.generateRandomBytes(16);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}