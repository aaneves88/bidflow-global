import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  DndContext, DragOverlay, PointerSensor, TouchSensor, KeyboardSensor,
  useSensor, useSensors, useDraggable, useDroppable,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import { CalendarClock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useProposalStatuses, useUpdateProposalStatus, type Proposal } from '@/hooks/useProposals';
import { formatCurrency, formatDate } from '@/lib/format';
import { ProposalStatusChangePopup, findSentStatusId, type SendableProposal } from '@/components/proposals/ProposalStatusChangePopup';
import { cn } from '@/lib/utils';

type Status = { id: string; name: string; color: string; position: number; is_final: boolean | null };

function ProposalCard({ proposal, onOpen }: { proposal: Proposal; onOpen: (id: string) => void }) {
  const { t } = useTranslation('proposals');
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: proposal.id });
  const expiring = proposal.valid_until && new Date(proposal.valid_until).getTime() < Date.now() + 7 * 86400000;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(proposal.id)}
      className={cn(
        'cursor-grab touch-none rounded-md border bg-card p-3 text-left shadow-sm transition hover:border-primary/50',
        isDragging && 'opacity-40',
      )}
    >
      <p className="font-medium leading-tight line-clamp-2">{proposal.title}</p>
      {proposal.clients?.name && (
        <p className="mt-1 text-xs text-muted-foreground truncate">{proposal.clients.name}</p>
      )}
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">
          {formatCurrency(Number(proposal.total_amount), proposal.currency)}
        </span>
        <span className="text-xs text-muted-foreground">{formatDate(proposal.created_at)}</span>
      </div>
      {expiring && (
        <p className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
          <CalendarClock className="h-3 w-3" />
          {t('view.validUntil', { date: formatDate(proposal.valid_until!) })}
        </p>
      )}
    </div>
  );
}

function Column({
  status, proposals, onOpen,
}: { status: Status; proposals: Proposal[]; onOpen: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id });
  const sum = proposals.reduce((s, p) => s + Number(p.total_amount), 0);
  const currency = proposals[0]?.currency || 'BRL';

  return (
    <div className="w-72 shrink-0">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: status.color }} />
        <span className="font-medium">{status.name}</span>
        <Badge variant="secondary" className="ml-auto">{proposals.length}</Badge>
      </div>
      <p className="mb-2 text-xs text-muted-foreground">{formatCurrency(sum, currency)}</p>
      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-[120px] flex-col gap-2 rounded-lg border border-dashed p-2 transition-colors',
          isOver && 'border-primary bg-primary/5',
        )}
      >
        {proposals.map((p) => (
          <ProposalCard key={p.id} proposal={p} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

export default function ProposalsKanban({ proposals }: { proposals: Proposal[] }) {
  const navigate = useNavigate();
  const { data: statuses } = useProposalStatuses();
  const updateStatus = useUpdateProposalStatus();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sendTarget, setSendTarget] = useState<SendableProposal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const cols = (statuses ?? []) as unknown as Status[];

  const sentStatusId = useMemo(() => findSentStatusId(cols), [cols]);

  const byStatus = useMemo(() => {
    const map = new Map<string, Proposal[]>();
    cols.forEach((s) => map.set(s.id, []));
    proposals.forEach((p) => {
      if (p.status_id && map.has(p.status_id)) map.get(p.status_id)!.push(p);
    });
    return map;
  }, [cols, proposals]);

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const proposalId = String(e.active.id);
    const targetStatus = e.over ? String(e.over.id) : null;
    if (!targetStatus) return;
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal || proposal.status_id === targetStatus) return;

    updateStatus.mutate({ id: proposalId, status_id: targetStatus });

    if (targetStatus === sentStatusId) {
      setSendTarget(proposal as SendableProposal);
    }
  };

  const active = proposals.find((p) => p.id === activeId) || null;

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {cols.map((s) => (
            <Column
              key={s.id}
              status={s}
              proposals={byStatus.get(s.id) ?? []}
              onOpen={(id) => navigate(`/proposals/${id}`)}
            />
          ))}
        </div>
        <DragOverlay>
          {active ? (
            <div className="w-72 rounded-md border bg-card p-3 shadow-lg">
              <p className="font-medium leading-tight line-clamp-2">{active.title}</p>
              <p className="mt-2 text-sm font-semibold">
                {formatCurrency(Number(active.total_amount), active.currency)}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <ProposalStatusChangePopup
        open={!!sendTarget}
        onOpenChange={(o) => !o && setSendTarget(null)}
        proposal={sendTarget}
      />
    </>
  );
}
