import { Font, StyleSheet } from '@react-pdf/renderer';

// ---------------------------------------------------------------------------
// Font Registration
// ---------------------------------------------------------------------------
// Using static Google Fonts CDN URLs for @react-pdf/renderer compatibility.
// These must be registered before any PDF component renders.

Font.register({
  family: 'Newsreader',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/newsreader/v20/cY9qfjOCX1hbuyalUrK49dLac06G1ZGsZBtoBCzBDXXD9JVF438w.woff2',
      fontWeight: 400,
      fontStyle: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/newsreader/v20/cY9qfjOCX1hbuyalUrK49dLac06G1ZGsZBtoBCzBDXXD9JVF438wItalic.woff2',
      fontWeight: 400,
      fontStyle: 'italic',
    },
    {
      src: 'https://fonts.gstatic.com/s/newsreader/v20/cY9qfjOCX1hbuyalUrK49dLac06G1ZGsZBtoBCzBDXXD9JVF438wBold.woff2',
      fontWeight: 700,
      fontStyle: 'normal',
    },
  ],
});

Font.register({
  family: 'Plus Jakarta Sans',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_KU7NSg.woff2',
      fontWeight: 400,
      fontStyle: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_KU7NSgMedium.woff2',
      fontWeight: 500,
      fontStyle: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_KU7NSgBold.woff2',
      fontWeight: 700,
      fontStyle: 'normal',
    },
  ],
});

Font.register({
  family: 'IBM Plex Mono',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/ibmplexmono/v19/-F6qfjptAgt5VM-kVkqdyU8n3uQ.woff2',
      fontWeight: 400,
      fontStyle: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/ibmplexmono/v19/-F6pfjptAgt5VM-kVkqdyU8n3oQIwlBFhA.woff2',
      fontWeight: 600,
      fontStyle: 'normal',
    },
  ],
});

// ---------------------------------------------------------------------------
// Color Constants (matches design tokens)
// ---------------------------------------------------------------------------
export const PDF_COLORS = {
  background: '#faf8f5',
  primary: '#1a3a1a',
  primaryLight: '#2a5a2a',
  secondary: '#5a7a5a',
  muted: '#8a7a6a',
  border: '#d4c9b8',
  surface: '#ffffff',
  accent: '#a3b8a3',
  black: '#000000',
  white: '#ffffff',
  lightGray: '#f5f5f5',
  tableHeaderBg: '#e8f0e8',
  tableAltRowBg: '#f5f7f5',
} as const;

// ---------------------------------------------------------------------------
// Shared StyleSheet
// ---------------------------------------------------------------------------
export const sharedStyles = StyleSheet.create({
  page: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 9,
    color: PDF_COLORS.primary,
    backgroundColor: PDF_COLORS.surface,
    paddingTop: 48,
    paddingBottom: 60,
    paddingLeft: 54,
    paddingRight: 54,
  },

  // Header section
  headerSection: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: PDF_COLORS.primary,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: 'Newsreader',
    fontSize: 18,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 9,
    color: PDF_COLORS.secondary,
    marginBottom: 3,
  },
  headerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  headerMetaText: {
    fontSize: 8,
    color: PDF_COLORS.muted,
  },

  // Table
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: PDF_COLORS.tableHeaderBg,
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLORS.border,
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLORS.border,
    backgroundColor: PDF_COLORS.tableAltRowBg,
  },
  tableRowTotal: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderTopWidth: 1.5,
    borderTopColor: PDF_COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.primary,
  },
  tableCell: {
    fontSize: 8.5,
    color: PDF_COLORS.primary,
  },
  tableCellMono: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 8,
    color: PDF_COLORS.primary,
  },
  tableCellMonoBold: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 8,
    fontWeight: 600,
    color: PDF_COLORS.primary,
  },

  // Citation block
  citationBlock: {
    marginTop: 16,
    padding: 10,
    backgroundColor: PDF_COLORS.background,
    borderLeftWidth: 3,
    borderLeftColor: PDF_COLORS.accent,
  },
  citationTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: PDF_COLORS.secondary,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  citationText: {
    fontSize: 8,
    color: PDF_COLORS.secondary,
    marginBottom: 3,
    lineHeight: 1.4,
  },

  // Disclaimer
  disclaimerText: {
    fontSize: 7.5,
    color: PDF_COLORS.muted,
    lineHeight: 1.4,
    fontStyle: 'italic',
  },

  // Section
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Newsreader',
    fontSize: 12,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLORS.border,
    paddingBottom: 4,
  },
  paragraph: {
    fontSize: 9,
    color: PDF_COLORS.primary,
    lineHeight: 1.5,
    marginBottom: 6,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 54,
    right: 54,
    borderTopWidth: 0.5,
    borderTopColor: PDF_COLORS.border,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  footerText: {
    fontSize: 7,
    color: PDF_COLORS.muted,
    lineHeight: 1.4,
  },
  footerPageNumber: {
    fontSize: 7,
    color: PDF_COLORS.muted,
  },
});

// ---------------------------------------------------------------------------
// Reusable Components (exported for use in templates)
// ---------------------------------------------------------------------------

export const DISCLAIMER_TEXT =
  'This document is generated for informational purposes only. It does not constitute legal advice. ' +
  'Always verify computations with a licensed Philippine attorney before use in legal proceedings. ' +
  'Interest computations follow Nacar v. Gallery Frames, G.R. No. 189871 (2013).';
