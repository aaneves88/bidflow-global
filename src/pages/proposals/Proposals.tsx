import { FileText } from 'lucide-react';

export default function Proposals() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Proposal management coming in Phase 2</p>
      </div>
    </div>
  );
}
