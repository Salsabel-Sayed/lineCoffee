import CryptoJS from "crypto-js";

export const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY!;
export const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY!;

export function saveEncryptedToken(token: string) {
  const encrypted = CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
  localStorage.setItem(TOKEN_KEY, encrypted);
}

export function getDecryptedToken(): string | null {
  const encrypted = localStorage.getItem(TOKEN_KEY);
  if (!encrypted) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  } catch (err) {
    console.error("Error decrypting token:", err);
    return null;
  }
}

// ✅ استخراجه من JWT
export function getUserIdFromToken(): string | null {
  const token = getDecryptedToken();
  if (!token) return null;

  try {
    const base64Payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(base64Payload));
    return decodedPayload.userId || null;
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
