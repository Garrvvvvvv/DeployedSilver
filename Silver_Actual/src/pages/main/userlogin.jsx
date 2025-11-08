import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { apiUser } from "../../lib/apiUser";
import { useMemo } from "react";

function LoginInner() {
  const navigate = useNavigate();

  const handleAuthResponse = async (credential) => {
    try {
      const { data } = await apiUser.post("/api/auth/google", { id_token: credential });
      localStorage.setItem("app_auth", JSON.stringify(data));
      navigate("/register", { replace: true }); // always go register
    } catch (e) {
      console.error(e);
      alert("Google sign-in failed");
    }
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2e2e2e] via-[#1f1f1f] to-[#121212]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div
            className="
              rounded-3xl bg-[#1f1f1f]/80 backdrop-blur-xl
              border border-white/15
              p-10
              shadow-[0_20px_60px_rgba(0,0,0,0.6)]
              hover:shadow-[0_24px_70px_rgba(0,0,0,0.75)]
              transition-shadow duration-300
            "
          >
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-white">Welcome back</h1>
              <p className="text-sm text-white/70 mt-1">Sign in to continue</p>
            </div>

            {/* removed the custom button — only default widget remains */}
            {!clientId ? (
              <div className="text-red-300 text-sm text-center">
                Missing VITE_GOOGLE_CLIENT_ID in .env
              </div>
            ) : (
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={(resp) => handleAuthResponse(resp.credential)}
                  onError={() => alert("Google sign-in failed")}
                  useOneTap
                />
              </div>
            )}

            <p className="mt-8 text-center text-xs text-white/50">
              By continuing you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const clientId = useMemo(() => import.meta.env.VITE_GOOGLE_CLIENT_ID, []);
  return (
    <GoogleOAuthProvider clientId={clientId || ""}>
      <LoginInner />
    </GoogleOAuthProvider>
  );
}
