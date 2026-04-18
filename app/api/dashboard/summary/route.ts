import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("compliance_results")
    .select("status");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const summary = {
    total: data.length,
    valid: data.filter((r) => r.status === "VALID").length,
    expiring: data.filter((r) => r.status === "EXPIRING_SOON").length,
    non_compliant: data.filter((r) => r.status === "NON_COMPLIANT").length,
  };

  return NextResponse.json(summary);
}