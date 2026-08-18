import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LibraryBig, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useSnippets, useCreateSnippet, type SnippetKind } from '@/hooks/useSnippets';
import { presetsForKind } from '@/lib/snippetPresets';

type Props = {
  kind: SnippetKind;
  /** Texto atual do campo — usado para "salvar como bloco". */
  value: string;
  /** Insere o texto do bloco no fim do campo. */
  onInsert: (text: string) => void;
};

export function SnippetPicker({ kind, value, onInsert }: Props) {
  const { t } = useTranslation(['snippets', 'common']);
  const [open, setOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [title, setTitle] = useState('');
  const { data: snippets } = useSnippets(kind);
  const createSnippet = useCreateSnippet();

  const presets = presetsForKind(kind);
  const hasOwn = !!snippets?.length;

  const insert = (text: string) => {
    onInsert(text);
    setOpen(false);
  };

  const saveCurrent = async () => {
    const body = value.trim();
    if (!body || !title.trim()) return;
    await createSnippet.mutateAsync({ kind, title: title.trim(), body });
    setTitle('');
    setSaveOpen(false);
  };

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs">
            <LibraryBig className="h-3.5 w-3.5" />
            {t('picker.trigger')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0 pointer-events-auto" align="end">
          <Command>
            <CommandInput placeholder={t('picker.placeholder')} />
            <CommandList>
              <CommandEmpty>
                <div className="p-3 text-sm text-muted-foreground space-y-2">
                  <p>{t('picker.empty')}</p>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/snippets">{t('picker.manage')}</Link>
                  </Button>
                </div>
              </CommandEmpty>

              {hasOwn && (
                <CommandGroup heading={t('picker.mine')}>
                  {snippets!.map((s) => (
                    <CommandItem
                      key={s.id}
                      value={`${s.title} ${s.body}`}
                      onSelect={() => insert(s.body)}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{s.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{s.body}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {presets.length > 0 && (
                <CommandGroup heading={t('picker.suggested')}>
                  {presets.map((p) => {
                    const pTitle = t(`presets.${p.id}.title`);
                    const pBody = t(`presets.${p.id}.body`);
                    return (
                      <CommandItem
                        key={p.id}
                        value={`${pTitle} ${pBody}`}
                        onSelect={() => insert(pBody)}
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{pTitle}</p>
                          <p className="truncate text-xs text-muted-foreground">{pBody}</p>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
          <div className="border-t p-2">
            <Button asChild size="sm" variant="ghost" className="w-full justify-start text-xs">
              <Link to="/snippets">{t('picker.manage')}</Link>
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-xs"
        disabled={!value.trim()}
        onClick={() => setSaveOpen(true)}
      >
        <Bookmark className="h-3.5 w-3.5" />
        {t('picker.save')}
      </Button>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('save.title')}</DialogTitle>
            <DialogDescription>{t('save.description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="snippet-title">{t('fields.title')}</Label>
            <Input
              id="snippet-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('fields.titlePlaceholder')}
              autoFocus
            />
            <p className="max-h-24 overflow-y-auto rounded-md bg-muted p-2 text-xs text-muted-foreground whitespace-pre-wrap">
              {value.trim()}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSaveOpen(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="button" onClick={saveCurrent} disabled={!title.trim() || createSnippet.isPending}>
              {t('common:actions.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
