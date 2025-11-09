// src/lib/apiUser.js
import axios from "axios";

export const apiUser = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
   withCredentials: true,
});

apiUser.interceptors.request.use((config) => {
  const raw = localStorage.getItem("app_auth");
  const token = raw ? JSON.parse(raw)?.token : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiUser.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("app_auth");
      if (location.pathname !== "/login") location.replace("/login");
    }
    return Promise.reject(err);
  }
);
