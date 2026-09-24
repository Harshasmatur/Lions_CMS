import { api, ApiSuccess } from "@/lib/api";
import { AuthUser } from "@/lib/auth";

interface LoginResponse {
  token: string;
  user: AuthUser;
}

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post<ApiSuccess<LoginResponse>>("/auth/login", { email, password });
  return data.data;
}

export async function fetchCurrentUser() {
  const { data } = await api.get<ApiSuccess<AuthUser>>("/auth/me");
  return data.data;
}
