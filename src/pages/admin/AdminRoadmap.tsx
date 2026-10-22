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
- ✅ Autenticação (e-mail/senha) e login com Google
- ✅ Primeiro usuário vira admin; papéis em tabela separada
- ✅ Perfis, modelo de planos e configurações centralizadas

## Fase 2 — MVP Core
- ✅ Dashboard, clientes, propostas e status
- ✅ Página pública da proposta, aceite e assinatura do cliente
- ✅ Mini pipeline de vendas e KPIs

## Fase 3 — Admin & Configurações
- ✅ Dashboard administrativo, usuários, concessão manual de plano
- ✅ Gestão de planos, Stripe, marca e status de propostas
- ✅ Menus do admin reorganizados em 5 grupos (Números, Usuários, Vendas, Marketing, Sistema)

## Fase 4 — Monetização
- ✅ Plano gratuito com limite de propostas; Premium R$29,90/mês
- ✅ Feature flags por plano, modal de upgrade, indicador de uso
- ✅ Planos e Indique com menu lateral; Minha conta mostra "Administrador — acesso total"
- 🔄 Stripe checkout fim-a-fim e portal do cliente
- 📋 Plano anual R$239,90

## Fase 5 — Segurança e base
- ✅ Proteção (RLS) em todas as tabelas e revisão do linter
- ✅ Funções do servidor revisadas (Stripe webhook e demais)
- ✅ Limite de cadastros por IP (10 por dia)
- ✅ Correção dos links públicos de proposta e rate limit
- ✅ Validação de links no e-mail do e-book
- 🔄 Nova varredura de segurança antes de divulgação em massa

## Fase 6 — Ativação
- ✅ Auditoria completa de cadastro (desktop e celular) com relatório
- ✅ CPF/CNPJ pedido só na hora de compartilhar a proposta
- ✅ "+ Novo cliente" direto dentro do formulário da proposta
- ✅ Proposta nova vai direto para a tela de compartilhar
- ✅ Proposta de exemplo no primeiro acesso
- ✅ Site sempre em português

## Fase 7 — Propostas
- ✅ Até 3 imagens por produto (página pública e PDF)
- ✅ PIX na proposta e no PDF
- ✅ Link de pagamento com cartão (Mercado Pago e outros) na proposta e no PDF
- ✅ Aviso "cliente abriu" no sininho, e-mail na 1ª abertura e botão de WhatsApp
- ✅ Blocos de texto prontos com explicação de uso

## Fase 8 — E-mails
- ✅ Rotinas automáticas corrigidas (ativação, cupom, follow-up, e-book)
- ✅ E-mail de feedback 7 dias após o cadastro
- ✅ Disparo manual de novidades no admin, com modelos, prévia, teste e visual da marca
- ✅ Recuperação de senha por código de 6 dígitos dentro do app
- ✅ Alterar senha em Minha conta
- 📋 Remetente @orca-mento.app para novidades (depende de configurar o domínio)

## Fase 9 — Métricas e admin
- ✅ Relatório semanal (cadastros, propostas, assinaturas)
- ✅ Ativação por canal de aquisição (UTM)
- ✅ Funil das páginas de nicho e hub de modelos
- ✅ Google Ads e Tag Manager em produção

## Fase 10 — Marketing
- ✅ Kit de logotipo em alta definição (inclui versão clara)
- ✅ Nova página inicial escura com marca d'água de fitas ciano
- ✅ Vídeos tutoriais, educativos, parceiros e de anúncio na aba Vídeos
- ✅ Criativos de anúncio (inclusive meios de pagamento) na aba Materiais
- ✅ Central de ajuda (/ajuda) para usuários, sem download dos vídeos

## Fase 11 — Engatilhado / Futuro
- 📋 Teste de 7 dias + somente leitura e novo preço (aguardando Antonio)
- 📋 E-mails dos dias 5 e 7 do teste
- 📋 Indicação automática e página "Seja parceiro"
- 📋 Ações fora do app (mensagens, anúncios, contadores, diretórios)
- 📋 Página pública de orçamento para clientes do usuário (plano mais caro)
- 📋 Times multi-usuário, IA para propostas, white-label
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
