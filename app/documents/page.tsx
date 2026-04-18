"use client";

import { useEffect, useState } from "react";
import TopNav from "@/components/top-nav";

type Doc = {
  id: string;
  original_filename: string;
  mime_type: string;
  processing_status: string;
  error_message?: string | null;
  created_at: string;
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);

  useEffect(() => {
    fetch("/api/documents")
      .then((res) => res.json())
      .then(setDocs);
  }, []);

  return (
    <main className="max-w-6xl mx-auto p-8 space-y-6">
      <TopNav />

      <div>
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-zinc-600 mt-1">
          Uploaded source files and processing status.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100">
            <tr>
              <th className="text-left p-3">Filename</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Error</th>
              <th className="text-left p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc.id} className="border-t">
                <td className="p-3">{doc.original_filename}</td>
                <td className="p-3">{doc.mime_type}</td>
                <td className="p-3">{doc.processing_status}</td>
                <td className="p-3 text-red-600">{doc.error_message ?? "-"}</td>
                <td className="p-3">
                  {new Date(doc.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}