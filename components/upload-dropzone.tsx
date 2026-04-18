"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";

type Props = {
  profileId?: string;
};

export default function UploadDropzone({ profileId }: Props) {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [batchId, setBatchId] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;

      setUploading(true);
      setMessage("");
      setBatchId(null);

      try {
        const formData = new FormData();

        acceptedFiles.forEach((file) =>
          formData.append("files", file)
        );

        if (profileId) {
          formData.append("profile_id", profileId);
        }

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Upload failed");
        }

        setBatchId(data.batchId);
        setMessage(`Uploaded ${data.count} file(s). Ready to process.`);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Upload failed."
        );
      } finally {
        setUploading(false);
      }
    },
    [profileId]
  );

  async function handleProcess() {
  if (!batchId) return;

  setProcessing(true);
  setMessage("Processing documents...");

  try {
    const res = await fetch(`/api/batches/${batchId}/process`, {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Processing failed");
    }

    setMessage(
      `Processed ${data.processed} / ${data.total} documents. ${
        data.failed ? `${data.failed} failed.` : ""
      }`
    );

  } catch (error) {
    setMessage(
      error instanceof Error ? error.message : "Processing failed."
    );
  } finally {
    setProcessing(false);
  }
}

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
  });

  return (
    <div className="space-y-4">

      {/* Drop Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition
        ${
          isDragActive
            ? "border-black bg-zinc-100"
            : "border-zinc-300 bg-zinc-50 hover:bg-zinc-100"
        }`}
      >
        <input {...getInputProps()} />

        <p className="text-lg font-medium text-zinc-900">
          {isDragActive
            ? "Drop files here"
            : "Drag & drop files, or click to upload (Max files :10)"}
        </p>

        <p className="text-sm text-zinc-500 mt-2">
          JPG, JPEG, PNG
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">

        {uploading && (
          <button
            disabled
            className="rounded-lg bg-zinc-300 text-zinc-700 px-4 py-2"
          >
            Uploading...
          </button>
        )}

        {!uploading && batchId && (
          <button
            onClick={handleProcess}
            disabled={processing}
            className="rounded-lg bg-black text-white px-4 py-2 hover:bg-zinc-800 transition"
          >
            {processing ? "Processing..." : "Process Batch"}
          </button>
        )}
      </div>

      {/* Status */}
     {message && (
  <div
    className={`text-sm border rounded-lg px-3 py-2 ${
      processing
        ? "bg-yellow-50 border-yellow-200 text-yellow-800"
        : message.toLowerCase().includes("failed")
        ? "bg-red-50 border-red-200 text-red-800"
        : "bg-green-50 border-green-200 text-green-800"
    }`}
  >
    {message}
  </div>
)}

      {batchId && (
        <p className="text-xs text-zinc-500">
          Batch ID: {batchId}
        </p>
      )}
    </div>
  );
}