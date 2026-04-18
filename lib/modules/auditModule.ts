import { supabaseAdmin } from "@/lib/supabase";
import { ModuleContext } from "./runModules";

export async function auditModule(ctx: ModuleContext, action: any) {
  await supabaseAdmin.from("events").insert({
    type: "RULE_TRIGGERED",
    entity_id: ctx.recordId,
    payload_json: action,
    created_at: new Date().toISOString(),
  });
}