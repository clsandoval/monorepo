/**
 * WarningsSection — the engine's manual-review flags, printed in the document.
 * Spec: §4.1 section 7
 *
 * THIS SECTION RENDERS THE ARRAY `src/lib/warnings-lines.ts` BUILDS, and the
 * results screen (`components/results/WarningsPanel.tsx`) renders the same one,
 * so the two surfaces cannot disagree about a warning. Before that model
 * existed this file composed its own layout and printed `[category] description`
 * with no severity and without naming the heir the flag pointed at, while the
 * screen printed both — the exported page read
 * `[RA_11642_RETROACTIVITY] A pre-2022 adoption decree …` and never mentioned
 * `Adopted Child`.
 *
 * This component composes no warning text of its own: it does not read a flag's
 * raw category, does not classify severity, and resolves no heir id. It prints
 * the four fields it is handed.
 *
 * Every string goes through `toPdfSafeText`. Neither committed warning
 * description contains the peso sign today, but a future engine warning quoting
 * a peso amount would otherwise reach the page as the byte the PDF's
 * non-embedded WinAnsi fonts cannot represent — the exact defect `pdf-text.ts`
 * was written for.
 */
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { ManualFlag, InheritanceShare } from '../../types';
import { buildWarningLines, WARNINGS_HEADING, RELATED_HEIR_LABEL } from '../../lib/warnings-lines';
import { toPdfSafeText } from './pdf-text';

export interface WarningsSectionProps {
  warnings: ManualFlag[];
  shares: InheritanceShare[];
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
  },
  heading: {
    fontSize: 12,
    fontFamily: 'Times-Bold',
    marginBottom: 6,
  },
  warning: {
    fontSize: 9,
    marginBottom: 2,
    paddingLeft: 8,
  },
  relatedHeir: {
    fontSize: 9,
    marginBottom: 2,
    paddingLeft: 16,
  },
});

export function WarningsSection({ warnings, shares }: WarningsSectionProps) {
  const lines = buildWarningLines(warnings, shares);
  if (lines.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{toPdfSafeText(WARNINGS_HEADING)}</Text>
      {lines.map((line, i) => (
        <View key={i}>
          <Text style={styles.warning}>
            [{toPdfSafeText(line.severity)}] [{toPdfSafeText(line.category)}]{' '}
            {toPdfSafeText(line.description)}
          </Text>
          {line.relatedHeirName !== null && (
            <Text style={styles.relatedHeir}>
              {toPdfSafeText(RELATED_HEIR_LABEL)} {toPdfSafeText(line.relatedHeirName)}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
