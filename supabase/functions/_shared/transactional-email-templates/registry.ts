// Registry of all transactional (app) email templates.
// To add a new template:
//   1. Create the .tsx file in this folder
//   2. Import its `template` export here
//   3. Add it to TEMPLATES below under a kebab-case key

import { template as proposalSent } from './proposal-sent.tsx'
import { template as proposalViewed } from './proposal-viewed.tsx'
import { template as proposalAccepted } from './proposal-accepted.tsx'
import { template as proposalSigned } from './proposal-signed.tsx'
import { template as proposalRejected } from './proposal-rejected.tsx'
import { template as proposalClientCopy } from './proposal-client-copy.tsx'
import { template as welcome } from './welcome.tsx'
import { template as supportReport } from './support-report.tsx'
import { template as supportReply } from './support-reply.tsx'

export interface TemplateEntry {
  // deno-lint-ignore no-explicit-any
  component: any
  subject: string | ((data: Record<string, unknown>) => string)
  displayName?: string
  previewData?: Record<string, unknown>
  to?: (data: Record<string, unknown>) => string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'welcome': welcome,
  'proposal-sent': proposalSent,
  'proposal-viewed': proposalViewed,
  'proposal-accepted': proposalAccepted,
  'proposal-signed': proposalSigned,
  'proposal-rejected': proposalRejected,
  'proposal-client-copy': proposalClientCopy,
  'support-report': supportReport,
  'support-reply': supportReply,
}
