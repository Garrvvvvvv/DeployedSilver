// src/components/ApprovedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiUser } from "../lib/apiUser";

function normalizeGoogleUser(anyUser) {
  if (!anyUser) return null;
  const sub =
    anyUser.sub || anyUser.uid || anyUser.id || anyUser.user_id || anyUser.googleId || null;
  const email = anyUser.email || anyUser.mail || anyUser.user_email || null;
  if (!sub || !email) return null;
  return { sub, email };
}

const ALLOWED_BATCH = "2000";

export default function ApprovedRoute({ children }) {
  const [state, setState] = useState({ loading: true, allowed: false });

  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const authRaw = localStorage.getItem("app_auth");
        const auth = authRaw ? JSON.parse(authRaw) : null;
        const me = normalizeGoogleUser(auth?.user);
        if (!me?.sub) {
          if (!stop) setState({ loading: false, allowed: false });
          return;
        }
        // Try header first
        const res = await apiUser
          .get("/api/event/registration/me", { headers: { "x-oauth-uid": me.sub } })
          .catch(async () => {
            // fallback with query param
            return apiUser.get("/api/event/registration/me", { params: { oauthUid: me.sub } });
          });

        const rec = res?.data;
        const ok = rec && rec.status === "APPROVED" && String(rec.batch) === ALLOWED_BATCH;
        if (!stop) setState({ loading: false, allowed: !!ok });
      } catch {
        if (!stop) setState({ loading: false, allowed: false });
      }
    })();
    return () => {
      stop = true;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-white/70">
        Checking access…
      </div>
    );
  }

  return state.allowed ? children : <Navigate to="/register" replace />;
}
