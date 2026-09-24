export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  id: number;
  email: string;
  role: string;
}
