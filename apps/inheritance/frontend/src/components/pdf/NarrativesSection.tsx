/**
 * NarrativesSection — Verbatim EngineOutput.narratives[].
 * Spec: §4.1 section 5
 *
 * The engine writes markdown emphasis into `narratives[].text` — measured over
 * all twenty committed engine cases, every one produces at least one narrative
 * containing `**`. `@react-pdf/renderer` does not parse markdown, so those
 * markers would otherwise print verbatim on a document a lawyer sends to a
 * client. The strip reuses the product's existing `stripMarkdownBold` rather
 * than a second regular expression, so one transform owns markdown removal.
 */
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { HeirNarrative } from '../../types';
import { toPdfSafeText } from './pdf-text';
import { stripMarkdownBold } from '../results/utils';

export interface NarrativesSectionProps {
  narratives: HeirNarrative[];
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
  narrative: {
    marginBottom: 6,
  },
  heirName: {
    fontSize: 10,
    fontFamily: 'Times-Bold',
    marginBottom: 2,
  },
  text: {
    fontSize: 9,
    lineHeight: 1.4,
  },
});

export function NarrativesSection({ narratives }: NarrativesSectionProps) {
  if (narratives.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Heir Narratives</Text>
      {narratives.map((n) => (
        <View key={n.heir_id} style={styles.narrative}>
          <Text style={styles.heirName}>{n.heir_name}</Text>
          <Text style={styles.text}>{toPdfSafeText(stripMarkdownBold(n.text))}</Text>
        </View>
      ))}
    </View>
  );
}
