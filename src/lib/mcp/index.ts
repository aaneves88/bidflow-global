import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listClientsTool from "./tools/list-clients";
import createClientTool from "./tools/create-client";
import listProposalsTool from "./tools/list-proposals";
import getProposalTool from "./tools/get-proposal";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "orca",
  title: "Orca",
  version: "0.1.0",
  instructions:
    "Tools for Orca, a proposal and quote CRM. Use them to read and create the signed-in user's clients and proposals.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listClientsTool, createClientTool, listProposalsTool, getProposalTool],
});
