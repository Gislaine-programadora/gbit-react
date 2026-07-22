import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

// Anexa o token automaticamente em toda requisição, se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gbit_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se o token expirar (401), tenta renovar automaticamente com o refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("gbit_refresh_token");

      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          );
          localStorage.setItem("gbit_access_token", data.accessToken);
          localStorage.setItem("gbit_refresh_token", data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem("gbit_access_token");
          localStorage.removeItem("gbit_refresh_token");
        }
      }
    }

    return Promise.reject(error);
  }
);
