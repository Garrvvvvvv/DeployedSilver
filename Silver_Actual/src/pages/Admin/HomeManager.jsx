import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { api } from "../../lib/api"; // keep using this for GET/DELETE

// FileUploadButton Component
const FileUploadButton = ({ file, setFile }) => {
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    if (e.target.files?.length > 0) {
      const f = e.target.files[0];
      setFile(f);
      setFileName(f.name);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleChange}
        accept="image/png,image/jpeg,image/webp,image/gif"
      />
      <label
        htmlFor="file-upload"
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white font-semibold rounded cursor-pointer hover:bg-gray-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0 0l-4-4m4 4l4-4m0-6V4m0 0l-4 4m4-4l4 4" />
        </svg>
        Choose File
      </label>
      {fileName && <span className="text-gray-300 text-sm truncate max-w-xs">{fileName}</span>}
    </div>
  );
};

const AdminHomeImages = () => {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("home_announcement");

  const token = localStorage.getItem("adminToken");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

  // Avoid duplicate fetches (React StrictMode)
  const fetchLockRef = useRef({}); // map category -> boolean

  const fetchImages = async (cat = category) => {
    if (fetchLockRef.current[cat]) return; // lock for this category
    fetchLockRef.current[cat] = true;
    try {
      const res = await api.get("/api/admin/images", {
        headers: authHeaders,
        params: { category: cat },
      });
      setImages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load images";
      toast.error(msg);
    } finally {
      // release lock shortly after to allow manual refresh if needed
      setTimeout(() => (fetchLockRef.current[cat] = false), 200);
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.warn("Please select a file first!");
    setLoading(true);

    try {
      const form = new FormData();
      form.append("image", file, file.name); // field name MUST be "image"
      form.append("category", category);

      // Use fetch to guarantee proper multipart with boundary
      const baseURL = api?.defaults?.baseURL || "";
      const res = await fetch(`${baseURL}/api/admin/images/upload`, {
        method: "POST",
        headers: {
          ...(authHeaders || {}),
          // DO NOT set Content-Type here; the browser will set the multipart boundary
        },
        body: form,
        credentials: "include", // harmless if you don't use cookies
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          toast.error(data?.message || "Session expired. Please sign in again.");
          localStorage.removeItem("adminToken");
          return;
        }
        throw new Error(data?.message || `Upload failed (${res.status})`);
      }

      toast.success("✅ Image uploaded successfully!");
      setFile(null);
      await fetchImages(category);
    } catch (err) {
      console.error("upload error:", err);
      toast.error(err?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image permanently?")) return;
    try {
      const res = await api.delete(`/api/admin/images/${id}`, { headers: authHeaders });
      if (!res || res.status >= 400) throw new Error("Delete failed");
      toast.success("🗑️ Image deleted!");
      fetchImages(category);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Delete failed";
      toast.error(msg);
    }
  };

  // Load when category changes
  useEffect(() => {
    fetchImages(category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Home Page Images</h2>

      <div className="flex items-center gap-3 mb-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border px-2 py-1 rounded bg-gray-800 text-white"
        >
          <option value="home_announcement">🏠 Announcements</option>
          <option value="home_memories">🏠 Memories</option>
          <option value="memories_page">🖼️ Memories Page</option>
        </select>

        <FileUploadButton file={file} setFile={setFile} />

        <button
          onClick={handleUpload}
          className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded font-semibold text-white disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img._id} className="bg-gray-800 p-3 rounded relative">
            <img src={img.url} alt="uploaded" className="rounded w-full object-cover" loading="lazy" />
            <button
              onClick={() => handleDelete(img._id)}
              className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Delete
            </button>
          </div>
        ))}
        {images.length === 0 && (
          <p className="text-sm text-gray-400">No images for this category yet.</p>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AdminHomeImages;
