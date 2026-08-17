import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calculator,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  MessageCircle,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Seo } from '@/components/Seo';
import orcaMark from '@/assets/brand/orca-mark-sm.png';
import ebookAsset from '@/assets/ebook-orcamento-gratuito.pdf.asset.json';

const SITE_URL = 'https://orca-mento.app';
const DOWNLOAD_PATH = ebookAsset.url;

const BULLETS = [
  {
    icon: Calculator,
    title: 'A fórmula de precificação',
    description:
      'Como chegar num preço que cobre seus custos, seu tempo e ainda deixa lucro — sem chutar.',
  },
  {
    icon: FileText,
    title: 'Os 6 itens de toda proposta',
    description:
      'O checklist do que não pode faltar para o cliente entender o valor e dizer sim.',
  },
  {
    icon: Users,
    title: 'Os 4 tipos de cliente',
    description:
      'Como identificar cada perfil na primeira conversa e ajustar seu orçamento a ele.',
  },
  {
    icon: MessageCircle,
    title: 'Follow-up sem parecer chato',
    description:
      'A cadência e as mensagens prontas para retomar orçamentos parados com naturalidade.',
  },
];

export default function Ebook() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const downloadUrl = `${window.location.origin}${DOWNLOAD_PATH}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error('Informe um e-mail válido.');
      return;
    }
    setSubmitting(true);
    try {
      const cleanName = name.trim() || null;

      const { error } = await supabase.from('ebook_leads').insert({
        email: cleanEmail,
        name: cleanName,
        source: 'ebook-orcamento',
      });
      if (error) throw error;

      // Envia o PDF por e-mail (não bloqueia o download imediato)
      supabase.functions
        .invoke('send-transactional-email', {
          body: {
            templateName: 'ebook-delivery',
            recipientEmail: cleanEmail,
            idempotencyKey: `ebook-delivery-${cleanEmail}`,
            templateData: {
              firstName: cleanName ? cleanName.split(' ')[0] : undefined,
              downloadUrl: `${SITE_URL}${DOWNLOAD_PATH}`,
              appUrl: SITE_URL,
            },
          },
        })
        .catch(() => undefined);

      setDone(true);
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      toast.success('Pronto! O download começou e o e-book também foi para o seu e-mail.');
    } catch (err: any) {
      toast.error(err?.message || 'Não foi possível enviar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="E-book grátis: Como Parar de Perder Clientes no Orçamento | Orca"
        description="Baixe grátis o guia da Orca com a fórmula de precificação, os 6 itens de toda proposta, os 4 tipos de cliente e o follow-up que funciona."
        path="/ebook"
      />

      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={orcaMark} alt="Orca" className="h-8 w-auto object-contain" />
            <span className="font-semibold">Orca</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">Conhecer a Orca</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <BookOpen className="h-3.5 w-3.5" /> E-book gratuito
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Como Parar de Perder Clientes no Orçamento
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              O guia prático para precificar com segurança, montar propostas que
              convencem e fazer follow-up sem constrangimento.
            </p>

            <ul className="mt-8 space-y-5">
              {BULLETS.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:pl-4">
            <Card className="sticky top-8 border-primary/20 shadow-lg">
              <CardContent className="p-6 md:p-8">
                {done ? (
                  <div className="space-y-4 text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
                    <h2 className="text-xl font-semibold">Seu e-book está liberado</h2>
                    <p className="text-sm text-muted-foreground">
                      Se o download não começou automaticamente, use o botão
                      abaixo. Também enviamos o PDF para <strong>{email}</strong>.
                    </p>
                    <Button asChild className="w-full">
                      <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" /> Baixar o PDF
                      </a>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/">Conhecer a Orca</Link>
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold">Baixe agora, é grátis</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Sem cadastro e sem senha. Só o e-mail para enviar o PDF.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ebook-name">Nome (opcional)</Label>
                      <Input
                        id="ebook-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Como podemos te chamar?"
                        maxLength={120}
                        autoComplete="name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ebook-email">E-mail</Label>
                      <Input
                        id="ebook-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="voce@email.com"
                        maxLength={255}
                        autoComplete="email"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando…
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" /> Baixar grátis
                        </>
                      )}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Ao baixar, você concorda em receber o e-book por e-mail.
                      Você pode cancelar quando quiser.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
