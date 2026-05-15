import type { Metadata } from 'next';
import type { SEOProps } from './types';

export function generateMetadata({
  title,
  description,
  path,
  type = 'website',
  image,
  publishedTime,
  modifiedTime,
}: SEOProps): Metadata {
  const url = `https://opceo.ai${path}`;
  const ogImage = image || '/og-default.png';

  return {
    title: `${title} | OPCEO`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'OPCEO — The Infinite Build',
      type: type as 'website' | 'article',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
