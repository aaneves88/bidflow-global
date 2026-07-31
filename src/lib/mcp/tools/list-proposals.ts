import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_proposals",
  title: "List proposals",
  description: "List the signed-in user's proposals in Orca, newest first, optionally filtered by client.",
  inputSchema: {
    client_id: z.string().optional().describe("Only return proposals for this client id."),
    limit: z.number().int().optional().describe("Maximum number of proposals to return (default 25)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ client_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("proposals")
      .select("id, title, public_code, total_amount, currency, status_id, valid_until, client_id, created_at")
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit ?? 25, 1), 100));
    if (client_id) query = query.eq("client_id", client_id);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { proposals: data ?? [] },
    };
  },
});
