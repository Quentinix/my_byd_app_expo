import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEYS = {
  USERNAME: 'byd_cloud_username',
  PASSWORD: 'byd_cloud_password',
  COUNTRY_CODE: 'byd_cloud_country_code',
  REMEMBER_ME: 'byd_cloud_remember_me',
  SESSION: 'byd_cloud_session',
};

const memoryStorage: Record<string, string> = {};

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryStorage[key] || null;
    }
  }
  return await SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch {
      memoryStorage[key] = value;
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch {
      delete memoryStorage[key];
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export interface StoredSession {
  userId: string;
  signToken: string;
  encryToken: string;
  timestamp: number;
}

export interface StoredCredentials {
  username: string;
  password?: string;
  countryCode: string;
  rememberMe: boolean;
}

export const BydSecureStorage = {
  async saveCredentials(credentials: StoredCredentials): Promise<void> {
    await setItem(KEYS.USERNAME, credentials.username);
    await setItem(KEYS.COUNTRY_CODE, credentials.countryCode);
    await setItem(KEYS.REMEMBER_ME, credentials.rememberMe ? 'true' : 'false');

    if (credentials.rememberMe && credentials.password) {
      await setItem(KEYS.PASSWORD, credentials.password);
    } else {
      await deleteItem(KEYS.PASSWORD);
    }
  },

  async loadCredentials(): Promise<StoredCredentials | null> {
    const username = await getItem(KEYS.USERNAME);
    if (!username) return null;

    const countryCode = (await getItem(KEYS.COUNTRY_CODE)) || 'FR';
    const rememberMe = (await getItem(KEYS.REMEMBER_ME)) === 'true';
    const password = rememberMe ? (await getItem(KEYS.PASSWORD)) || undefined : undefined;

    return {
      username,
      password,
      countryCode,
      rememberMe,
    };
  },

  async saveSession(session: StoredSession): Promise<void> {
    await setItem(KEYS.SESSION, JSON.stringify(session));
  },

  async loadSession(): Promise<StoredSession | null> {
    const sessionStr = await getItem(KEYS.SESSION);
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  },

  async clearSession(): Promise<void> {
    await deleteItem(KEYS.SESSION);
  },

  async clearAll(): Promise<void> {
    await deleteItem(KEYS.USERNAME);
    await deleteItem(KEYS.PASSWORD);
    await deleteItem(KEYS.COUNTRY_CODE);
    await deleteItem(KEYS.REMEMBER_ME);
    await deleteItem(KEYS.SESSION);
  },
};
