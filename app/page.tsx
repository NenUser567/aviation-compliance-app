"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/top-nav";

type Summary = {
  totals: {
    total: number;
    valid: number;
    expiringSoon: number;
    nonCompliant: number;
  };
  issues: { label: string; count: number }[];
  criticalIssues: number;
};

export default function Home() {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
        <TopNav />

        <div>
          <h1 className="text-4xl font-bold text-zinc-900">
            Compliance Dashboard
          </h1>
          <p className="mt-2 text-zinc-600">
            See current risks, understand why, and take action.
          </p>
        </div>

        {/* Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <NavCard href="/upload" title="Upload Documents" desc="Add files for analysis" />
          <NavCard href="/documents" title="View Documents" desc="Track processing status" />
          <NavCard href="/records" title="View Records" desc="Review compliance + actions" />
        </div>

        {/* Risk Summary */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Risk Summary</h2>
            <span
              className={`text-sm font-medium px-2 py-1 rounded-full ${
                (data?.criticalIssues ?? 0) > 0
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {data ? `${data.criticalIssues} issue(s)` : "—"}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {data?.issues.map((i) => (
              <div key={i.label} className="border rounded-xl p-4 bg-zinc-50">
                <p className="text-sm text-zinc-500">{i.label}</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">
                  {i.count}
                </p>
              </div>
            ))}
            {!data && (
              <div className="col-span-3 text-sm text-zinc-500">
                Loading…
              </div>
            )}
          </div>
        </div>

        {/* Totals */}
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">
            Overview
          </h2>
          <div className="grid gap-4 md:grid-cols-4">
            <Stat title="Total" value={data?.totals.total ?? "-"} />
            <Stat title="Valid" value={data?.totals.valid ?? "-"} />
            <Stat title="Expiring Soon" value={data?.totals.expiringSoon ?? "-"} />
            <Stat title="Non-Compliant" value={data?.totals.nonCompliant ?? "-"} />
          </div>
        </div>
      </div>
    </main>
  );
}

function NavCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition">
      <div className="text-lg font-semibold text-zinc-900">{title}</div>
      <p className="text-sm text-zinc-600 mt-1">{desc}</p>
    </Link>
  );
}

function Stat({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-zinc-900">{value}</p>
    </div>
  );
}