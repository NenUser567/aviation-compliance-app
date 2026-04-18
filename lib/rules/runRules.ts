import { supabaseAdmin } from "@/lib/supabase";
import { evaluateCondition } from "./evaluateCondition";
import type { Rule, Action } from "./types";

export async function runRules(extracted: any): Promise<Action[]> {
  const { data: rules, error } = await supabaseAdmin
    .from("rules")
    .select("*")
    .eq("is_active", true);

  if (error) throw new Error("Failed to load rules");

  const results: Action[] = [];

  for (const rule of rules as Rule[]) {
    if (evaluateCondition(rule.condition_json, extracted)) {
      results.push(...rule.actions_json);
    }
  }

  return results;
}