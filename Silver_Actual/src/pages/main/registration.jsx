// src/pages/main/registration.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { apiUser } from "../../lib/apiUser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ---------- Config ---------- */
const BASE_PRICE = 10000;
const ADDON_PRICE = 5000;

/* ---------- Helper: normalize Google user ---------- */
function normalizeGoogleUser(anyUser) {
  if (!anyUser) return null;
  const sub =
    anyUser.sub || anyUser.uid || anyUser.id || anyUser.user_id || anyUser.googleId || null;
  const email = anyUser.email || anyUser.mail || anyUser.user_email || null;
  const name = anyUser.name || anyUser.fullName || anyUser.displayName || "";
  const picture = anyUser.picture || anyUser.photoURL || anyUser.avatar || "";
  if (!sub || !email) return null;
  return { sub, email, name, picture };
}

/* ---------- Helper: make receipt URL absolute to API ---------- */
const apiBase = (import.meta.env?.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const toPublicUrl = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u; // already absolute
  return `${apiBase}${u.startsWith("/") ? u : `/${u}`}`;
};

export default function Registration() {
  const authRaw = typeof window !== "undefined" ? localStorage.getItem("app_auth") : null;
  const auth = authRaw ? JSON.parse(authRaw) : null;

  const [googleProfile, setGoogleProfile] = useState(normalizeGoogleUser(auth?.user));
  const [serverRecord, setServerRecord] = useState(null);

  const [formData, setFormData] = useState({
    name: googleProfile?.name || "",
    batch: "",
    contact: "",
    email: googleProfile?.email || "",
    linkedin: "",
    comingWithFamily: false,
    familyMembers: [],
    receiptFile: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(true);   // block form until we check server
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const totalAmount = useMemo(() => {
    if (!formData.comingWithFamily) return BASE_PRICE;
    const n = formData.familyMembers?.length || 0;
    return BASE_PRICE + ADDON_PRICE * n;
  }, [formData.comingWithFamily, formData.familyMembers]);

  /* ---------- Robust fetch: header first, fallback to query param ---------- */
  const fetchExisting = useCallback(async (sub) => {
    if (!sub) return;
    try {
      const res = await apiUser.get("/api/event/registration/me", {
        headers: { "x-oauth-uid": sub },
      });
      if (res?.data) {
        setServerRecord(res.data);
        localStorage.setItem("registration_uid", sub);
      } else {
        setServerRecord(null);
        localStorage.removeItem("registration_uid");
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        setServerRecord(null);
        localStorage.removeItem("registration_uid");
      } else {
        // Fallback: no custom headers
        try {
          const res2 = await apiUser.get("/api/event/registration/me", {
            params: { oauthUid: sub },
          });
          if (res2?.data) {
            setServerRecord(res2.data);
            localStorage.setItem("registration_uid", sub);
          } else {
            setServerRecord(null);
            localStorage.removeItem("registration_uid");
          }
        } catch {
          setServerRecord(null);
        }
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  /* ---------- Resolve identity (from app_auth or /api/auth/me) ---------- */
  useEffect(() => {
    let stopped = false;
    (async () => {
      try {
        if (googleProfile?.sub && googleProfile?.email) return;
        const res = await apiUser.get("/api/auth/me").catch(() => null);
        const me = normalizeGoogleUser(res?.data);
        if (!stopped && me) {
          setGoogleProfile(me);
          setFormData((prev) => ({
            ...prev,
            name: prev.name || me.name || "",
            email: prev.email || me.email || "",
          }));
        }
      } finally {
        if (!stopped) setIsLoadingAuth(false);
      }
    })();
    return () => {
      stopped = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Check existing registration when identity is known ---------- */
  useEffect(() => {
    if (!googleProfile?.sub) return;
    setIsChecking(true);
    fetchExisting(googleProfile.sub);
  }, [googleProfile?.sub, fetchExisting]);

  /* ---------- Fast-path using cached uid ---------- */
  useEffect(() => {
    const cached = localStorage.getItem("registration_uid");
    if (cached && googleProfile?.sub && cached === googleProfile.sub) {
      setIsChecking(true);
      fetchExisting(googleProfile.sub);
    }
  }, [googleProfile?.sub, fetchExisting]);

  /* ---------- Refetch when tab becomes visible ---------- */
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && googleProfile?.sub) {
        setIsChecking(true);
        fetchExisting(googleProfile.sub);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [googleProfile?.sub, fetchExisting]);

  const handleLogout = () => {
    localStorage.removeItem("app_auth");
    // keep registration_uid so we still fast-path to summary after re-login
    window.location.href = "/login";
  };

  /* ---------- Validation & Handlers ---------- */
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.batch.trim()) newErrors.batch = "Batch is required";
    const phoneRe = /^[0-9]{10}$/;
    if (!formData.contact.trim()) newErrors.contact = "Contact number is required";
    else if (!phoneRe.test(formData.contact)) newErrors.contact = "Invalid contact number";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRe.test(formData.email)) newErrors.email = "Invalid email address";

    if (formData.comingWithFamily) {
      formData.familyMembers.forEach((m, idx) => {
        if (!m.name?.trim()) newErrors[`family_${idx}_name`] = "Member name is required";
        if (!m.relation?.trim()) newErrors[`family_${idx}_relation`] = "Relation is required";
      });
    }

    if (!formData.receiptFile) newErrors.receiptFile = "Upload payment receipt (image)";
    else if (!/^image\//.test(formData.receiptFile.type))
      newErrors.receiptFile = "Receipt must be an image";

    setErrors(newErrors);
    if (Object.keys(newErrors).length) toast.error("Please fix the highlighted errors.");
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData((s) => ({ ...s, [name]: checked }));
      if (name === "comingWithFamily" && !checked) {
        setFormData((s) => ({ ...s, familyMembers: [] }));
      }
      return;
    }
    if (type === "file") {
      const file = files?.[0] || null;
      setFormData((s) => ({ ...s, receiptFile: file }));
      setErrors((prev) => ({ ...prev, receiptFile: undefined }));
      return;
    }
    setFormData((s) => ({ ...s, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const addFamilyMember = () =>
    setFormData((s) => ({ ...s, familyMembers: [...s.familyMembers, { name: "", relation: "" }] }));

  const removeFamilyMember = (idx) =>
    setFormData((s) => ({ ...s, familyMembers: s.familyMembers.filter((_, i) => i !== idx) }));

  const updateFamilyMember = (idx, key, value) => {
    setFormData((s) => {
      const arr = [...s.familyMembers];
      arr[idx] = { ...arr[idx], [key]: value };
      return { ...s, familyMembers: arr };
    });
    const errKey = key === "name" ? `family_${idx}_name` : `family_${idx}_relation`;
    if (errors[errKey]) setErrors((prev) => ({ ...prev, [errKey]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    let me = googleProfile;
    if (!me) {
      const res = await apiUser.get("/api/auth/me").catch(() => null);
      me = normalizeGoogleUser(res?.data);
      if (me) setGoogleProfile(me);
    }
    if (!me?.sub || !me?.email) {
      toast.error("Google account missing. Please login again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("oauthUid", me.sub);
      fd.append("oauthEmail", me.email);
      fd.append("name", formData.name);
      fd.append("batch", formData.batch);
      fd.append("contact", formData.contact);
      fd.append("email", formData.email || me.email);
      fd.append("linkedin", formData.linkedin);
      fd.append("comingWithFamily", String(formData.comingWithFamily));
      fd.append("familyMembers", JSON.stringify(formData.familyMembers || []));
      fd.append("amount", "0"); // server recomputes securely
      if (formData.receiptFile) fd.append("receipt", formData.receiptFile);

      const userToken = auth?.token;
      const headers = userToken ? { Authorization: `Bearer ${userToken}` } : undefined;

      const res = await apiUser.post("/api/event/register", fd, { headers });
      if (!res || res.status >= 400) throw new Error("Registration failed");

      setServerRecord(res.data);
      localStorage.setItem("registration_uid", me.sub);
      toast.success("Submitted! Waiting for admin approval.");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Registration failed";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Small UI helpers ---------- */
  const LoginCallout = () => (
    <div className="mb-6 bg-yellow-500/10 border border-yellow-500/40 text-yellow-200 px-4 py-3 rounded-xl">
      <p className="font-semibold">You’re not logged in</p>
      <p className="text-sm opacity-90">
        Please <a href="/login" className="underline">sign in with Google</a> to register.
      </p>
    </div>
  );

  const StickyPendingBanner = () =>
    serverRecord?.status === "PENDING" ? (
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20">
        <div className="animate-[pulse_2s_ease-in-out_infinite] bg-yellow-500 text-black px-4 py-2 rounded-full shadow-lg">
          Your registration is pending admin approval
        </div>
      </div>
    ) : null;

  /* ---------- Rendering gates ---------- */
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center p-4 pt-24">
        <div className="text-white/70">Loading…</div>
      </div>
    );
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center p-4 pt-24">
        <div className="text-white/70">Checking your registration…</div>
      </div>
    );
  }

  if (!googleProfile) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-xl bg-[#292929] rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-4">Event Registration</h2>
          <LoginCallout />
          <a
            href="/login"
            className="inline-block mt-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg"
          >
            Go to Login
          </a>
        </div>
        <ToastContainer position="top-right" autoClose={2500} theme="dark" />
      </div>
    );
  }

  /* ---------- Summary page (already registered) ---------- */
  if (serverRecord) {
    const r = serverRecord;
    return (
      <>
        <StickyPendingBanner />
        <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center p-4 pt-24">
          <div className="w-full max-w-2xl bg-[#292929] rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Your Registration</h2>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm"
              >
                Logout
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6 rounded-xl border border-white/10 bg-white/5 p-3">
              {googleProfile.picture && (
                <img
                  src={googleProfile.picture}
                  alt={googleProfile.name || "User"}
                  className="w-8 h-8 rounded-full"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="text-sm">
                <p className="text-white/90">
                  Signed in as <span className="font-semibold">{googleProfile.name}</span>
                </p>
                <p className="text-white/60">{googleProfile.email}</p>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  r.status === "APPROVED"
                    ? "bg-green-600 text-white"
                    : r.status === "REJECTED"
                    ? "bg-red-600 text-white"
                    : "bg-yellow-600 text-white"
                }`}
              >
                {r.status || "PENDING"}
              </span>
            </div>

            <div className="space-y-3 text-white/90">
              <p><span className="text-white/60">Name:</span> {r.name}</p>
              <p><span className="text-white/60">Batch:</span> {r.batch}</p>
              <p><span className="text-white/60">Contact:</span> {r.contact}</p>
              <p><span className="text-white/60">Email:</span> {r.email}</p>
              {r.linkedin && <p><span className="text-white/60">LinkedIn:</span> {r.linkedin}</p>}
              <p><span className="text-white/60">Attending:</span> {r.comingWithFamily ? "With Family" : "Alone"}</p>
              {r.comingWithFamily && (
                <div>
                  <p className="text-white/60">Family Members:</p>
                  <ul className="list-disc list-inside">
                    {(r.familyMembers || []).map((m, i) => (
                      <li key={i}>{m.name} — {m.relation}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p><span className="text-white/60">Amount:</span> ₹{Number(r.amount || 0).toLocaleString("en-IN")}</p>

              {r.receiptUrl && (
                <div className="mt-2">
                  <p className="text-white/60">Receipt:</p>
                  <img
                    src={toPublicUrl(r.receiptUrl)}
                    alt="Receipt"
                    className="mt-2 rounded-lg border border-white/10 max-h-72 object-contain"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.currentTarget.replaceWith(
                        Object.assign(document.createElement("div"), {
                          className: "mt-2 text-red-300 text-sm",
                          innerText:
                            "Could not load receipt image. Please reopen the page or contact support.",
                        })
                      );
                    }}
                  />
                </div>
              )}
            </div>

            <p className="text-white/60 text-sm mt-6">
              Status updates will appear here. One registration per Google account.
            </p>
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={2500} theme="dark" />
      </>
    );
  }

  /* ---------- Registration form (only if no record) ---------- */
  return (
    <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-2xl bg-[#292929] rounded-2xl shadow-2xl p-8 relative">
        <div className="absolute -top-3 right-6">
          <span className="bg-[#EE634F] text-white text-xs px-3 py-1 rounded-full shadow">
            Complete payment, then upload receipt
          </span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Event Registration</h2>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm"
          >
            Logout
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6 rounded-xl border border-white/10 bg-white/5 p-3">
          {googleProfile.picture && (
            <img
              src={googleProfile.picture}
              alt={googleProfile.name || "User"}
              className="w-8 h-8 rounded-full"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="text-sm">
            <p className="text-white/90">
              Signed in as <span className="font-semibold">{googleProfile.name}</span>
            </p>
            <p className="text-white/60">{googleProfile.email}</p>
          </div>
        </div>

        {/* UPI card */}
        <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-white font-semibold mb-2">Pay via UPI</p>
          <div className="flex items-center gap-4">
            <img
              src="/assets/upi-qr.png"
              alt="UPI QR"
              className="w-28 h-28 rounded-lg border border-white/10 object-contain bg-white"
            />
            <div className="text-white/80 text-sm">
              <p><span className="text-white/60">UPI ID:</span> your-upi-id@okbank</p>
              <p><span className="text-white/60">Base Fee:</span> ₹{BASE_PRICE.toLocaleString("en-IN")} (Alone)</p>
              <p><span className="text-white/60">Add-on:</span> ₹{ADDON_PRICE.toLocaleString("en-IN")} per additional person</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-gray-300">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg bg-[#333333] text-white focus:outline-none ${
                errors.name ? "border border-red-500" : "border border-[#444444]"
              }`}
            />
            {errors.name && <p className="text-red-400 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block mb-2 text-gray-300">Batch</label>
            <input
              type="text"
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              placeholder="e.g., 2022"
              className={`w-full p-3 rounded-lg bg-[#333333] text-white focus:outline-none ${
                errors.batch ? "border border-red-500" : "border border-[#444444]"
              }`}
            />
            {errors.batch && <p className="text-red-400 mt-1">{errors.batch}</p>}
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="block mb-2 text-gray-300">Contact</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="10-digit number"
                className={`w-full p-3 rounded-lg bg-[#333333] text-white focus:outline-none ${
                  errors.contact ? "border border-red-500" : "border border-[#444444]"
                }`}
              />
              {errors.contact && <p className="text-red-400 mt-1">{errors.contact}</p>}
            </div>

            <div className="flex-1">
              <label className="block mb-2 text-gray-300">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full p-3 rounded-lg bg-[#333333] text-white focus:outline-none ${
                  errors.email ? "border border-red-500" : "border border-[#444444]"
                }`}
              />
              {errors.email && <p className="text-red-400 mt-1">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block mb-2 text-gray-300">LinkedIn URL</label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              className="w-full p-3 rounded-lg bg-[#333333] text-white border border-[#444444] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="comingWithFamily"
              type="checkbox"
              name="comingWithFamily"
              checked={formData.comingWithFamily}
              onChange={handleChange}
              className="w-5 h-5 accent-[#EE634F]"
            />
            <label htmlFor="comingWithFamily" className="text-gray-300">
              Attending with family
            </label>
          </div>

          {formData.comingWithFamily && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold">Family Members</p>
                <button
                  type="button"
                  onClick={addFamilyMember}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm"
                >
                  + Add member
                </button>
              </div>
              {(formData.familyMembers || []).map((m, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                  <div className="md:col-span-1">
                    <label className="block mb-1 text-gray-300 text-sm">Name</label>
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => updateFamilyMember(idx, "name", e.target.value)}
                      className={`w-full p-2.5 rounded-lg bg-[#333333] text-white focus:outline-none ${errors[`family_${idx}_name`] ? "border border-red-500" : "border border-[#444444]"}`}
                    />
                    {errors[`family_${idx}_name`] && <p className="text-red-400 mt-1 text-sm">{errors[`family_${idx}_name`]}</p>}
                  </div>
                  <div className="md:col-span-1">
                    <label className="block mb-1 text-gray-300 text-sm">Relation</label>
                    <select
                      value={m.relation}
                      onChange={(e) => updateFamilyMember(idx, "relation", e.target.value)}
                      className={`w-full p-2.5 rounded-lg bg-[#333333] text-white focus:outline-none ${errors[`family_${idx}_relation`] ? "border border-red-500" : "border border-[#444444]"}`}
                    >
                      <option value="">Select</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors[`family_${idx}_relation`] && <p className="text-red-400 mt-1 text-sm">{errors[`family_${idx}_relation`]}</p>}
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <button type="button" onClick={() => removeFamilyMember(idx)} className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-white/80 text-sm">Amount to Pay</p>
            <p className="text-2xl font-bold text-white mt-1">
              ₹{totalAmount.toLocaleString("en-IN")}
            </p>
          </div>

          <div>
            <label className="block mb-2 text-gray-300">Upload Payment Receipt (image)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
              name="receipt"
              className={`file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#EE634F] file:text-white file:cursor-pointer text-white ${
                errors.receiptFile ? "border border-red-500" : "border border-[#444444]"
              } w-full p-2.5 rounded-lg bg-[#333333]`}
            />
            {errors.receiptFile && <p className="text-red-400 mt-1">{errors.receiptFile}</p>}
            {formData.receiptFile && (
              <div className="mt-3">
                <p className="text-white/70 text-sm mb-2">Preview:</p>
                <img
                  src={URL.createObjectURL(formData.receiptFile)}
                  alt="Receipt preview"
                  className="rounded-lg border border-white/10 max-h-72 object-contain"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#EE634F] hover:bg-[#d65544] text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Register"}
          </button>

          <p className="text-white/60 text-xs text-center">
            After submission your status will show as <span className="text-white">Pending Approval</span> until an admin verifies your payment.
          </p>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />
    </div>
  );
}
