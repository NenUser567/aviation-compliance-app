import Link from "next/link";
import TopNav from "@/components/top-nav";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
        
        <TopNav />

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-zinc-900">
            Compliance Dashboard
          </h1>
          <p className="mt-2 text-zinc-600 max-w-2xl">
            Upload licensing documents, extract structured data, and monitor compliance status in one place.
          </p>
        </div>

        {/* Primary Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          
          <Link
            href="/upload"
            className="group rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="text-lg font-semibold text-zinc-900">
              Upload Documents
            </div>
            <p className="text-sm text-zinc-600 mt-1">
              Add new files for processing
            </p>
          </Link>

          <Link
            href="/documents"
            className="group rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="text-lg font-semibold text-zinc-900">
              View Documents
            </div>
            <p className="text-sm text-zinc-600 mt-1">
              Track uploaded files and status
            </p>
          </Link>

          <Link
            href="/records"
            className="group rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="text-lg font-semibold text-zinc-900">
              View Records
            </div>
            <p className="text-sm text-zinc-600 mt-1">
              Review extracted data and compliance
            </p>
          </Link>

        </div>

        {/* Stats Section */}
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">
            Overview
          </h2>

          <div className="grid gap-4 md:grid-cols-4">
            
            <StatCard title="Total Records" value="-" />
            <StatCard title="Valid" value="-" />
            <StatCard title="Expiring Soon" value="-" />
            <StatCard title="Non-Compliant" value="-" />

          </div>
        </div>

        {/* Empty State / Guidance */}
        <div className="rounded-2xl border bg-white p-6 text-center">
          <h3 className="text-lg font-semibold text-zinc-900">
            No data yet
          </h3>
          <p className="text-zinc-600 mt-2">
            Upload documents to begin extracting and analyzing compliance data.
          </p>

          <Link
            href="/upload"
            className="inline-block mt-4 rounded-lg bg-black text-white px-4 py-2 text-sm hover:bg-zinc-800 transition"
          >
            Upload your first document
          </Link>
        </div>

      </div>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-zinc-900">{value}</p>
    </div>
  );
}