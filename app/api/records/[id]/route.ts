import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { evaluateCompliance } from "@/lib/rules";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { data, error } = await supabaseAdmin
    .from("extracted_records")
    .select(
      `
      *,
      documents (
        id,
        original_filename,
        storage_path,
        mime_type
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Record not found" },
      { status: 500 }
    );
  }

  const storagePath = data.documents?.storage_path ?? null;

  let document_url: string | null = null;

  if (storagePath) {
  const { data: signedUrlData, error: signedUrlError } =
    await supabaseAdmin.storage
      .from("documents")
      .createSignedUrl(storagePath, 60 * 60);

  if (!signedUrlError) {
    document_url = signedUrlData.signedUrl;
  }
}

  return NextResponse.json({
    ...data,
    document_url,
    original_filename: data.documents?.original_filename ?? null,
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();

  const { data: updated, error } = await supabaseAdmin
    .from("extracted_records")
    .update({
      full_name: body.full_name,
      license_type: body.license_type,
      license_number: body.license_number,
      issue_date: body.issue_date,
      expiry_date: body.expiry_date,
      medical_expiry_date: body.medical_expiry_date,
      nationality: body.nationality,
      date_of_birth: body.date_of_birth,
      issuing_authority: body.issuing_authority,
      document_type: body.document_type,
      confidence_notes: body.confidence_notes,
      extraction_status: "reviewed",
      reviewed_at: new Date().toISOString(),
      reviewed_by: "local-reviewer",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !updated) {
    return NextResponse.json(
      { error: error?.message || "Failed to update record" },
      { status: 500 }
    );
  }

  const compliance = evaluateCompliance({
    full_name: updated.full_name,
    license_type: updated.license_type,
    license_number: updated.license_number,
    issue_date: updated.issue_date,
    expiry_date: updated.expiry_date,
    medical_expiry_date: updated.medical_expiry_date,
    nationality: updated.nationality,
    date_of_birth: updated.date_of_birth,
    issuing_authority: updated.issuing_authority,
    document_type: updated.document_type,
    confidence_notes: updated.confidence_notes,
  });

  const { error: complianceError } = await supabaseAdmin
    .from("compliance_results")
    .upsert(
      {
        extracted_record_id: updated.id,
        status: compliance.status,
        reasons: compliance.reasons,
        days_to_expiry: compliance.days_to_expiry,
        last_evaluated_at: new Date().toISOString(),
      },
      { onConflict: "extracted_record_id" }
    );

  if (complianceError) {
    return NextResponse.json(
      { error: complianceError.message },
      { status: 500 }
    );
  }

  return NextResponse.json(updated);
}