import { useCallback, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useTaxId } from '@/hooks/useTaxId';
import { TaxIdDialog } from '@/components/TaxIdDialog';

/**
 * Regra anti-abuso: no plano grátis, o CPF/CNPJ só é exigido quando a pessoa
 * tenta COMPARTILHAR uma proposta (copiar link, WhatsApp, e-mail) — nunca para salvar.
 */
export function shouldRequireTaxId(s: {
  isAdmin: boolean;
  plansReady: boolean;
  isFree: boolean;
  taxIdLoading: boolean;
  taxId: string | null | undefined;
}) {
  return !s.isAdmin && s.plansReady && s.isFree && !s.taxIdLoading && !s.taxId;
}

/** Envolve uma ação de compartilhamento: pede o documento antes, se necessário. */
export function useTaxIdGate() {
  const { isAdmin } = useAuth();
  const limits = useSubscription();
  const { data, isLoading } = useTaxId();
  const [open, setOpen] = useState(false);
  const pending = useRef<(() => void) | null>(null);

  const needsTaxId = shouldRequireTaxId({
    isAdmin: !!isAdmin,
    plansReady: limits.isReady,
    isFree: limits.isFree,
    taxIdLoading: isLoading,
    taxId: data?.taxId,
  });

  const guard = useCallback(
    (action: () => void) => {
      if (!needsTaxId) return action();
      pending.current = action;
      setOpen(true);
    },
    [needsTaxId],
  );

  const dialog = (
    <TaxIdDialog
      open={open}
      onOpenChange={(o) => { setOpen(o); if (!o && !pending.current) return; }}
      onConfirmed={() => {
        const action = pending.current;
        pending.current = null;
        action?.();
      }}
    />
  );

  return { guard, dialog, needsTaxId };
}
