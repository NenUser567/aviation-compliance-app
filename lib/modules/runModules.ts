import { complianceModule } from "./complianceModule";
import { auditModule } from "./auditModule";

export type ModuleContext = {
  extracted: any;
  actions: any[];
  documentId: string;
  recordId: string;
};

export async function runModules(ctx: ModuleContext) {
  for (const action of ctx.actions) {
    switch (action.type) {
      case "set_status":
        await complianceModule(ctx, action);
        break;

      case "log_event":
        await auditModule(ctx, action);
        break;

      default:
        break;
    }
  }
}