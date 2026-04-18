"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopNav from "@/components/top-nav";

export default function RecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [record, setRecord] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);

  useEffect(() => {
    fetch(`/api/records/${id}`)
      .then((res) => res.json())
      .then(setRecord)
      .catch(() => setRecord(null));
  }, [id]);

  async function handleSave() {
    if (!record) return;

    setSaving(true);

    try {
      const res = await fetch(`/api/records/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save record");
        return;
      }

      router.push("/records");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleReprocess() {
    if (!record || !record.document_id) {
      alert("No document linked to this record");
      return;
    }

    setReprocessing(true);

    try {
      const res = await fetch(
        `/api/documents/${record.document_id}/reprocess`,
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Reprocess failed");
        return;
      }

      // refresh record after reprocessing
      const refreshed = await fetch(`/api/records/${id}`).then((r) =>
        r.json()
      );

      setRecord(refreshed);
      alert("Reprocess complete");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Reprocess failed");
    } finally {
      setReprocessing(false);
    }
  }

  if (!record) {
    return (
      <main className="p-8">
        <TopNav />
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-4">
      <TopNav />

      <h1 className="text-3xl font-bold">Review Record</h1>

      <Field
        label="Full Name"
        value={record.full_name}
        onChange={(v) => setRecord({ ...record, full_name: v })}
      />
      <Field
        label="License Type"
        value={record.license_type}
        onChange={(v) => setRecord({ ...record, license_type: v })}
      />
      <Field
        label="License Number"
        value={record.license_number}
        onChange={(v) => setRecord({ ...record, license_number: v })}
      />
      <Field
        label="Issue Date"
        value={record.issue_date}
        onChange={(v) => setRecord({ ...record, issue_date: v })}
      />
      <Field
        label="Expiry Date"
        value={record.expiry_date}
        onChange={(v) => setRecord({ ...record, expiry_date: v })}
      />
      <Field
        label="Medical Expiry Date"
        value={record.medical_expiry_date}
        onChange={(v) =>
          setRecord({ ...record, medical_expiry_date: v })
        }
      />
      <Field
        label="Issuing Authority"
        value={record.issuing_authority}
        onChange={(v) =>
          setRecord({ ...record, issuing_authority: v })
        }
      />
      <Field
        label="Confidence Notes"
        value={record.confidence_notes}
        onChange={(v) =>
          setRecord({ ...record, confidence_notes: v })
        }
      />

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-black text-white px-4 py-2"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          onClick={handleReprocess}
          disabled={reprocessing}
          className="rounded-lg border px-4 py-2"
        >
          {reprocessing ? "Reprocessing..." : "Reprocess Document"}
        </button>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium">{label}</label>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2"
      />
    </div>
  );
}