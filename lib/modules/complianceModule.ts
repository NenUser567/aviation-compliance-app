import { supabaseAdmin } from "@/lib/supabase";
import { ModuleContext } from "./runModules";

export async function complianceModule(ctx: ModuleContext, action: any) {
  await supabaseAdmin
    .from("compliance_results")
    .upsert(
      {
        extracted_record_id: ctx.recordId,
        status: action.value,
        last_evaluated_at: new Date().toISOString(),
      },
      { onConflict: "extracted_record_id" }
    );
}