/**
 * AttributionSection — the attorney signature block.
 *
 * THIS IS WHAT MAKES THE EXPORT AN INSTRUMENT RATHER THAN A PRINTOUT. A
 * document a lawyer puts their name on states who signed it and under what
 * numbers. Before this block existed the nearest thing was a single 8-point
 * grey line inside the letterhead reading
 * `Alpha Attorney | IBP Roll No. … | PTR No. … | MCLE No. …`, which was
 * unlabelled per field, dropped whole when `counselName` was empty, and could
 * not state that a credential was missing.
 *
 * IT RENDERS UNCONDITIONALLY. It is not gated on `profile`, not gated on any
 * `PDFExportOptions` field and not gated on a value being present. A report
 * whose attribution is absent must be distinguishable on its own face from one
 * that has it — silently omitting the block would make an unsigned report look
 * exactly like a signed one, which is the silent wrongness this project ranks
 * worst. An absent value prints `NOT ON FILE`; an absent profile prints
 * `ATTORNEY ATTRIBUTION UNAVAILABLE`.
 *
 * THE LETTERHEAD CARRIES FIRM IDENTITY, THIS BLOCK CARRIES COUNSEL IDENTITY, and
 * neither states the other's facts. That division is why the credentials line
 * was removed from `FirmHeaderSection`, and the label-uniqueness test in
 * `__tests__/attribution.test.tsx` is what keeps it removed.
 *
 * It prints stored identifiers. It reads no clock, computes nothing, performs no
 * lookup, and states no article and no legal conclusion.
 */
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { FirmProfile } from '../../lib/firm-profile';

export const ATTRIBUTION_HEADING = 'Attorney Attribution';

/** Printed in place of a credential the firm profile does not hold. */
export const ATTRIBUTION_VALUE_ABSENT = 'NOT ON FILE';

/** Printed in place of the whole block when no firm profile reached the export. */
export const ATTRIBUTION_PROFILE_ABSENT =
  'ATTORNEY ATTRIBUTION UNAVAILABLE — no firm profile was loaded for this export.';

/**
 * The five labelled credentials, in print order. Each label is bound to exactly
 * one `FirmProfile` field, so a crossed pair is a visible test failure rather
 * than a coincidence that passes.
 *
 * `IBP Roll No.` is copied verbatim from the label the settings form already
 * uses, so a stored value keeps the name it was entered under.
 */
export const ATTRIBUTION_LABELS: ReadonlyArray<{ label: string; field: keyof FirmProfile }> =
  Object.freeze([
    { label: 'Counsel:', field: 'counselName' },
    { label: 'Roll of Attorneys No.:', field: 'rollOfAttorneysNo' },
    { label: 'IBP Roll No.:', field: 'ibpRollNo' },
    { label: 'PTR No.:', field: 'ptrNo' },
    { label: 'MCLE Compliance No.:', field: 'mcleComplianceNo' },
  ]);

export interface AttributionSectionProps {
  profile: FirmProfile | null;
}

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
    paddingTop: 8,
    borderTop: '1pt solid #ccc',
  },
  heading: {
    fontSize: 10,
    fontFamily: 'Times-Bold',
    marginBottom: 4,
  },
  line: {
    fontSize: 9,
  },
});

export function AttributionSection({ profile }: AttributionSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{ATTRIBUTION_HEADING}</Text>
      {profile === null ? (
        <Text style={styles.line}>{ATTRIBUTION_PROFILE_ABSENT}</Text>
      ) : (
        ATTRIBUTION_LABELS.map(({ label, field }) => {
          // Bracket-indexed read, narrowed explicitly: tsconfig sets
          // noUncheckedIndexedAccess, and a whitespace-only stored value is
          // treated as absent rather than printed as a blank.
          const v = profile[field];
          const value = typeof v === 'string' && v.trim() !== '' ? v : ATTRIBUTION_VALUE_ABSENT;
          return (
            <Text key={label} style={styles.line}>
              {label} {value}
            </Text>
          );
        })
      )}
    </View>
  );
}
