export type NicheFaq = { q: string; a: string };

export type NicheExtra = { item: string; how: string };

export type NicheHeroImage = {
  url: string;
  alt: string;
  credit: { name: string; profileUrl: string };
};

/** Token de acento (variável CSS definida em index.css). */
export type NicheAccent =
  | 'niche-amber'
  | 'niche-coral'
  | 'niche-ice'
  | 'niche-blush'
  | 'niche-moss';


export type NicheContent = {
  /** Slug da URL: /modelo-de-orcamento/{slug} */
  slug: string;
  /** Nome curto da profissão, usado em listas e links. */
  label: string;
  /** Nome do ícone lucide-react usado no cabeçalho. */
  icon: string;
  /** Token de acento da página. */
  accentColor: NicheAccent;
  /** Imagem de topo (Unsplash) com crédito obrigatório. */
  heroImage: NicheHeroImage;
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
