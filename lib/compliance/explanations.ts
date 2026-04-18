export function explainRecord(input: {
  expiry_date: string | null;
  medical_expiry_date: string | null;
  status?: string | null;
}) {
  const now = new Date();

  const toDate = (s: string | null) => {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  const daysBetween = (a: Date, b: Date) =>
    Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));

  const exp = toDate(input.expiry_date);
  const med = toDate(input.medical_expiry_date);

  let reason = "No issues detected";
  let action = "No action required";

  if (exp) {
    const d = daysBetween(exp, now);
    if (d < 0) {
      reason = `License expired ${Math.abs(d)} day(s) ago`;
      action = "Renew license immediately";
      return { reason, action, severity: "HIGH" as const };
    }
    if (d <= 30) {
      reason = `License expiring in ${d} day(s)`;
      action = "Schedule renewal before expiry";
      return { reason, action, severity: "MEDIUM" as const };
    }
  }

  if (med && med < now) {
    reason = "Medical certificate expired";
    action = "Schedule medical examination";
    return { reason, action, severity: "HIGH" as const };
  }

  // fallback from status
  if (input.status === "NON_COMPLIANT") {
    reason = "Non-compliant (unspecified)";
    action = "Review record";
    return { reason, action, severity: "HIGH" as const };
  }

  if (input.status === "EXPIRING_SOON") {
    reason = "Expiring soon";
    action = "Prepare renewal";
    return { reason, action, severity: "MEDIUM" as const };
  }

  return { reason, action, severity: "LOW" as const };
}