import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data: records, error } = await supabaseAdmin
    .from("extracted_records")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const recordIds = records.map((r) => r.id);

  const { data: complianceRows, error: complianceError } = await supabaseAdmin
    .from("compliance_results")
    .select("*")
    .in("extracted_record_id", recordIds);

  if (complianceError) {
    return NextResponse.json(
      { error: complianceError.message },
      { status: 500 }
    );
  }

  const complianceMap = new Map(
    complianceRows.map((c) => [c.extracted_record_id, c])
  );

  const merged = records.map((r) => ({
    ...r,
    compliance_results: complianceMap.get(r.id) ?? null,
  }));

  return NextResponse.json(merged);
}