// src/pages/admin/AdminRegistrations.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const PAGE_SIZE = 10;

const StatusPill = ({ status }) => {
  const map = { APPROVED: "bg-green-600", PENDING: "bg-yellow-600", REJECTED: "bg-red-600" };
  return <span className={`px-2 py-1 rounded-full text-white text-xs ${map[status] || "bg-gray-600"}`}>{status || "PENDING"}</span>;
};

const ReceiptModal = ({ open, onClose, imageUrl }) => {
  if (!open) return null;
  const toAbsolute = (u) =>
    !u ? "" : /^https?:\/\//i.test(u) ? u : `${API_BASE}${u.startsWith("/") ? u : `/${u}`}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-900 rounded-lg p-4 max-w-3xl w-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-lg font-semibold">Payment Receipt</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">✕</button>
        </div>
        {imageUrl ? (
          <img src={toAbsolute(imageUrl)} alt="Receipt" className="w-full max-h-[75vh] object-contain rounded border border-white/10" />
        ) : (
          <p className="text-white/70">No receipt available.</p>
        )}
      </div>
    </div>
  );
};

export default function AdminRegistrations() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState(null);

  const getToken = () => localStorage.getItem("adminToken");

  const logoutAndRedirect = (msg) => {
    localStorage.removeItem("adminToken");
    toast.error(msg || "Session expired. Please sign in again.");
    setTimeout(() => navigate("/admin/login"), 700);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return logoutAndRedirect("No admin token. Sign in.");

      const headers = { Authorization: `Bearer ${token}` };
      const params = statusFilter ? { status: statusFilter } : undefined;

      const res = await axios.get(`${API_BASE}/api/admin/event/registrations`, { headers, params, withCredentials: true });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("fetchData error:", err?.response || err.message);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        logoutAndRedirect(err?.response?.data?.message || "Unauthorized. Please sign in again.");
      } else if (status === 404) {
        toast.error("Endpoint not found (404). Check server routing.");
      } else {
        toast.error(err?.response?.data?.message || "Failed to load registrations");
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => setPage(1), [search, statusFilter]);

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) => {
      const hay = [
        r.name, r.email, r.batch, r.contact, r.status,
        (r.familyMembers || []).map((m) => `${m.name} ${m.relation}`).join(" "),
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [items, search]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalAmountOnPage = useMemo(() => paged.reduce((sum, r) => sum + (Number(r.amount) || 0), 0), [paged]);

  const openReceipt = (url) => {
    setReceiptUrl(url || null);
    setModalOpen(true);
  };

  // ✅ Add confirmation before approving
  const updateStatus = async (id, nextStatus) => {
    if (nextStatus === "APPROVED") {
      const sure = window.confirm("Are you sure you want to APPROVE this registration?");
      if (!sure) return; // user cancelled
    }

    try {
      const token = getToken();
      if (!token) return logoutAndRedirect("No admin token. Sign in.");

      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const res = await axios.put(`${API_BASE}/api/admin/event/registrations/${id}/status`, { status: nextStatus }, { headers, withCredentials: true });
      if (res?.status >= 400) throw new Error("Status update failed");

      toast.success(`Marked ${nextStatus}`);
      setItems((list) =>
        list.map((x) =>
          x._id === id
            ? { ...x, status: nextStatus, approvedAt: nextStatus === "APPROVED" ? new Date().toISOString() : x.approvedAt }
            : x
        )
      );
    } catch (err) {
      console.error("updateStatus error:", err?.response || err.message);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        logoutAndRedirect(err?.response?.data?.message || "Unauthorized. Please sign in again.");
      } else {
        toast.error(err?.response?.data?.message || "Failed to update status");
      }
    }
  };

  const exportCsv = () => {
    const header = ["Name", "Batch", "Contact", "Email", "Attending", "FamilyMembers", "Amount", "Status", "CreatedAt", "ApprovedAt"];
    const rows = filtered.map((r) => [
      r.name ?? "", r.batch ?? "", r.contact ?? "", r.email ?? "",
      r.comingWithFamily ? "With Family" : "Alone",
      (r.familyMembers || []).map((m) => `${m.name} (${m.relation})`).join("; "),
      r.amount ?? "", r.status ?? "",
      r.createdAt ? new Date(r.createdAt).toLocaleString() : "",
      r.approvedAt ? new Date(r.approvedAt).toLocaleString() : "",
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => {
      const s = String(cell ?? "");
      return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
    }).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    a.href = url;
    a.download = `registrations-${statusFilter || "ALL"}-${ts}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={2500} />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Registrations</h2>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-gray-800 text-white px-3 py-2 rounded">
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="">All</option>
          </select>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name/email/batch…" className="bg-gray-800 text-white px-3 py-2 rounded w-64" />
          <button onClick={exportCsv} className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded">Export CSV</button>
          <button onClick={() => { localStorage.removeItem("adminToken"); navigate("/admin/login"); }} className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded">Sign out</button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800 text-gray-200">
              <tr>
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Batch</th>
                <th className="text-left px-3 py-2">Contact</th>
                <th className="text-left px-3 py-2">Email</th>
                <th className="text-left px-3 py-2">Family</th>
                <th className="text-left px-3 py-2">Amount (₹)</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={9} className="px-3 py-6 text-center text-gray-400">Loading…</td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={9} className="px-3 py-6 text-center text-gray-400">No records</td></tr>
              ) : paged.map((r) => (
                <tr key={r._id} className="hover:bg-gray-800/50">
                  <td className="px-3 py-2 text-gray-300">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</td>
                  <td className="px-3 py-2 text-white">{r.name}</td>
                  <td className="px-3 py-2 text-gray-300">{r.batch}</td>
                  <td className="px-3 py-2 text-gray-300">{r.contact}</td>
                  <td className="px-3 py-2 text-gray-300">{r.email}</td>
                  <td className="px-3 py-2 text-gray-300">{(r.familyMembers || []).length ? (r.familyMembers.map(m => `${m.name} (${m.relation})`).join(", ")) : "-"}</td>
                  <td className="px-3 py-2 text-gray-100 font-semibold">₹{Number(r.amount || 0).toLocaleString("en-IN")}</td>
                  <td className="px-3 py-2"><StatusPill status={r.status} /></td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {r.status !== "APPROVED" && (
                        <button onClick={() => updateStatus(r._id, "APPROVED")} className="px-2 py-1 text-xs rounded bg-green-600 hover:bg-green-500 text-white">
                          Approve
                        </button>
                      )}
                      {r.status !== "REJECTED" && (
                        <button onClick={() => updateStatus(r._id, "REJECTED")} className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-500 text-white">
                          Reject
                        </button>
                      )}
                      {r.receiptUrl && (
                        <button onClick={() => openReceipt(r.receiptUrl)} className="px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-white">
                          View Receipt
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-3 py-2 bg-gray-800">
          <div className="text-gray-300 text-sm">
            Showing {(paged.length && (page - 1) * PAGE_SIZE + 1) || 0}–
            {(page - 1) * PAGE_SIZE + paged.length} of {filtered.length}
            {statusFilter ? ` (${statusFilter})` : ""}
          </div>
          <div className="text-gray-200 text-sm font-semibold">
            Page total: ₹{totalAmountOnPage.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50" disabled={page === 1}>Prev</button>
            <span className="text-gray-300 text-sm">Page {page}</span>
            <button onClick={() => setPage(p => (p * PAGE_SIZE < filtered.length ? p + 1 : p))} className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50" disabled={page * PAGE_SIZE >= filtered.length}>Next</button>
          </div>
        </div>
      </div>

      <ReceiptModal open={modalOpen} onClose={() => setModalOpen(false)} imageUrl={receiptUrl} />
    </div>
  );
}
