import type { Metadata } from 'next';

export const SITE_URL = 'https://daimon.ai';
export const SITE_NAME = 'Daimon';
export const TWITTER_HANDLE = '@daimon_ai';
export const DEFAULT_OG_IMAGE = '/og/default.png';

export function buildMetadata(overrides: Partial<Metadata>): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    ...overrides,
  };
}

export function noIndexMetadata(base: Partial<Metadata>): Metadata {
  return buildMetadata({
    ...base,
    robots: { index: false, follow: false },
  });
}
