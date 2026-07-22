import { api } from "./api";

export type User = {
  id: string;
  name: string;
  email: string;
};

export async function register(name: string, email: string, password: string) {
  const { data } = await api.post("/auth/register", { name, email, password });
  saveTokens(data.accessToken, data.refreshToken);
  return data.user as User;
}

export async function login(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  saveTokens(data.accessToken, data.refreshToken);
  return data.user as User;
}

export async function getProfile() {
  const { data } = await api.get("/auth/me");
  return data.user as User;
}

export function logout() {
  localStorage.removeItem("gbit_access_token");
  localStorage.removeItem("gbit_refresh_token");
}

function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("gbit_access_token", accessToken);
  localStorage.setItem("gbit_refresh_token", refreshToken);
}
