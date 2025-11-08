import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);      // { name, email, picture, ... }
  const [token, setToken] = useState(null);    // your app JWT from backend
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("app_auth");
    if (saved) {
      const { user, token } = JSON.parse(saved);
      setUser(user);
      setToken(token);
    }
    setLoading(false);
  }, []);

  // attach token to all requests
  useEffect(() => {
    const id = api.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return () => api.interceptors.request.eject(id);
  }, [token]);

  const login = (payload) => {
    const { user, token } = payload;
    setUser(user);
    setToken(token);
    localStorage.setItem("app_auth", JSON.stringify({ user, token }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("app_auth");
  };

  const value = useMemo(() => ({ user, token, login, logout, loading }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
