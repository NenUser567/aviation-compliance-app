import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    let profileId = formData.get("profile_id");

if (
  !profileId ||
  profileId === "undefined" ||
  profileId === "null"
) {
  profileId = null;
} // ✅ NEW

    if (!files.length) {
      return NextResponse.json({ error: "No files uploaded." }, { status: 400 });
    }

    const { data: batch, error: batchError } = await supabaseAdmin
      .from("upload_batches")
      .insert({
        uploaded_by: "local-user",
        total_files: files.length,
      })
      .select()
      .single();

    if (batchError) throw batchError;

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const storagePath = `${batch.id}/${Date.now()}-${file.name}`;

      const { error: storageError } = await supabaseAdmin.storage
        .from("documents")
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (storageError) throw storageError;

      const { error: insertError } = await supabaseAdmin.from("documents").insert({
        upload_batch_id: batch.id,
        original_filename: file.name,
        mime_type: file.type,
        storage_path: storagePath,
        processing_status: "uploaded",
        extraction_profile_id: profileId || null, // ✅ NEW
      });

      if (insertError) throw insertError;
    }

    return NextResponse.json({
      success: true,
      batchId: batch.id,
      count: files.length,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 }
    );
  }
}