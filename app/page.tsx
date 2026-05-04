"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const issueMap = useMemo(() => {
    const map: Record<string, number> = {};
    data?.issues?.forEach((i) => {
      map[i.label.toLowerCase()] = i.count;
    });
    return map;
  }, [data]);

  const expiredLicenses =
    issueMap["expired licenses"] ?? issueMap["expired licence"] ?? 0;

  const expiringSoon =
    issueMap["expiring < 30 days"] ??
    issueMap["expiring soon"] ??
    data?.totals.expiringSoon ??
    0;

  const expiredMedicals =
    issueMap["expired medicals"] ?? issueMap["expired medical"] ?? 0;

  const totalIssues = data?.criticalIssues ?? 0;

  const systemHealth =
    totalIssues > 0
      ? "Immediate attention required"
      : "No critical issues detected";

  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <TopNav />

        {/* Hero */}
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Licensing & Document Risk Monitor
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-950">
                Compliance Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-zinc-600">
                Instantly see expired licenses, upcoming expiries, medical
                issues, and records that need human review.
              </p>
            </div>

            <div
              className={`rounded-2xl px-5 py-4 text-center ${
                totalIssues > 0
                  ? "bg-red-50 border border-red-200"
                  : "bg-emerald-50 border border-emerald-200"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  totalIssues > 0 ? "text-red-700" : "text-emerald-700"
                }`}
              >
                System Status
              </p>
              <p
                className={`mt-1 text-2xl font-black ${
                  totalIssues > 0 ? "text-red-900" : "text-emerald-900"
                }`}
              >
                {loading ? "Checking..." : systemHealth}
              </p>
            </div>
          </div>
        </section>

        {/* Threat Layer */}
        <section
          className={`rounded-3xl border p-6 shadow-sm ${
            totalIssues > 0
              ? "border-red-200 bg-red-50"
              : "border-emerald-200 bg-emerald-50"
          }`}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2
                className={`text-2xl font-black ${
                  totalIssues > 0 ? "text-red-950" : "text-emerald-950"
                }`}
              >
                {totalIssues > 0
                  ? "Attention Needed"
                  : "No Immediate Risk Found"}
              </h2>

              <p
                className={`mt-1 text-sm ${
                  totalIssues > 0 ? "text-red-800" : "text-emerald-800"
                }`}
              >
                This summary highlights records that may require follow-up,
                verification, or corrective action.
              </p>
            </div>

            <Link
              href="/records"
              className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
                totalIssues > 0
                  ? "bg-red-700 text-white hover:bg-red-800"
                  : "bg-emerald-700 text-white hover:bg-emerald-800"
              }`}
            >
              Review Records
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <RiskCard
              title="Expired Licenses"
              value={loading ? "—" : expiredLicenses}
              tone={expiredLicenses > 0 ? "danger" : "safe"}
              desc="Licenses already past expiry date"
            />

            <RiskCard
              title="Expiring Soon"
              value={loading ? "—" : expiringSoon}
              tone={expiringSoon > 0 ? "warning" : "safe"}
              desc="Licenses approaching expiry"
            />

            <RiskCard
              title="Expired Medicals"
              value={loading ? "—" : expiredMedicals}
              tone={expiredMedicals > 0 ? "danger" : "safe"}
              desc="Medical validity may require attention"
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid gap-4 md:grid-cols-3">
          <NavCard
            href="/upload"
            title="Upload Documents"
            desc="Add licenses or supporting documents for extraction"
          />

          <NavCard
            href="/documents"
            title="Processing Queue"
            desc="Check uploaded files and extraction status"
          />

          <NavCard
            href="/records"
            title="Compliance Records"
            desc="Review extracted data, risks, and actions"
          />
        </section>

        {/* Operational Overview */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-950">
              Operational Overview
            </h2>
            <p className="text-sm text-zinc-600">
              A quick count of all records currently being monitored.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Stat title="Total Records" value={data?.totals.total ?? "—"} />
            <Stat
              title="Valid"
              value={data?.totals.valid ?? "—"}
              tone="safe"
            />
            <Stat
              title="Expiring Soon"
              value={data?.totals.expiringSoon ?? "—"}
              tone="warning"
            />
            <Stat
              title="Non-Compliant"
              value={data?.totals.nonCompliant ?? "—"}
              tone="danger"
            />
          </div>
        </section>

        {/* Trust Layer */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-950">
            Why this dashboard can be trusted
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <TrustCard
              title="Human verification"
              desc="AI-extracted fields should be reviewed and corrected before final use."
            />

            <TrustCard
              title="Document evidence"
              desc="Every record should remain linked to the original uploaded document."
            />

            <TrustCard
              title="Risk visibility"
              desc="The system highlights what needs attention instead of hiding issues in spreadsheets."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function NavCard({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="text-lg font-bold text-zinc-950 group-hover:text-blue-700">
        {title}
      </div>
      <p className="mt-1 text-sm text-zinc-600">{desc}</p>
    </Link>
  );
}

function RiskCard({
  title,
  value,
  desc,
  tone,
}: {
  title: string;
  value: number | string;
  desc: string;
  tone: "danger" | "warning" | "safe";
}) {
  const styles = {
    danger: "border-red-300 bg-white text-red-900",
    warning: "border-amber-300 bg-white text-amber-900",
    safe: "border-emerald-300 bg-white text-emerald-900",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${styles[tone]}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-5xl font-black">{value}</p>
      <p className="mt-2 text-sm opacity-80">{desc}</p>
    </div>
  );
}

function Stat({
  title,
  value,
  tone = "neutral",
}: {
  title: string;
  value: number | string;
  tone?: "neutral" | "safe" | "warning" | "danger";
}) {
  const textColor = {
    neutral: "text-zinc-950",
    safe: "text-emerald-700",
    warning: "text-amber-700",
    danger: "text-red-700",
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      <p className={`mt-2 text-4xl font-black ${textColor[tone]}`}>
        {value}
      </p>
    </div>
  );
}

function TrustCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <h3 className="font-bold text-zinc-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{desc}</p>
    </div>
  );
}