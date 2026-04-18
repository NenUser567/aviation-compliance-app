export const runtime = "nodejs";
import { supabaseAdmin } from "@/lib/supabase";
import { processDocument } from "@/workers/process-document";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> } // 👈 params is a Promise
) {
  // ✅ unwrap params properly
  const { id: batchId } = await context.params;

  const { data: docs, error } = await supabaseAdmin
    .from("documents")
    .select("id")
    .eq("upload_batch_id", batchId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!docs?.length) {
    return Response.json({ processed: 0, failed: 0, total: 0 });
  }

  // ✅ PARALLEL PROCESSING
  const results = await Promise.allSettled(
    docs.map((doc) => processDocument(doc.id))
  );

  const processed = results.filter(
    (r) => r.status === "fulfilled"
  ).length;

  const failed = results.filter(
    (r) => r.status === "rejected"
  ).length;

  return Response.json({
    processed,
    failed,
    total: docs.length,
  });
}