import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { normalizePixKey } from '@/lib/pix';

export type TaxIdType = 'cpf' | 'cnpj';

export interface TaxIdState {
  taxId: string | null;
  taxIdType: TaxIdType | null;
}

/** Documento fiscal (CPF/CNPJ) do perfil — trava anti-abuso do plano grátis. */
export function useTaxId() {
  const { user } = useAuth();

  return useQuery<TaxIdState>({
    queryKey: ['tax-id', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('tax_id, tax_id_type')
        .eq('id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return {
        taxId: (data as any)?.tax_id ?? null,
        taxIdType: ((data as any)?.tax_id_type as TaxIdType) ?? null,
      };
    },
  });
}

export class DuplicateTaxIdError extends Error {}

export function useSaveTaxId() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taxId, taxIdType }: { taxId: string; taxIdType: TaxIdType }) => {
      const normalized = normalizePixKey(taxId, taxIdType);
      const { error } = await supabase
        .from('profiles')
        .update({ tax_id: normalized, tax_id_type: taxIdType } as any)
        .eq('id', user!.id);
      if (error) {
        if ((error as any).code === '23505') throw new DuplicateTaxIdError(error.message);
        throw error;
      }
      return { taxId: normalized, taxIdType };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-id', user?.id] });
    },
  });
}
