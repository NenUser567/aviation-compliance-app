"use client";

import { useEffect, useState } from "react";
import UploadDropzone from "@/components/upload-dropzone";
import TopNav from "@/components/top-nav";
import { UploadCloud } from "lucide-react";

export default function UploadPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState("");

  useEffect(() => {
    fetch("/api/extraction-profiles")
      .then((res) => res.json())
      .then(setProfiles);
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
        <TopNav />

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">
            Upload Documents
          </h1>
          <p className="text-zinc-600 mt-2">
            Upload aviation licensing documents and choose how they should be analyzed.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
          
          {/* Profile Selector */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Extraction Mode
            </label>

            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Default (Full Extraction)</option>

              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <p className="text-xs text-zinc-500 mt-2">
              Choose how much data should be extracted from documents.
            </p>
          </div>

          {/* Dropzone */}
          <UploadDropzone profileId={selectedProfile} />
        </div>
      </div>
    </main>
  );
}