"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function UploadDropzone() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      acceptedFiles.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setMessage(`Uploaded ${data.count} file(s) successfully.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer"
      >
        <input {...getInputProps()} />
        <p className="text-lg font-medium">
          {isDragActive ? "Drop files here" : "Drag and drop files, or click to upload"}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          PDF, JPG, JPEG, PNG
        </p>
      </div>

      {uploading && <p>Uploading...</p>}
      {message && <p>{message}</p>}
    </div>
  );
}