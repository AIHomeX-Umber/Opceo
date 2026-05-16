'use client';
import { ShareButton } from './ShareButton';
import { getProfileShareText } from '@/lib/share-text';
import type { Builder } from '@/lib/types';

export function ProfileShareButton({ builder }: { builder: Builder }) {
  const profileUrl = `https://opceo.ai/${builder.slug}`;
  const text = getProfileShareText(builder);
  return <ShareButton url={profileUrl} text={text} variant="full" />;
}
