import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("extracted_records")
    .select(`
      id,
      full_name,
      license_type,
      license_number,
      expiry_date,
      extraction_status,
      compliance_results (
        status,
        days_to_expiry
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}