/**
 * PerHeirBreakdownSection — Detailed per-heir breakdown with statute citations.
 * Spec: §4.1 section 4
 */
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { InheritanceShare, Person } from '../../types';
import { formatPesoPdf } from './pdf-text';
import { resolveArticle } from '../../data/ncc-articles';

export interface PerHeirBreakdownSectionProps {
  shares: InheritanceShare[];
  persons: Person[];
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
  heirBlock: {
    marginBottom: 8,
    paddingLeft: 8,
  },
  heirName: {
    fontSize: 10,
    fontFamily: 'Times-Bold',
    marginBottom: 2,
  },
  line: {
    fontSize: 9,
    marginBottom: 1,
  },
  citationHeading: {
    fontSize: 9,
    fontFamily: 'Times-Bold',
    marginTop: 3,
    marginBottom: 1,
  },
  citation: {
    fontSize: 8,
    color: '#555',
    marginBottom: 1,
    paddingLeft: 8,
  },
});

function formatCentavosIfNonZero(label: string, centavos: number | string): string | null {
  const c = typeof centavos === 'string' ? Number(centavos) : centavos;
  if (c === 0) return null;
  return `${label}: ${formatPesoPdf(centavos)}`;
}

export function PerHeirBreakdownSection({ shares }: PerHeirBreakdownSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Per-Heir Breakdown</Text>
      {shares.map((share) => {
        const lines: string[] = [];

        const fromLegitime = formatCentavosIfNonZero('From Legitime', share.from_legitime.centavos);
        if (fromLegitime) lines.push(fromLegitime);

        const fromFree = formatCentavosIfNonZero('From Free Portion', share.from_free_portion.centavos);
        if (fromFree) lines.push(fromFree);

        const fromIntestate = formatCentavosIfNonZero('From Intestate', share.from_intestate.centavos);
        if (fromIntestate) lines.push(fromIntestate);

        lines.push(`Gross Entitlement: ${formatPesoPdf(share.gross_entitlement.centavos)}`);

        const donationsImputed = typeof share.donations_imputed.centavos === 'string'
          ? Number(share.donations_imputed.centavos) : share.donations_imputed.centavos;
        if (donationsImputed > 0) {
          lines.push(`Donations Imputed: -${formatPesoPdf(share.donations_imputed.centavos)}`);
        }

        lines.push(`Net From Estate: ${formatPesoPdf(share.net_from_estate.centavos)}`);

        if (share.legitime_fraction && share.legitime_fraction !== '0/1') {
          lines.push(`Legitime Fraction: ${share.legitime_fraction}`);
        }

        return (
          <View key={share.heir_id} style={styles.heirBlock}>
            <Text style={styles.heirName}>{share.heir_name}</Text>
            {lines.map((line, i) => (
              <Text key={i} style={styles.line}>{line}</Text>
            ))}
            {share.legal_basis.length > 0 && (
              <>
                <Text style={styles.citationHeading}>Legal Basis:</Text>
                {share.legal_basis.map((key, i) => {
                  // One resolver. react-pdf primitives carry no DOM attributes, so
                  // the loud state here is the literal text — which is the correct
                  // behaviour for a document that gets printed and filed.
                  const { raw, description, resolved } = resolveArticle(key);
                  return (
                    <Text key={i} style={styles.citation}>
                      {raw}: {resolved ? description : 'CITATION NOT RESOLVED'}
                    </Text>
                  );
                })}
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}
