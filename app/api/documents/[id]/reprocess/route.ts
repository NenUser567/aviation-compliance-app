import { NextRequest, NextResponse } from "next/server";
import { processDocument } from "@/workers/process-document";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await processDocument(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reprocess error:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Reprocess failed" },
      { status: 500 }
    );
  }
}