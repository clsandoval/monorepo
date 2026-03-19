import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
}

const SITE_NAME = 'Inheritance Calculator Philippines';
const BASE_URL = 'https://inheritance-frontend.fly.dev';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.png`;

export function SEOHead({ title, description, canonical, ogImage }: SEOHeadProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = canonical || `${BASE_URL}${window.location.pathname}`;
  const image = ogImage || DEFAULT_OG_IMAGE;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) ||
               document.querySelector(`meta[name="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        if (property.startsWith('og:')) {
          el.setAttribute('property', property);
        } else {
          el.setAttribute('name', property);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title', fullTitle);
    setMeta('og:description', description);
    setMeta('og:image', image);
    setMeta('og:type', 'website');
    setMeta('og:url', canonicalUrl);

    // Canonical link
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonicalUrl;
  }, [fullTitle, description, canonicalUrl, image]);

  return null;
}
