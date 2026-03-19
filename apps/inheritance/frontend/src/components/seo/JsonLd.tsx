interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const CALCULATOR_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Inheritance Calculator Philippines',
  applicationCategory: 'LegalService',
  operatingSystem: 'Web',
  description: 'Free Philippine succession law calculator. Compute inheritance shares for intestate, testate, and mixed succession.',
  url: 'https://inheritance-frontend.fly.dev',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'PHP',
  },
};
