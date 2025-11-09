// src/pages/main/RoomAllocation.jsx
import React from "react";

export default function RoomAllocation() {
  return (
    <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-xl bg-[#292929] rounded-2xl shadow-2xl p-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Room Allocation</h1>
        <p className="text-white/70">
          Coming soon. Room allocation will open after registration is complete and verified.
        </p>
        <a
          href="/register"
          className="inline-block mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm"
        >
          Back to Registration
        </a>
      </div>
    </div>
  );
}
