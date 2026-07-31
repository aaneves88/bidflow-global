import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_client",
  title: "Create client",
  description: "Create a new client for the signed-in user in Orca.",
  inputSchema: {
    name: z.string().describe("Client name (required)."),
    company: z.string().optional().describe("Company name."),
    email: z.string().optional().describe("Contact email."),
    phone: z.string().optional().describe("Contact phone."),
    notes: z.string().optional().describe("Free-form notes about the client."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const name = input.name?.trim();
    if (!name) return { content: [{ type: "text", text: "name is required" }], isError: true };

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("clients")
      .insert({
        user_id: ctx.getUserId(),
        name,
        company: input.company?.trim() || null,
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        notes: input.notes?.trim() || null,
      })
      .select("id, name, company, email, phone")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { client: data },
    };
  },
});
