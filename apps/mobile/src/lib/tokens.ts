import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Token कुठे ठेवायचे.
 *
 * Native वर `expo-secure-store` — iOS Keychain / Android Keystore. AsyncStorage
 * वापरला असता तर तो सपाट मजकुरात राहिला असता आणि rooted फोनवर वाचता आला असता.
 *
 * Web वर SecureStore चालत नाही (तो OS चा कप्पा वापरतो), म्हणून तिथे
 * `localStorage`. आपला web target फक्त development साठी आहे — विद्यार्थी नेहमी
 * app वापरतात — त्यामुळे ही सवलत खऱ्या वापरकर्त्यांना लागू होत नाही.
 */
const ACCESS = 'mahatest.access';
const REFRESH = 'mahatest.refresh';

const isWeb = Platform.OS === 'web';

async function put(key: string, value: string | null) {
  if (isWeb) {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
    return;
  }
  if (value === null) await SecureStore.deleteItemAsync(key);
  else await SecureStore.setItemAsync(key, value);
}

async function get(key: string): Promise<string | null> {
  if (isWeb) return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

export const tokens = {
  get access() {
    return get(ACCESS);
  },
  get refresh() {
    return get(REFRESH);
  },

  async save(pair: { accessToken: string; refreshToken: string }) {
    await Promise.all([put(ACCESS, pair.accessToken), put(REFRESH, pair.refreshToken)]);
  },

  async clear() {
    await Promise.all([put(ACCESS, null), put(REFRESH, null)]);
  },
};
