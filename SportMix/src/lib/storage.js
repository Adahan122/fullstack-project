const storagePrefix = "sportmix";

export const storageKeys = {
  cart: `${storagePrefix}:cart`,
  favorites: `${storagePrefix}:favorites`,
  orders: `${storagePrefix}:orders`,
  token: `${storagePrefix}:token`,
  user: `${storagePrefix}:user`,
  authPromptSeen: `${storagePrefix}:auth-prompt-seen`,
};

export function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Failed to read localStorage key "${key}"`, error);
    return fallback;
  }
}

export function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write localStorage key "${key}"`, error);
  }
}

export function readString(key, fallback = "") {
  try {
    const value = localStorage.getItem(key);
    return value ?? fallback;
  } catch (error) {
    console.error(`Failed to read localStorage key "${key}"`, error);
    return fallback;
  }
}

export function writeString(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to write localStorage key "${key}"`, error);
  }
}

export function removeStoredValue(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove localStorage key "${key}"`, error);
  }
}
