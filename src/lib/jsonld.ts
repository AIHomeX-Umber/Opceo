import type { Builder, ShipLog, Quest } from './types';

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'opceo.ai — The Infinite Build',
    url: 'https://opceo.ai',
    description:
      'opceo.ai is an open platform where builders publicly ship weekly progress logs, track build streaks, and connect with investors who signal-bet on promising projects.',
    publisher: {
      '@type': 'Organization',
      name: 'Mashi Technology',
      url: 'https://opceo.ai',
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mashi Technology',
    alternateName: '马时科技',
    url: 'https://opceo.ai',
    logo: 'https://opceo.ai/og-default.png',
    foundingDate: '2026',
    description:
      'Mashi Technology (马时科技) builds opceo.ai, an open platform for builders who ship weekly.',
  };
}

export function builderProfileJsonLd(builder: Builder) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: builder.display_name,
      url: `https://opceo.ai/${builder.slug}`,
      description: builder.bio,
      sameAs: Object.values(builder.links).filter(Boolean),
      knowsAbout: builder.building,
    },
    dateModified: builder.updated_at,
  };
}

export function shipLogJsonLd(log: ShipLog, builder: Builder) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Week ${log.week_number} Ship Log by ${builder.display_name}`,
    author: {
      '@type': 'Person',
      name: builder.display_name,
      url: `https://opceo.ai/${builder.slug}`,
    },
    datePublished: log.created_at,
    publisher: {
      '@type': 'Organization',
      name: 'opceo.ai',
      url: 'https://opceo.ai',
    },
  };
}

export function questJsonLd(quest: Quest) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: quest.title,
    description: quest.description,
    author: quest.poster
      ? { '@type': 'Person', name: quest.poster.display_name }
      : undefined,
    datePublished: quest.created_at,
  };
}

export function itemListJsonLd(
  items: Array<{ url: string; name: string }>,
  name: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: item.url,
      name: item.name,
    })),
  };
}

export function aboutPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About opceo.ai — The Infinite Build',
    url: 'https://opceo.ai/about',
    description:
      'opceo.ai is an open builder platform where participants publicly ship weekly progress logs, accumulate build streaks, and connect with investors who signal-bet on promising projects. Founded by Mashi Technology (马时科技) in 2026.',
  };
}
