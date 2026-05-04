"use client";

import { useEffect, useMemo, useState } from "react";
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

  const risk = useMemo(() => getRisk(record), [record]);

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
    if (!record?.document_id) {
      alert("No document linked to this record");
      return;
    }

    setReprocessing(true);

    try {
      const res = await fetch(`/api/documents/${record.document_id}/reprocess`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Reprocess failed");
        return;
      }

      const refreshed = await fetch(`/api/records/${id}`).then((r) => r.json());
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
      <main className="min-h-screen bg-zinc-100 p-8">
        <TopNav />
        <p className="mt-6 text-zinc-600">Loading record...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <TopNav />

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Human Verification Required
              </p>
              <h1 className="mt-2 text-4xl font-black text-zinc-950">
                Review Record
              </h1>
              <p className="mt-2 text-zinc-600">
                Compare extracted fields with the original document before
                trusting the result.
              </p>
            </div>

            <RiskBadge risk={risk} />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {/* Document Evidence */}
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-950">
                Original Document
              </h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                Evidence
              </span>
            </div>

            <div className="mt-4 rounded-2xl border bg-zinc-50 p-4 min-h-[520px] flex items-center justify-center">
              {record.document_url || record.public_url || record.file_url ? (
                <img
                  src={
                    record.document_url || record.public_url || record.file_url
                  }
                  alt="Uploaded document"
                  className="max-h-[680px] w-full rounded-xl object-contain"
                />
              ) : (
                <div className="text-center">
                  <p className="font-semibold text-zinc-700">
                    No document preview available
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    Your API needs to return a public document URL for this
                    record.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Extracted Data */}
          <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-xl font-bold text-zinc-950">
                Extracted Fields
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Correct anything the AI extracted wrongly. This page is designed
                for review, not blind automation.
              </p>
            </div>

            <ImportantField
              label="Expiry Date"
              value={record.expiry_date}
              risk={risk}
              onChange={(v) => setRecord({ ...record, expiry_date: v })}
            />

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

            <TextArea
              label="Confidence Notes"
              value={record.confidence_notes}
              onChange={(v) =>
                setRecord({ ...record, confidence_notes: v })
              }
            />

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-bold text-amber-900">Verification reminder</p>
              <p className="mt-1 text-sm text-amber-800">
                AI extraction can be wrong. Confirm the fields against the
                document before using this record for compliance decisions.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-zinc-950 px-5 py-3 font-bold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Verified Changes"}
              </button>

              <button
                onClick={handleReprocess}
                disabled={reprocessing}
                className="rounded-xl border border-zinc-300 bg-white px-5 py-3 font-bold text-zinc-900 disabled:opacity-50"
              >
                {reprocessing ? "Reprocessing..." : "Reprocess Document"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function getRisk(record: any | null) {
  if (!record?.expiry_date) {
    return {
      status: "UNKNOWN",
      label: "Unknown Expiry",
      message: "No expiry date found",
      daysLeft: null,
    };
  }

  const today = new Date();
  const expiry = new Date(record.expiry_date);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffMs = expiry.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      status: "EXPIRED",
      label: "Expired",
      message: `${Math.abs(daysLeft)} day(s) overdue`,
      daysLeft,
    };
  }

  if (daysLeft <= 60) {
    return {
      status: "EXPIRING_SOON",
      label: "Expiring Soon",
      message: `${daysLeft} day(s) left`,
      daysLeft,
    };
  }

  return {
    status: "VALID",
    label: "Valid",
    message: `${daysLeft} day(s) left`,
    daysLeft,
  };
}

function RiskBadge({ risk }: { risk: any }) {
  const styles: Record<string, string> = {
    EXPIRED: "bg-red-100 text-red-900 border-red-300",
    EXPIRING_SOON: "bg-amber-100 text-amber-900 border-amber-300",
    VALID: "bg-emerald-100 text-emerald-900 border-emerald-300",
    UNKNOWN: "bg-zinc-100 text-zinc-900 border-zinc-300",
  };

  return (
    <div className={`rounded-2xl border px-5 py-4 ${styles[risk.status]}`}>
      <p className="text-sm font-semibold">Current Status</p>
      <p className="mt-1 text-3xl font-black">{risk.label}</p>
      <p className="mt-1 text-sm font-medium">{risk.message}</p>
    </div>
  );
}

function ImportantField({
  label,
  value,
  risk,
  onChange,
}: {
  label: string;
  value: string | null;
  risk: any;
  onChange: (v: string) => void;
}) {
  const border =
    risk.status === "EXPIRED"
      ? "border-red-400 bg-red-50"
      : risk.status === "EXPIRING_SOON"
      ? "border-amber-400 bg-amber-50"
      : "border-zinc-300 bg-white";

  return (
    <div className={`rounded-2xl border p-4 ${border}`}>
      <label className="block text-sm font-bold text-zinc-800">{label}</label>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-3 text-lg font-bold"
      />
      <p className="mt-2 text-sm font-semibold text-zinc-700">
        {risk.message}
      </p>
    </div>
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
      <label className="block text-sm font-bold text-zinc-700">{label}</label>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3"
      />
    </div>
  );
}

function TextArea({
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
      <label className="block text-sm font-bold text-zinc-700">{label}</label>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3"
      />
    </div>
  );
}