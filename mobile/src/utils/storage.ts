import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'luxestay_token';
let cachedToken: string | null = null;

export const setStoredToken = async (token: string | null): Promise<void> => {
  cachedToken = token;
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
};

export const getStoredToken = async (): Promise<string | null> => {
  if (cachedToken) return cachedToken;
  cachedToken = await AsyncStorage.getItem(TOKEN_KEY);
  return cachedToken;
};

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
