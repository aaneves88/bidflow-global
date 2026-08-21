export type NicheFaq = { q: string; a: string };

export type NicheExtra = { item: string; how: string };

export type NicheContent = {
  /** Slug da URL: /modelo-de-orcamento/{slug} */
  slug: string;
  /** Nome curto da profissão, usado em listas e links. */
  label: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  intro: string;
  /** O que não pode faltar no orçamento desse serviço. */
  essentials: string[];
  /** Modelo pronto para copiar. */
  template: string;
  /** Itens normalmente cobrados à parte. */
  extras: NicheExtra[];
  faq: NicheFaq[];
};
