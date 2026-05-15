import type { Builder, ShipLog, Quest, Team, TeamMember, ShowcaseItem } from './types';

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Opeco.AI — The Infinite Build',
    url: 'https://opceo.ai',
    description:
      'Opeco.AI is an open platform where builders publicly ship weekly progress logs, track build streaks, and connect with investors who signal-bet on promising projects.',
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
      'Mashi Technology (马时科技) builds Opeco.AI, an open platform for builders who ship weekly.',
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
      description: builder.headline || builder.bio || undefined,
      jobTitle: builder.headline ?? undefined,
      sameAs: Object.values(builder.links ?? {}).filter(Boolean),
      knowsAbout: [
        builder.building,
        ...(builder.showcase ?? []).map((s: ShowcaseItem) => s.title),
      ].filter(Boolean),
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
      name: 'Opeco.AI',
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

export function signalJsonLd(quest: Quest) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: quest.title,
    description: quest.description?.slice(0, 300),
    author: quest.poster
      ? {
          '@type': 'Person',
          name: quest.poster.display_name,
          url: `https://opceo.ai/${quest.poster.slug}`,
        }
      : undefined,
    datePublished: quest.created_at,
    locationCreated: quest.location ?? undefined,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/EndorseAction',
      userInteractionCount: quest.seen_count ?? 0,
    },
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

export function agentJsonLd(builder: Builder, operator: { slug: string; display_name: string } | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: builder.display_name,
    url: `https://opceo.ai/${builder.slug}`,
    description: builder.headline || builder.bio || undefined,
    applicationCategory: 'AI Agent',
    operatingSystem: builder.agent_meta?.framework ?? 'API',
    author: operator
      ? {
          '@type': 'Person',
          name: operator.display_name,
          url: `https://opceo.ai/${operator.slug}`,
        }
      : undefined,
    dateModified: builder.updated_at,
  };
}

export function teamProfileJsonLd(team: Team, members: (TeamMember & { builder: Builder })[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: team.name,
    url: `https://opceo.ai/teams/${team.slug}`,
    description: team.description,
    member: members.map((m) => ({
      '@type': m.builder.entity_type === 'agent' ? 'SoftwareApplication' : 'Person',
      name: m.builder.display_name,
      url: `https://opceo.ai/${m.builder.slug}`,
    })),
    dateModified: team.updated_at,
  };
}

export function teamListJsonLd(teams: { slug: string; name: string }[]) {
  return itemListJsonLd(
    teams.map((t) => ({ url: `https://opceo.ai/teams/${t.slug}`, name: t.name })),
    'Teams — Opeco.AI'
  );
}

export function aboutPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Opeco.AI — The Infinite Build',
    url: 'https://opceo.ai/about',
    description:
      'Opeco.AI is an open builder platform where participants publicly ship weekly progress logs, accumulate build streaks, and connect with investors who signal-bet on promising projects. Founded by Mashi Technology (马时科技) in 2026.',
  };
}
