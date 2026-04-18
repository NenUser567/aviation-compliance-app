export const runtime = "nodejs";
import { supabaseAdmin } from "@/lib/supabase";
import { extractLicenseDataFromImage, ALL_FIELDS } from "@/lib/llm";
import { runRules } from "@/lib/rules/runRules";
import { runModules } from "@/lib/modules/runModules";

type ExtractedLicenseData = {
  full_name: string | null;
  license_type: string | null;
  license_number: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  medical_expiry_date: string | null;
  nationality: string | null;
  date_of_birth: string | null;
  issuing_authority: string | null;
  document_type: string | null;
  confidence_notes: string | null;
};

async function fileToBase64(arrayBuffer: ArrayBuffer) {
  return Buffer.from(arrayBuffer).toString("base64");
}

const USE_MOCK_EXTRACTION = process.env.USE_MOCK_EXTRACTION === "true";

function getMockExtraction(): ExtractedLicenseData {
  return {
    full_name: "Test User",
    license_type: "CPL",
    license_number: "12345",
    issue_date: "2024-01-01",
    expiry_date: "2025-01-01",
    medical_expiry_date: "2024-12-01",
    nationality: "Ghanaian",
    date_of_birth: "1990-01-01",
    issuing_authority: "GCAA",
    document_type: "Pilot License",
    confidence_notes: "Mock data",
  };
}

export async function processDocument(documentId: string) {
  const now = new Date().toISOString();

  const { data: doc, error: docError } = await supabaseAdmin
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (docError || !doc) {
    throw new Error(docError?.message || "Document not found");
  }

  await supabaseAdmin
    .from("documents")
    .update({
      processing_status: "processing",
      error_message: null,
      updated_at: now,
    })
    .eq("id", documentId);

  try {
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("documents")
      .download(doc.storage_path);

    if (downloadError || !fileData) {
      throw new Error(downloadError?.message || "Failed to download file");
    }

    const mimeType = doc.mime_type;
    if (!mimeType?.startsWith("image/")) {
      throw new Error(`Only image files are supported for now. Got: ${mimeType}`);
    }

    // ✅ LOAD EXTRACTION PROFILE
    let fields: string[] = [];

    if (doc.extraction_profile_id) {
      const { data: profile } = await supabaseAdmin
        .from("extraction_profiles")
        .select("fields")
        .eq("id", doc.extraction_profile_id)
        .single();

      fields = profile?.fields || [];
    }

    // ✅ fallback to ALL fields
    if (!fields.length) {
      fields = [...ALL_FIELDS];
    }

    let extracted: ExtractedLicenseData;

    if (USE_MOCK_EXTRACTION) {
      extracted = getMockExtraction();
    } else {
      const arrayBuffer = await fileData.arrayBuffer();
      const imageBase64 = await fileToBase64(arrayBuffer);

      extracted = await extractLicenseDataFromImage(
        imageBase64,
        mimeType,
        fields
      );
    }

    const extractedPayload = {
      document_id: documentId,
      ...extracted,
      extraction_status: "extracted",
      updated_at: new Date().toISOString(),
    };

    const { data: record, error: recordError } = await supabaseAdmin
      .from("extracted_records")
      .upsert(extractedPayload, {
        onConflict: "document_id",
      })
      .select("id, document_id")
      .single();

    if (recordError || !record) {
      throw new Error(recordError?.message || "Failed to save extracted record");
    }

    // ✅ RULE ENGINE
    const actions = await runRules(extracted);

    // ✅ MODULES
    await runModules({
      extracted,
      actions,
      documentId,
      recordId: record.id,
    });

    await supabaseAdmin
      .from("documents")
      .update({
        processing_status: "processed",
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    return record;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown processing error";

    await supabaseAdmin
      .from("documents")
      .update({
        processing_status: "failed",
        error_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    throw err;
  }
}