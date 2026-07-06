import * as Keychain from 'react-native-keychain';

// JWT access/refresh tokens are sensitive — stored in the OS-encrypted Keychain (iOS)
// / Keystore (Android) instead of plain MMKV. Two separate keychain "services" so the
// access and refresh token can be set/cleared independently. `setGenericPassword` requires
// a username; it's unused here (only the password/secret slot is meaningful), so a fixed
// placeholder is fine.
const ACCESS_TOKEN_SERVICE = 'studio.4sinchrony.access-token';
const REFRESH_TOKEN_SERVICE = 'studio.4sinchrony.refresh-token';
const USERNAME_PLACEHOLDER = 'token';

async function getSecret(service: string): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({ service });
    return credentials ? credentials.password : null;
  } catch {
    return null;
  }
}

async function setSecret(service: string, value: string | null): Promise<void> {
  if (value) {
    await Keychain.setGenericPassword(USERNAME_PLACEHOLDER, value, { service });
  } else {
    await Keychain.resetGenericPassword({ service });
  }
}

export const tokenStorage = {
  async getToken(): Promise<string | null> {
    return getSecret(ACCESS_TOKEN_SERVICE);
  },

  async setToken(token: string | null): Promise<void> {
    await setSecret(ACCESS_TOKEN_SERVICE, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return getSecret(REFRESH_TOKEN_SERVICE);
  },

  async setRefreshToken(token: string | null): Promise<void> {
    await setSecret(REFRESH_TOKEN_SERVICE, token);
  },

  async clear(): Promise<void> {
    await Promise.all([
      Keychain.resetGenericPassword({ service: ACCESS_TOKEN_SERVICE }),
      Keychain.resetGenericPassword({ service: REFRESH_TOKEN_SERVICE }),
    ]);
  },
};
