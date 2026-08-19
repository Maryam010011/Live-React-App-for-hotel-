export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

export interface AuthResponse {
  status: string;
  message: string;
  token: string;
  user: AuthUser;
}
