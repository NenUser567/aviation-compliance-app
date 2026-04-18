import { supabaseAdmin } from "@/lib/supabase";

type Row = {
  id: string;
  expiry_date: string | null;
  medical_expiry_date: string | null;
  compliance_results:
    | {
        status: string | null;
        days_to_expiry: number | null;
      }
    | null;
};

function daysBetween(a: Date, b: Date) {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function toDate(s: string | null) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("extracted_records")
    .select(
      `
      id,
      expiry_date,
      medical_expiry_date,
      compliance_results ( status, days_to_expiry )
    `
    );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const rows: Row[] = (data || []).map((r: any) => ({
  id: r.id,
  expiry_date: r.expiry_date,
  medical_expiry_date: r.medical_expiry_date,
  compliance_results:
    Array.isArray(r.compliance_results) && r.compliance_results.length > 0
      ? r.compliance_results[0]
      : null,
}));

  const now = new Date();

  let total = rows.length;
  let valid = 0;
  let expiringSoon = 0;
  let nonCompliant = 0;

  const issues: { label: string; count: number }[] = [
    { label: "Expired licenses", count: 0 },
    { label: "Expiring ≤ 30 days", count: 0 },
    { label: "Expired medicals", count: 0 },
  ];

  for (const r of rows) {
    const status = r.compliance_results?.status ?? "UNKNOWN";

    if (status === "VALID") valid++;
    if (status === "EXPIRING_SOON") expiringSoon++;
    if (status === "NON_COMPLIANT") nonCompliant++;

    // derive issues (even if status missing)
    const exp = toDate(r.expiry_date);
    if (exp) {
      const d = daysBetween(exp, now);
      if (d < 0) issues[0].count++;
      else if (d <= 30) issues[1].count++;
    }

    const med = toDate(r.medical_expiry_date);
    if (med && med < now) {
      issues[2].count++;
    }
  }

  const criticalIssues = issues.reduce((acc, i) => acc + i.count, 0);

  return Response.json({
    totals: { total, valid, expiringSoon, nonCompliant },
    issues,
    criticalIssues,
  });
}