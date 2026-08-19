import { API_BASE_URL, ENDPOINTS } from '../constants/api';
import { AuthUser, AuthResponse } from '../types/user';
import { setStoredToken } from '../utils/storage';

export const authRegister = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH_REGISTER}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Registration failed.');
  await setStoredToken(json.token);
  return json;
};

export const authLogin = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH_LOGIN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Login failed.');
  await setStoredToken(json.token);
  return json;
};

export const authGetMe = async (token: string): Promise<AuthUser> => {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH_ME}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Session expired.');
  return json.user;
};
export const authLogout = async (): Promise<void> => {
  await setStoredToken(null);
};
