import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <Settings className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Settings coming in Phase 3</p>
      </div>
    </div>
  );
}
