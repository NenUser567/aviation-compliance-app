import { differenceInCalendarDays } from "date-fns";
import { ExtractionSchema } from "./validators";

export function evaluateCompliance(record: ExtractionSchema) {
  const reasons: string[] = [];
  let status = "VALID";
  let days_to_expiry: number | null = null;

  const today = new Date();

  if (!record.full_name || !record.license_number) {
    reasons.push("Missing critical identification fields");
    status = "NEEDS_REVIEW";
  }

  if (record.issue_date && record.expiry_date) {
    const issue = new Date(record.issue_date);
    const expiry = new Date(record.expiry_date);

    if (issue > expiry) {
      reasons.push("Issue date is after expiry date");
      status = "NEEDS_REVIEW";
    }
  }

  if (record.expiry_date) {
    const expiry = new Date(record.expiry_date);
    days_to_expiry = differenceInCalendarDays(expiry, today);

    if (days_to_expiry < 0) {
      reasons.push("License expired");
      status = "NON_COMPLIANT";
    } else if (days_to_expiry <= 30 && status !== "NON_COMPLIANT") {
      reasons.push("License expiring within 30 days");
      status = "EXPIRING_SOON";
    }
  }

  if (record.medical_expiry_date) {
    const medicalExpiry = new Date(record.medical_expiry_date);
    const medicalDays = differenceInCalendarDays(medicalExpiry, today);

    if (medicalDays < 0) {
      reasons.push("Medical certificate expired");
      status = "NON_COMPLIANT";
    }
  }

  return {
    status,
    reasons,
    days_to_expiry,
  };
}