import Link from "next/link";

export default function TopNav() {
  return (
    <nav className="flex flex-wrap gap-3 mb-6">
      <Link
        href="/"
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
      >
        Dashboard
      </Link>

      <Link
        href="/upload"
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
      >
        Upload
      </Link>

      <Link
        href="/documents"
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
      >
        Documents
      </Link>

      <Link
        href="/records"
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
      >
        Records
      </Link>
    </nav>
  );
}