"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/top-nav";

type RecordRow = {
  id: string;
  full_name: string | null;
  license_type: string | null;
  license_number: string | null;
  expiry_date: string | null;
  compliance_results?: {
    status?: string;
    days_to_expiry?: number | null;
  } | null;
};

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/dashboard/records")
      .then((res) => res.json())
      .then(setRecords);
  }, []);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesQuery =
        (r.full_name ?? "").toLowerCase().includes(query.toLowerCase()) ||
        (r.license_number ?? "").toLowerCase().includes(query.toLowerCase());

      const status = r.compliance_results?.status ?? "UNKNOWN";
      const matchesStatus =
        statusFilter === "ALL" ? true : status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [records, query, statusFilter]);

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-6">
      <TopNav />

      <div>
        <h1 className="text-3xl font-bold">All Records</h1>
        <p className="text-zinc-600 mt-1">
          Review extracted licensing records and compliance status.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or license number"
          className="border rounded-lg px-3 py-2 w-full md:w-80 bg-white"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-white w-full md:w-56"
        >
          <option value="ALL">All statuses</option>
          <option value="VALID">Valid</option>
          <option value="EXPIRING_SOON">Expiring Soon</option>
          <option value="NON_COMPLIANT">Non-Compliant</option>
          <option value="NEEDS_REVIEW">Needs Review</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">License Type</th>
              <th className="text-left p-3">License Number</th>
              <th className="text-left p-3">Expiry Date</th>
              <th className="text-left p-3">Days to Expiry</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => {
              const status = r.compliance_results?.status ?? "UNKNOWN";
              const days = r.compliance_results?.days_to_expiry;

              return (
                <tr key={r.id} className="border-t">
                  <td className="p-3">
                    <Link
                      href={`/records/${r.id}`}
                      className="text-blue-600 underline"
                    >
                      {r.full_name ?? "Unnamed Record"}
                    </Link>
                  </td>
                  <td className="p-3">{r.license_type ?? "-"}</td>
                  <td className="p-3">{r.license_number ?? "-"}</td>
                  <td className="p-3">{r.expiry_date ?? "-"}</td>
                  <td className="p-3">
                    {typeof days === "number" ? days : "-"}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={status} />
                  </td>
                </tr>
              );
            })}

            {!filtered.length && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-zinc-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    VALID: "bg-green-100 text-green-800",
    EXPIRING_SOON: "bg-yellow-100 text-yellow-800",
    NON_COMPLIANT: "bg-red-100 text-red-800",
    NEEDS_REVIEW: "bg-orange-100 text-orange-800",
    UNKNOWN: "bg-zinc-100 text-zinc-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] ?? styles.UNKNOWN
      }`}
    >
      {status}
    </span>
  );
}