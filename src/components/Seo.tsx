import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://orca-mento.app';
const DEFAULT_IMAGE = `${SITE_URL}/og-orca.jpg`;

export interface SeoProps {
  /** Título completo da aba/resultado de busca. */
  title: string;
  description: string;
  /** Caminho da rota, ex.: "/pricing". Vira canonical e og:url absolutos. */
  path?: string;
  noindex?: boolean;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
}

export function Seo({
  title,
  description,
  path,
  noindex = false,
  image = DEFAULT_IMAGE,
  imageAlt = 'Orca — propostas e orçamentos profissionais',
  type = 'website',
}: SeoProps) {
  const url = path ? `${SITE_URL}${path}` : undefined;

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      {url && !noindex && <link rel="canonical" href={url} />}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={imageAlt} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt} />
    </Helmet>
  );
}

export default Seo;
