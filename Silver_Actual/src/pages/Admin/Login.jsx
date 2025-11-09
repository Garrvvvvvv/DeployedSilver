// src/pages/admin/AdminLogin.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/admin/auth/login`, { username, password }, { withCredentials: true });
      const token = res?.data?.token;
      if (!token) {
        setErr("Login succeeded but no token returned");
        setLoading(false);
        return;
      }
      // store token for admin routes (compatibility)
      localStorage.setItem("adminToken", token);
      navigate("/admin/registrations"); // adjust route to your admin UI route
    } catch (error) {
      console.error("admin login error:", error?.response?.data || error.message);
      setErr((error?.response?.data?.message) || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <form onSubmit={submit} className="max-w-md w-full bg-gray-800 p-6 rounded shadow">
        <h2 className="text-xl font-semibold text-white mb-4">Admin sign in</h2>

        {err && <div className="text-red-400 mb-3">{err}</div>}

        <label className="block text-gray-300 text-sm mb-1">Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full mb-3 p-2 rounded bg-gray-700 text-white" placeholder="admin username" />

        <label className="block text-gray-300 text-sm mb-1">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-4 p-2 rounded bg-gray-700 text-white" placeholder="password" />

        <button type="submit" disabled={loading} className="w-full p-2 rounded bg-blue-600 hover:bg-blue-500 text-white">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
