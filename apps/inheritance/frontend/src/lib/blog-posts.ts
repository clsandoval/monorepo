export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  keywords: string[];
  ctaLink: string;
  ctaText: string;
}

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: 'intestate-vs-testate',
    title: "Intestate vs Testate Succession: What's the Difference?",
    description: 'Learn the key differences between intestate and testate succession under Philippine law, including when each applies and how estates are distributed.',
    date: '2026-03-19',
    keywords: ['intestate vs testate philippines', 'succession types', 'philippine inheritance law'],
    ctaLink: '/intestate-succession-calculator',
    ctaText: 'Try the Intestate Succession Calculator',
  },
  {
    slug: 'how-to-compute-legitime',
    title: 'How to Compute the Legitime Under Philippine Law',
    description: 'Step-by-step guide to computing the legitime (compulsory share) for each type of heir under the Philippine Civil Code.',
    date: '2026-03-19',
    keywords: ['how to compute legitime', 'legitime calculation', 'compulsory heirs philippines'],
    ctaLink: '/legitimate-share-calculator',
    ctaText: 'Calculate Legitimes Now',
  },
  {
    slug: 'illegitimate-children-rights',
    title: 'Rights of Illegitimate Children in Philippine Inheritance',
    description: 'Understand the inheritance rights of illegitimate children, how their shares compare to legitimate heirs, and what proof of filiation is required.',
    date: '2026-03-19',
    keywords: ['illegitimate child inheritance rights philippines', 'filiation proof', 'inheritance share illegitimate'],
    ctaLink: '/illegitimate-child-inheritance',
    ctaText: 'Calculate Illegitimate Child Shares',
  },
  {
    slug: 'no-will-philippines',
    title: 'What Happens When There Is No Will in the Philippines?',
    description: 'A practical guide to intestate succession in the Philippines — who inherits, in what order, and how much they receive when there is no will.',
    date: '2026-03-19',
    keywords: ['no will inheritance philippines', 'intestate succession', 'who inherits without will'],
    ctaLink: '/no-will-inheritance-philippines',
    ctaText: 'See Who Inherits Without a Will',
  },
  {
    slug: 'preterition-explained',
    title: 'Preterition Explained: When a Compulsory Heir Is Left Out',
    description: 'What happens when a will omits a compulsory heir? Learn about preterition under Philippine law and its effect on testamentary dispositions.',
    date: '2026-03-19',
    keywords: ['preterition philippine law', 'compulsory heir omitted', 'will annulment philippines'],
    ctaLink: '/legitimate-share-calculator',
    ctaText: 'Calculate Compulsory Shares',
  },
  {
    slug: 'parents-inheritance-share',
    title: 'Estate Distribution When Both Parents Are Alive',
    description: 'How Philippine succession law distributes the estate when the deceased has no children and both parents survive. Covers with and without surviving spouse.',
    date: '2026-03-19',
    keywords: ['inheritance parents share philippines', 'ascending heirs', 'parents inheritance'],
    ctaLink: '/parents-inheritance-share',
    ctaText: "Calculate Parents' Shares",
  },
];

export function getBlogPost(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}
