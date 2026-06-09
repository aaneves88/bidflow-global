import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Pencil, X, Eye } from 'lucide-react';
import { useAppSettings } from '@/hooks/useAppSettings';
import { toast } from '@/hooks/use-toast';

const DEFAULT_ROADMAP = `# Orca — Roadmap

## Fase 1 — Fundação
- ✅ Autenticação (e-mail/senha)
- ✅ Primeiro usuário vira admin
- ✅ Perfis de usuário
- ✅ Papéis e permissões
- ✅ Modelo de planos
- ✅ Configurações centralizadas

## Fase 2 — MVP Core
- ✅ Dashboard
- ✅ CRUD de clientes
- ✅ CRUD de propostas
- ✅ Status de propostas
- ✅ Página pública da proposta
- ✅ Aceitação pelo cliente
- ✅ Mini pipeline de vendas
- ✅ KPIs principais

## Fase 3 — Admin & Configurações
- ✅ Dashboard administrativo
- ✅ Gestão de usuários
- ✅ Concessão manual de plano
- ✅ Gestão de planos
- ✅ Configurações globais
- ✅ Configurações Stripe
- ✅ Configurações de marca
- ✅ Gestão de status de propostas

## Fase 4 — Monetização
- ✅ Primeira proposta grátis
- ✅ Feature flags por plano (PDF, templates, branding)
- ✅ Modal de upgrade
- ✅ Indicador de uso no Dashboard e Propostas
- 🔄 Stripe checkout fim-a-fim
- 📋 Customer portal Stripe
- 📋 Enforcement de limites por funcionalidade

## Fase 5 — Pronto para o comercial
- ✅ Landing page
- ✅ Localização pt-BR
- ✅ Página de planos
- ✅ Onboarding simples
- ✅ Personalização visual (cores + logo)
- ✅ Valor fechado por proposta
- 🔄 Recuperação de senha
- 📋 E-mails transacionais
- 📋 Páginas legais (Privacidade, Termos)

## Fase 6 — Crescimento
- 📋 Filtros e busca avançada
- 📋 Duplicar proposta
- 📋 Templates de proposta
- 📋 Notificação de proposta vista
- 📋 Motivos de perda
- 📋 Métricas por período

## Fase 7 — Escala
- 📋 Times multi-usuário
- 📋 Multi-workspace
- 📋 Assinatura digital
- 📋 Automação de follow-up
- 📋 IA para sugestão de propostas
- 📋 White-label
`;

interface ParsedSection {
  title: string;
  items: { status: 'done' | 'progress' | 'planned' | 'none'; text: string }[];
}

function parseRoadmap(md: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;
  for (const raw of md.split('\n')) {
    const line = raw.trimEnd();
    if (line.startsWith('## ')) {
      if (current) sections.push(current);
      current = { title: line.slice(3).trim(), items: [] };
    } else if (line.startsWith('- ') && current) {
      const text = line.slice(2).trim();
      let status: ParsedSection['items'][number]['status'] = 'none';
      let cleaned = text;
      if (text.startsWith('✅')) { status = 'done'; cleaned = text.slice(1).trim(); }
      else if (text.startsWith('🔄')) { status = 'progress'; cleaned = text.slice(1).trim(); }
      else if (text.startsWith('📋')) { status = 'planned'; cleaned = text.slice(1).trim(); }
      current.items.push({ status, text: cleaned });
    }
  }
  if (current) sections.push(current);
  return sections;
}

const statusStyles: Record<string, string> = {
  done: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  progress: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  planned: 'bg-muted text-muted-foreground border-border',
  none: 'bg-muted text-muted-foreground border-border',
};

export default function AdminRoadmap() {
  const { t } = useTranslation('admin');
  const { getSetting, upsert, isLoading } = useAppSettings('general');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const current = (getSetting('roadmap_markdown') as string | undefined) ?? DEFAULT_ROADMAP;

  useEffect(() => {
    setDraft(current);
  }, [current]);

  const sections = useMemo(() => parseRoadmap(current), [current]);

  const statusLabel = (s: string) =>
    s === 'done' ? t('roadmap.status.done')
    : s === 'progress' ? t('roadmap.status.progress')
    : s === 'planned' ? t('roadmap.status.planned')
    : '';

  const save = async () => {
    try {
      await upsert.mutateAsync({ key: 'roadmap_markdown', value: draft, category: 'general' });
      toast({ title: t('roadmap.saved') });
      setEditing(false);
    } catch (e: any) {
      toast({ title: t('roadmap.error'), description: e?.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">{t('roadmap.loading')}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">{t('roadmap.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('roadmap.subtitle')}</p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setDraft(current); setEditing(false); }}>
              <X className="mr-2 h-3 w-3" /> {t('roadmap.cancel')}
            </Button>
            <Button size="sm" onClick={save} disabled={upsert.isPending}>
              <Save className="mr-2 h-3 w-3" /> {t('roadmap.save')}
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="mr-2 h-3 w-3" /> {t('roadmap.edit')}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        <Badge variant="outline" className={statusStyles.done}>✅ {t('roadmap.status.done')}</Badge>
        <Badge variant="outline" className={statusStyles.progress}>🔄 {t('roadmap.status.progress')}</Badge>
        <Badge variant="outline" className={statusStyles.planned}>📋 {t('roadmap.status.planned')}</Badge>
      </div>

      {editing ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Pencil className="h-4 w-4" /> {t('roadmap.editorTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="font-mono text-xs min-h-[500px]"
              />
              <p className="text-xs text-muted-foreground mt-2">{t('roadmap.hint')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" /> {t('roadmap.previewTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {parseRoadmap(draft).map((section) => (
                <SectionView key={section.title} section={section} statusLabel={statusLabel} />
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="text-base">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <SectionView section={section} statusLabel={statusLabel} compact />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionView({
  section, statusLabel, compact,
}: {
  section: ParsedSection;
  statusLabel: (s: string) => string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'space-y-2' : 'space-y-2'}>
      {!compact && <p className="font-semibold text-sm">{section.title}</p>}
      {section.items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-2 text-sm">
          <Badge variant="outline" className={`${statusStyles[item.status]} shrink-0 text-[10px] uppercase`}>
            {statusLabel(item.status) || '•'}
          </Badge>
          <span className="flex-1 min-w-0">{item.text}</span>
        </div>
      ))}
    </div>
  );
}
