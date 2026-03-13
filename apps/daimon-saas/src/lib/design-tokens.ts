/**
 * Daimon SaaS — Design Tokens
 * Source: loops/daimon-saas-reverse/final-mega-spec/source/brand-guidelines.md
 *         loops/daimon-saas-reverse/final-mega-spec/ui/design-system.md
 *
 * Use these constants when you need brand values outside of Tailwind classes
 * (e.g. inline styles, canvas drawing, charting libraries, dynamic CSS).
 */

// ── Colors ────────────────────────────────────────────────────────────────────

export const colors = {
  navy:       '#0C1F40', // Primary text, dark backgrounds — 60–70% of UI
  white:      '#FFFFFF', // Base page background
  whiteSoft:  '#F7F7F7', // Soft section / card backgrounds
  aqua:       '#B4E7DD', // Supporting accent: buttons, underlines, hover states — 20–30%
  periwinkle: '#9FAAE2', // Supporting accent: gradients, meta tags — 20–30%
  peachViz:   '#F6AE72', // DATA VISUALIZATION ONLY — charts, KPIs, trend indicators — 5–10%

  // Semantic assignments
  btnPrimaryBg:           '#B4E7DD',
  btnPrimaryText:         '#0C1F40',
  btnSecondaryBorder:     '#0C1F40',
  btnSecondaryDarkBorder: '#FFFFFF',
  navActiveUnderline:     '#B4E7DD',
  tagCategoryBg:          'rgba(180, 231, 221, 0.20)',
  tagMetaBg:              'rgba(159, 170, 226, 0.20)',
  tagStatusBg:            '#B4E7DD',
  footerBg:               '#0C1F40',
  cardBg:                 '#FFFFFF',
  cardBgAdmin:            '#F7F7F7',
  dividerBrand:           '#B4E7DD',

  // CI accent stripe bands
  stripeBand1: 'rgba(180, 231, 221, 0.30)', // 15%–85% aqua
  stripeBand2: 'rgba(159, 170, 226, 0.35)', // 35%–65% periwinkle
  stripeBand3: 'rgba(180, 231, 221, 0.60)', // center aqua
} as const;

// ── Typography ─────────────────────────────────────────────────────────────────

export const fontFamilies = {
  headline: 'var(--font-archivo), sans-serif',
  body:     'var(--font-inter), sans-serif',
  serif:    'var(--font-lora), Georgia, serif',
} as const;

/** Font sizes in the brand type scale. Use CSS vars (--text-*) in stylesheets. */
export const fontSizes = {
  display:  'clamp(56px, 6vw, 72px)',
  hero:     'clamp(56px, 6vw, 80px)',
  h1:       'clamp(36px, 5vw, 64px)',
  h2:       'clamp(28px, 3.5vw, 44px)',
  h3:       'clamp(18px, 2vw, 24px)',
  bodyLg:   '22px',
  body:     '18px',
  small:    '14px',
  tiny:     '12px',
} as const;

export const fontWeights = {
  regular:  400,
  medium:   500,
  semibold: 600,
  bold:     700,
} as const;

export const lineHeights = {
  display: 1.1,
  hero:    1.05,
  h1:      1.1,
  h2:      1.15,
  h3:      1.3,
  bodyLg:  1.6,
  body:    1.7,
  small:   1.5,
  tiny:    1.5,
} as const;

// ── Spacing ────────────────────────────────────────────────────────────────────

export const spacing = {
  12: '12px',
  16: '16px',
  24: '24px',
  32: '32px',
  48: '48px',
  64: '64px',
} as const;

export const sectionPadding = {
  desktop: { x: '80px', y: '60px' },
  mobile:  { x: '60px', y: '24px' },
} as const;

// ── Navigation ─────────────────────────────────────────────────────────────────

export const nav = {
  heightDesktop: '64px',
  heightMobile:  '56px',
  bg:            'rgba(255, 255, 255, 0.92)',
  blur:          '12px',
  border:        '1px solid rgba(12, 31, 64, 0.08)',
} as const;

// ── Buttons ────────────────────────────────────────────────────────────────────

export const buttons = {
  heightStandard: '44px',
  heightCompact:  '38px',
  borderRadius:   0,
  borderWidth:    '1.5px',
  transition:     'all 0.2s ease',
  hoverOpacity:   0.85,
  /** Standard size padding: 0 28px, font 15px weight 600 */
  paddingStandard: '0 28px',
  /** Compact size padding: 0 20px, font 14px weight 600 */
  paddingCompact:  '0 20px',
} as const;

// ── Grid gaps ──────────────────────────────────────────────────────────────────

export const gridGaps = {
  twoCol:   '32px',
  threeCol: '24px',
  fourCol:  '20px',
  fiveCol:  '16px',
  flex:     '16px',
} as const;

// ── Z-index ────────────────────────────────────────────────────────────────────

export const zIndex = {
  blob:        0,
  blobOverlay: 1,
  content:     10,
  nav:         50,
  mobileMenu:  100,
  modal:       200,
  toast:       300,
} as const;

// ── Breakpoints ────────────────────────────────────────────────────────────────

export const breakpoints = {
  sm: 600,  // tablet
  md: 900,  // brand mobile breakpoint
  lg: 1280, // desktop
  xl: 1536,
} as const;

// ── Shadows ────────────────────────────────────────────────────────────────────

export const shadows = {
  none:      'none',
  focusRing: '0 0 0 3px rgba(180, 231, 221, 0.5)',
  focusNavy: '0 0 0 3px rgba(12, 31, 64, 0.3)',
} as const;
