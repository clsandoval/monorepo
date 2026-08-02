/**
 * FirmHeaderSection — Firm logo, name and address.
 * Spec: §4.1 section 1
 *
 * Counsel's name and identifying numbers moved to `AttributionSection.tsx`, so
 * the document states them once, under their own labels, with an explicit
 * marker when a value is absent — instead of the single unlabelled grey line
 * that used to sit here and vanished whole whenever `counselName` was empty.
 * The letterhead carries firm identity; the attribution block carries counsel
 * identity.
 */
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import type { FirmProfile } from '../../lib/firm-profile';

export interface FirmHeaderSectionProps {
  profile: FirmProfile;
  logoDataUrl?: string | null;
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
    borderBottom: '2pt solid #1E3A5F',
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
  },
  firmInfo: {
    flex: 1,
  },
  firmName: {
    fontSize: 14,
    fontFamily: 'Times-Bold',
  },
  firmAddress: {
    fontSize: 9,
    color: '#555',
    marginTop: 2,
  },
});

export function FirmHeaderSection({ profile, logoDataUrl }: FirmHeaderSectionProps) {
  const borderColor = profile.letterheadColor || '#1E3A5F';

  return (
    <View style={[styles.header, { borderBottomColor: borderColor }]}>
      <View style={styles.headerRow}>
        {logoDataUrl && (
          <Image style={styles.logo} src={logoDataUrl} />
        )}
        <View style={styles.firmInfo}>
          {profile.firmName && (
            <Text style={styles.firmName}>{profile.firmName}</Text>
          )}
          {profile.firmAddress && (
            <Text style={styles.firmAddress}>{profile.firmAddress}</Text>
          )}
        </View>
      </View>
    </View>
  );
}
