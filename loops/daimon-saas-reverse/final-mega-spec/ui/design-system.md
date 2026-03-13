# Design System — Daimon SaaS

> Aspect: 8.2.4
> Written: 2026-03-13
> Source: [../source/brand-guidelines.md](../source/brand-guidelines.md)
> Related: [../frontend/component-library.md](../frontend/component-library.md), [accessibility.md](./accessibility.md), [../frontend/responsive-behavior.md](../frontend/responsive-behavior.md)

---

## Overview

This file is the complete implementation reference for the Daimon design system. It covers:
1. Tailwind CSS configuration (complete `tailwind.config.js`)
2. CSS custom properties (design tokens)
3. Font loading setup (Next.js `next/font`)
4. Global CSS utilities and base styles
5. Component class naming conventions
6. Animation keyframe definitions
7. Usage rules enforcement checklist

The source of truth for all values is [../source/brand-guidelines.md](../source/brand-guidelines.md). This file translates those values into concrete implementation artifacts.

---

## 1. Tailwind CSS Configuration

**File**: `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Override default border-radius — brand requires 0 on all interactive elements
    borderRadius: {
      none: '0',
      sm: '0',     // override tailwind sm
      DEFAULT: '0', // override tailwind default
      md: '0',     // override tailwind md
      lg: '0',     // override tailwind lg
      xl: '0',     // override tailwind xl
      '2xl': '0',  // override tailwind 2xl
      full: '9999px', // retain for avatar circles only
      // Brand-permitted exceptions:
      divider: '2px',  // --radius-divider (aqua horizontal rule)
    },
    extend: {
      // ── Colors ──────────────────────────────────────────────────────────────
      colors: {
        navy: {
          DEFAULT: '#0C1F40',
          // Opacity variants via Tailwind's opacity modifier syntax:
          // navy/70, navy/50, navy/40, navy/30, navy/20, navy/10, navy/8
        },
        aqua: {
          DEFAULT: '#B4E7DD',
          // Opacity variants: aqua/60, aqua/35, aqua/30, aqua/20, aqua/15
        },
        periwinkle: {
          DEFAULT: '#9FAAE2',
          // Opacity variants: periwinkle/35, periwinkle/25, periwinkle/20
        },
        // DATA VISUALIZATION ONLY — never use for UI elements
        'peach-viz': '#F6AE72',
        'white-soft': '#F7F7F7',
      },

      // ── Typography ───────────────────────────────────────────────────────────
      fontFamily: {
        headline: ['var(--font-archivo)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-lora)', 'Georgia', 'serif'],
      },
      fontSize: {
        // Named sizes matching brand type scale
        'display': ['clamp(56px, 6vw, 72px)', { lineHeight: '1.1', fontWeight: '700' }],
        'h1':      ['clamp(36px, 5vw, 64px)',  { lineHeight: '1.1', fontWeight: '700' }],
        'h2':      ['clamp(28px, 3.5vw, 44px)', { lineHeight: '1.15', fontWeight: '500' }],
        'h3':      ['clamp(18px, 2vw, 24px)',   { lineHeight: '1.3', fontWeight: '400' }],
        'body-lg': ['22px', { lineHeight: '1.6', fontWeight: '400' }],
        'body':    ['18px', { lineHeight: '1.7', fontWeight: '400' }],
        'small':   ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'tiny':    ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        // Landing hero headline override
        'hero':    ['clamp(56px, 6vw, 80px)', { lineHeight: '1.05', fontWeight: '700' }],
      },
      fontWeight: {
        regular:  '400',
        medium:   '500',
        semibold: '600',
        bold:     '700',
      },

      // ── Spacing ──────────────────────────────────────────────────────────────
      spacing: {
        // Brand spacing tokens
        '4.5':  '18px',
        // Section padding values
        'section-x-desktop': '80px',
        'section-y-desktop': '60px',
        'section-x-mobile':  '60px',
        'section-y-mobile':  '24px',
        // Nav heights
        'nav-desktop': '64px',
        'nav-mobile':  '56px',
        // Button heights
        'btn-standard': '44px',
        'btn-compact':  '38px',
      },

      // ── Max Widths ───────────────────────────────────────────────────────────
      maxWidth: {
        'content':    '640px',   // body copy max-width
        'content-lg': '720px',   // featured paragraphs
        'copy-65':    '65ch',    // legal pages
        'heading-lg': '800px',   // hero heading
        'heading-md': '560px',   // section subheadings
      },

      // ── Height ───────────────────────────────────────────────────────────────
      height: {
        'nav-desktop': '64px',
        'nav-mobile':  '56px',
        'btn-standard': '44px',
        'btn-compact':  '38px',
        'divider':      '3px',
        'tag':          'auto',
      },
      minHeight: {
        'screen-100': '100vh',
      },

      // ── Width ────────────────────────────────────────────────────────────────
      width: {
        'divider': '48px',
        'logo-icon': '28px',
        'logo-min': '80px',
      },

      // ── Border Width ─────────────────────────────────────────────────────────
      borderWidth: {
        DEFAULT:  '1px',
        '1.5':    '1.5px',
        '2':      '2px',
      },

      // ── Box Shadow ───────────────────────────────────────────────────────────
      // Brand uses NO box shadows on cards or buttons.
      boxShadow: {
        none: 'none',
        DEFAULT: 'none', // override tailwind default shadow
        sm: 'none',
        md: 'none',
        lg: 'none',
        // Retain for focus rings only:
        'focus-ring': '0 0 0 3px rgba(180,231,221,0.5)',
        'focus-ring-navy': '0 0 0 3px rgba(12,31,64,0.3)',
      },

      // ── Backdrop Blur ────────────────────────────────────────────────────────
      backdropBlur: {
        'nav': '12px',
      },

      // ── Animations ───────────────────────────────────────────────────────────
      animation: {
        'drift-teal':         'drift-teal 25s ease-in-out infinite alternate',
        'drift-periwinkle':   'drift-periwinkle 30s ease-in-out infinite alternate',
        'drift-navy-center':  'drift-navy-center 22s ease-in-out infinite alternate',
        'drift-navy-right':   'drift-navy-right 28s ease-in-out infinite alternate',
        'drift-navy-left':    'drift-navy-left 20s ease-in-out infinite alternate',
        'fade-up':            'fade-up 0.5s ease-out forwards',
        'fade-in':            'fade-in 0.3s ease-out forwards',
        'slide-in-right':     'slide-in-right 0.3s ease forwards',
        'skeleton-pulse':     'skeleton-pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        'drift-teal': {
          '0%':   { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(200px, 100px)' },
        },
        'drift-periwinkle': {
          '0%':   { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(-150px, 100px)' },
        },
        'drift-navy-center': {
          '0%':   { transform: 'translateX(-50%) translate(0, 0)' },
          '100%': { transform: 'translateX(-50%) translate(120px, 160px)' },
        },
        'drift-navy-right': {
          '0%':   { transform: 'translateY(-57%) translate(0, 0)' },
          '100%': { transform: 'translateY(-57%) translate(-120px, 150px)' },
        },
        'drift-navy-left': {
          '0%':   { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(150px, 160px)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'skeleton-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%':       { opacity: '0.8' },
        },
      },

      // ── Transition ───────────────────────────────────────────────────────────
      transitionProperty: {
        'brand': 'all',
        'opacity-only': 'opacity',
        'bg-color': 'background-color, color',
      },
      transitionTimingFunction: {
        'brand': 'ease',
      },
      transitionDuration: {
        'brand': '200ms',
        'modal': '300ms',
      },

      // ── Z-Index ──────────────────────────────────────────────────────────────
      zIndex: {
        'nav':         '50',
        'mobile-menu': '100',
        'modal':       '200',
        'toast':       '300',
        'blob':        '0',
        'blob-overlay':'1',
        'content':     '10',
      },

      // ── Screens (breakpoints) ────────────────────────────────────────────────
      // Brand uses a single mobile breakpoint at 900px
      screens: {
        'sm':  '600px',   // tablet: 2-column grids
        'md':  '900px',   // brand mobile breakpoint
        'lg':  '1280px',  // desktop
        'xl':  '1536px',  // large desktop (rarely used)
      },

      // ── Grid ─────────────────────────────────────────────────────────────────
      gridTemplateColumns: {
        'footer-desktop': '1.5fr 1fr 1fr 1fr 1fr',
        'footer-mobile':  '1fr 1fr',
        '2-equal':        'repeat(2, 1fr)',
        '3-equal':        'repeat(3, 1fr)',
        '4-equal':        'repeat(4, 1fr)',
      },
      gap: {
        'grid-2': '32px',
        'grid-3': '24px',
        'grid-4': '20px',
        'grid-5': '16px',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 2. CSS Custom Properties (Design Tokens)

**File**: `app/globals.css` (`:root` block)

```css
:root {
  /* ── Colors ──────────────────────────────────────────────────── */
  --color-navy:        #0C1F40;
  --color-white:       #FFFFFF;
  --color-white-soft:  #F7F7F7;
  --color-aqua:        #B4E7DD;
  --color-periwinkle:  #9FAAE2;
  --color-peach-viz:   #F6AE72; /* DATA VIZ ONLY */

  /* ── Semantic color assignments ────────────────────────────────── */
  --color-btn-primary-bg:      #B4E7DD;   /* Primary button background */
  --color-btn-primary-text:    #0C1F40;   /* Primary button text */
  --color-btn-secondary-border:#0C1F40;   /* Secondary button border (light bg) */
  --color-btn-secondary-dark-border: #FFFFFF; /* Secondary button border (dark bg) */
  --color-nav-active-underline: #B4E7DD;  /* Active nav link indicator */
  --color-tag-category-bg:     rgba(180,231,221,0.20); /* Category tag bg */
  --color-tag-meta-bg:         rgba(159,170,226,0.20); /* Meta tag bg */
  --color-tag-status-bg:       #B4E7DD;   /* Status tag (solid) */
  --color-footer-bg:           #0C1F40;   /* Footer background */
  --color-card-bg:             #FFFFFF;   /* Card background */
  --color-card-bg-admin:       #F7F7F7;   /* Admin panel card bg */
  --color-divider-brand:       #B4E7DD;   /* Brand divider color */

  /* ── CI Accent Stripe colors ────────────────────────────────── */
  --color-stripe-band1: rgba(180,231,221,0.30); /* 30% aqua */
  --color-stripe-band2: rgba(159,170,226,0.35); /* 35% periwinkle */
  --color-stripe-band3: rgba(180,231,221,0.60); /* 60% aqua */

  /* ── Typography ────────────────────────────────────────────── */
  --font-headline: var(--font-archivo), sans-serif;
  --font-body:     var(--font-inter), sans-serif;
  --font-serif:    var(--font-lora), Georgia, serif;

  /* ── Font sizes ────────────────────────────────────────────── */
  --text-display:  clamp(56px, 6vw, 72px);
  --text-hero:     clamp(56px, 6vw, 80px);
  --text-h1:       clamp(36px, 5vw, 64px);
  --text-h2:       clamp(28px, 3.5vw, 44px);
  --text-h3:       clamp(18px, 2vw, 24px);
  --text-body-lg:  22px;
  --text-body:     18px;
  --text-small:    14px;
  --text-tiny:     12px;

  /* ── Spacing ────────────────────────────────────────────── */
  --space-12: 12px;
  --space-16: 16px;
  --space-24: 24px;
  --space-32: 32px;
  --space-48: 48px;
  --space-64: 64px;

  /* ── Section padding ────────────────────────────────────── */
  --section-px-desktop: 80px;
  --section-py-desktop: 60px;
  --section-px-mobile:  60px;
  --section-py-mobile:  24px;

  /* ── Nav ─────────────────────────────────────────────── */
  --nav-height-desktop: 64px;
  --nav-height-mobile:  56px;
  --nav-bg:             rgba(255,255,255,0.92);
  --nav-blur:           12px;
  --nav-border:         1px solid rgba(12,31,64,0.08);

  /* ── Buttons ────────────────────────────────────────────── */
  --btn-height-standard: 44px;
  --btn-height-compact:  38px;
  --btn-radius:          0;
  --btn-border-width:    1.5px;
  --btn-transition:      all 0.2s ease;
  --btn-hover-opacity:   0.85;

  /* ── Border radius ─────────────────────────────────────── */
  --radius-none:    0;       /* ALL interactive elements: buttons, cards, inputs, tags */
  --radius-divider: 2px;     /* Brand aqua divider rule only */
  --radius-circle:  9999px;  /* Avatars only */

  /* ── Shadows ────────────────────────────────────────────── */
  --shadow-none:       none; /* Brand: no box shadows on cards or buttons */
  --shadow-focus-ring: 0 0 0 3px rgba(180,231,221,0.5);   /* Aqua focus ring */
  --shadow-focus-navy: 0 0 0 3px rgba(12,31,64,0.3);       /* Navy focus ring */

  /* ── Z-index ─────────────────────────────────────────────── */
  --z-blob:         0;
  --z-blob-overlay: 1;
  --z-content:      10;
  --z-nav:          50;
  --z-mobile-menu:  100;
  --z-modal:        200;
  --z-toast:        300;

  /* ── Grid gaps ───────────────────────────────────────────── */
  --gap-grid-2: 32px;
  --gap-grid-3: 24px;
  --gap-grid-4: 20px;
  --gap-grid-5: 16px;
  --gap-flex:   16px;
  --gap-footer: 32px;

  /* ── Transitions ─────────────────────────────────────────── */
  --transition-brand: all 0.2s ease;
  --transition-modal: all 0.3s ease;
  --transition-opacity: opacity 0.2s ease;
}
```

---

## 3. Font Loading (Next.js `next/font`)

**File**: `app/layout.tsx`

```typescript
import { Inter } from 'next/font/google'
import { Archivo } from 'next/font/google'
import { Lora } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
})

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
  axes: ['wdth'],  // Enable variable width axis (wdth: 62.5–125)
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
  preload: false,  // Lora is decorative only, not critical
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${archivo.variable} ${lora.variable}`}>
      <body className="font-body text-navy bg-white antialiased">
        {children}
      </body>
    </html>
  )
}
```

**Archivo `wdth` axis usage in CSS:**
```css
/* Expanded — H1, Display (hero headings) */
.font-headline-expanded {
  font-family: var(--font-archivo), sans-serif;
  font-variation-settings: 'wdth' 125;
}

/* Semi-Expanded — H2, H3 (subheadings) */
.font-headline-semi {
  font-family: var(--font-archivo), sans-serif;
  font-variation-settings: 'wdth' 112.5;
}

/* Normal — NOT USED in brand (wdth 100 is explicitly forbidden) */
```

---

## 4. Global CSS Base Styles

**File**: `app/globals.css` (base styles after `:root`)

```css
/* ── Base reset ─────────────────────────────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
}

body {
  background-color: var(--color-white);
  color: var(--color-navy);
  font-family: var(--font-body);
  font-size: var(--text-body);
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── Typography base ─────────────────────────────────────────── */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-headline);
  color: var(--color-navy);
  font-variation-settings: 'wdth' 125;
}

h2, h3 {
  font-variation-settings: 'wdth' 112.5;
}

p {
  max-width: 640px;  /* Default body copy max-width */
}

a {
  color: inherit;
  text-decoration: none;
  transition: var(--transition-opacity);
}

/* ── Scroll margin for sticky nav ─────────────────────────────── */
[id] {
  scroll-margin-top: calc(var(--nav-height-desktop) + 16px);
}

@media (max-width: 900px) {
  [id] {
    scroll-margin-top: calc(var(--nav-height-mobile) + 16px);
  }
}

/* ── Reduced motion ──────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  [data-blob] {
    animation: none !important;
  }
}

/* ── Focus visible styles ────────────────────────────────────── */
:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus-ring);
}

/* Specific focus for dark backgrounds */
.bg-navy :focus-visible {
  box-shadow: 0 0 0 3px rgba(180,231,221,0.7);
}

/* ── Selection ──────────────────────────────────────────────── */
::selection {
  background-color: rgba(180,231,221,0.4);
  color: var(--color-navy);
}
```

---

## 5. CI Accent Stripe Component

The CI accent stripe appears on every content card. It is a 6px-wide left-edge decoration with three overlapping bands.

**CSS implementation:**

```css
/* Applied as a pseudo-element or a dedicated div inside each card */
.ci-stripe {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  overflow: hidden;
  /* Use ::before, ::after, and a third element (or background with multiple gradients) */
}

/* Single-element approach using layered background */
.ci-stripe-single {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  background:
    /* Band 3: center 60% aqua */
    linear-gradient(
      to bottom,
      transparent 40%,
      rgba(180,231,221,0.60) 40%,
      rgba(180,231,221,0.60) 60%,
      transparent 60%
    ),
    /* Band 2: 35%–65% periwinkle */
    linear-gradient(
      to bottom,
      transparent 35%,
      rgba(159,170,226,0.35) 35%,
      rgba(159,170,226,0.35) 65%,
      transparent 65%
    ),
    /* Band 1: 15%–85% aqua */
    linear-gradient(
      to bottom,
      transparent 15%,
      rgba(180,231,221,0.30) 15%,
      rgba(180,231,221,0.30) 85%,
      transparent 85%
    );
}
```

**React/Tailwind shortcut**: Use a utility class `ci-stripe` defined in `globals.css` and apply `relative overflow-hidden` to the parent card. Every card component in the system must include this stripe.

---

## 6. Component Class Naming Conventions

All components use the following naming pattern to enforce brand compliance:

| Component type | Class prefix | Example |
|---------------|-------------|---------|
| Button | `btn-` | `btn-primary`, `btn-secondary`, `btn-ghost` |
| Card | `card-` | `card-base`, `card-stat`, `card-pricing` |
| Tag / Badge | `tag-` | `tag-category`, `tag-meta`, `tag-status` |
| Section | `section-` | `section-light`, `section-soft`, `section-dark` |
| Form input | `input-` | `input-base`, `input-error`, `input-disabled` |
| Nav | `nav-` | `nav-link`, `nav-link-active` |
| Modal | `modal-` | `modal-overlay`, `modal-content` |
| Toast | `toast-` | `toast-success`, `toast-error`, `toast-info` |
| Skeleton | `skeleton-` | `skeleton-text`, `skeleton-block` |

---

## 7. Predefined Utility Classes

**File**: `app/globals.css` (utility classes section, added with Tailwind `@layer utilities`)

```css
@layer utilities {
  /* ── Section containers ───────────────────────────────────────── */
  .section-light {
    background-color: var(--color-white);
  }
  .section-soft {
    background-color: var(--color-white-soft);
  }
  .section-dark {
    background-color: var(--color-navy);
    color: var(--color-white);
  }
  .section-padding {
    padding: var(--section-py-desktop) var(--section-px-desktop);
  }
  @media (max-width: 900px) {
    .section-padding {
      padding: var(--section-py-mobile) var(--section-px-mobile);
    }
  }

  /* ── Brand divider ───────────────────────────────────────────── */
  .brand-divider {
    width: 48px;
    height: 3px;
    background-color: var(--color-aqua);
    border-radius: 2px;
    margin: 24px 0;
  }
  .brand-divider-center {
    width: 48px;
    height: 3px;
    background-color: var(--color-aqua);
    border-radius: 2px;
    margin: 24px auto;
  }

  /* ── Section label (eyebrow) ──────────────────────────────────── */
  .section-label {
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.5;
    color: var(--color-navy);
    margin-bottom: 12px;
  }

  /* ── Archivo headline variants ────────────────────────────────── */
  .font-headline-expanded {
    font-family: var(--font-headline);
    font-variation-settings: 'wdth' 125;
  }
  .font-headline-semi {
    font-family: var(--font-headline);
    font-variation-settings: 'wdth' 112.5;
  }

  /* ── Tag variants ─────────────────────────────────────────────── */
  .tag-category {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 14px;
    background-color: rgba(180,231,221,0.20);
    color: var(--color-navy);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    border-radius: 0;
  }
  .tag-meta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 14px;
    background-color: rgba(159,170,226,0.20);
    color: var(--color-navy);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    border-radius: 0;
  }
  .tag-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 14px;
    background-color: var(--color-aqua);
    color: var(--color-navy);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    border-radius: 0;
  }

  /* ── Skeleton loader ─────────────────────────────────────────── */
  .skeleton-base {
    background-color: rgba(12,31,64,0.08);
    border-radius: 0;
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }
  .skeleton-text {
    height: 16px;
    background-color: rgba(12,31,64,0.08);
    border-radius: 0;
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }
  .skeleton-block {
    background-color: rgba(12,31,64,0.08);
    border-radius: 0;
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }
}
```

---

## 8. Blob Animation Keyframes

**File**: `app/globals.css` (keyframes section)

```css
/* ── Hero blob drift animations ──────────────────────────────── */
@keyframes drift-teal {
  0%   { transform: translate(0, 0); }
  100% { transform: translate(200px, 100px); }
}
@keyframes drift-periwinkle {
  0%   { transform: translate(0, 0); }
  100% { transform: translate(-150px, 100px); }
}
@keyframes drift-navy-center {
  0%   { transform: translateX(-50%) translate(0, 0); }
  100% { transform: translateX(-50%) translate(120px, 160px); }
}
@keyframes drift-navy-right {
  0%   { transform: translateY(-57%) translate(0, 0); }
  100% { transform: translateY(-57%) translate(-120px, 150px); }
}
@keyframes drift-navy-left {
  0%   { transform: translate(0, 0); }
  100% { transform: translate(150px, 160px); }
}

/* ── Scroll-triggered reveal animations ────────────────────────── */
@keyframes fade-up {
  0%   { opacity: 0; transform: translateY(24px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes fade-in {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}

/* ── Mobile menu slide ───────────────────────────────────────── */
@keyframes slide-in-right {
  0%   { transform: translateX(100%); }
  100% { transform: translateX(0); }
}

/* ── Skeleton loader pulse ───────────────────────────────────── */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.8; }
}
```

---

## 9. Dots Texture Overlay

Used on hero section background (applied as `::before` pseudo-element on the hero `<section>`):

```css
.hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: 0.5;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2'%3E%3Crect width='1' height='1' fill='%230C1F40' fill-opacity='0.08'/%3E%3C/svg%3E");
  background-size: 4px 4px;
  pointer-events: none;
}
```

---

## 10. Dashboard Dark Sidebar

The dashboard uses a Navy sidebar on desktop. Specific overrides:

```css
/* Dashboard sidebar */
.sidebar {
  background-color: var(--color-navy);
  color: var(--color-white);
  width: 240px;
  min-height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 40;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: rgba(255,255,255,0.7);
  transition: var(--transition-brand);
  border-radius: 0;
}

.sidebar-link:hover {
  color: rgba(255,255,255,1);
  background-color: rgba(255,255,255,0.05);
}

.sidebar-link.active {
  color: var(--color-aqua);
  background-color: rgba(180,231,221,0.10);
  border-left: 2px solid var(--color-aqua);
  padding-left: 18px; /* adjust for border */
}
```

---

## 11. Form Input Styles

```css
/* Base input */
.input-base {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  background-color: var(--color-white);
  border: 1.5px solid rgba(12,31,64,0.20);
  border-radius: 0;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 400;
  color: var(--color-navy);
  transition: border-color 0.2s ease;
  outline: none;
}

.input-base::placeholder {
  color: rgba(12,31,64,0.35);
}

.input-base:focus {
  border-color: var(--color-navy);
  box-shadow: var(--shadow-focus-ring);
}

.input-base.error {
  border-color: #DC2626;  /* Red-600 — error state */
}

.input-base:disabled {
  background-color: rgba(12,31,64,0.05);
  color: rgba(12,31,64,0.40);
  cursor: not-allowed;
}
```

---

## 12. Brand Compliance Enforcement Checklist

Before shipping any new component or page, verify:

| Rule | Check |
|------|-------|
| All buttons have `border-radius: 0` | □ |
| All cards have `border-radius: 0` (no `rounded-*` Tailwind classes) | □ |
| All form inputs have `border-radius: 0` | □ |
| Tags have `border-radius: 0` | □ |
| All cards with content have CI accent stripe on left edge | □ |
| Primary buttons: Aqua background, Navy text, 1.5px Aqua border | □ |
| Secondary buttons (light bg): Transparent bg, Navy text, 1.5px Navy border | □ |
| Secondary buttons (dark bg): Transparent bg, White text, 1.5px White border | □ |
| No box shadows on cards or buttons | □ |
| Peach (`#F6AE72`) not used anywhere except data visualizations | □ |
| Archivo wdth:125 used only for H1/Display — H2/H3 use wdth:112.5 | □ |
| Archivo wdth:100 (normal) not used anywhere | □ |
| Inter used for all body text, labels, navigation, button text | □ |
| Logo: single flat color only (Navy on light, Aqua on dark) | □ |
| Animations respect `prefers-reduced-motion` | □ |
| Focus states visible with 3px aqua focus ring | □ |
| All interactive elements have min 44px touch target (mobile) | □ |

---

## 13. Cross-References

- Full color/typography source: [../source/brand-guidelines.md](../source/brand-guidelines.md)
- Component props/variants/states: [../frontend/component-library.md](../frontend/component-library.md)
- ARIA labels and accessibility: [accessibility.md](./accessibility.md)
- Responsive breakpoints per page: [../frontend/responsive-behavior.md](../frontend/responsive-behavior.md)
- Keyboard navigation: [keyboard-navigation.md](./keyboard-navigation.md)
- Micro-interactions: [micro-interactions.md](./micro-interactions.md)
