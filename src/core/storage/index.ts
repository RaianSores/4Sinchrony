import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'studio-4sinchrony-experience-storage' });

const TOKEN_KEY = 'auth.token';

export const tokenStorage = {
  getToken(): string | null {
    return storage.getString(TOKEN_KEY) ?? null;
  },

  setToken(token: string | null): void {
    if (token) {
      storage.set(TOKEN_KEY, token);
    } else {
      storage.remove(TOKEN_KEY);
    }
  },

  clear(): void {
    storage.remove(TOKEN_KEY);
  },
};
