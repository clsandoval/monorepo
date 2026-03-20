/**
 * Estate Tax Engine — Sec. 87 Exclusions (spec §7)
 *
 * Pre-computation step: assets listed as Sec. 87 exempt are EXCLUDED from gross
 * estate entirely. The caller is responsible for not including these assets in
 * Items 29–34.
 *
 * Pure function; no side effects. All monetary values in centavos (integer).
 */

import type { Sec87ExemptAsset, Sec87ExclusionEntry } from './types';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Sec87ExclusionsResult {
  exclusionLog: Sec87ExclusionEntry[];
}

// ── Reason strings per exemptionType ─────────────────────────────────────────

const REASON_MAP: Record<string, string> = {
  USUFRUCT_MERGER:
    'Sec. 87(a): Merger of personal usufruct into naked ownership — excluded from gross estate',
  FIDUCIARY:
    'Sec. 87(b): Fiduciary transmission — excluded from gross estate of fiduciary heir',
  FIDEICOMMISSARY:
    'Sec. 87(c): Fideicommissary transmission — excluded from gross estate',
  CHARITABLE_PRIVATE:
    'Sec. 87(d): Bequest to qualifying private charitable institution — excluded from gross estate',
};

// ── applySec87Exclusions ──────────────────────────────────────────────────────

/**
 * Process the list of Sec. 87 exempt assets and return an exclusion log.
 * Each entry records the asset, its exemption type, FMV, and reason text.
 *
 * The exclusion log is informational. The caller must ensure these assets are
 * NOT included in gross estate (Items 29–34).
 */
export function applySec87Exclusions(sec87ExemptAssets: Sec87ExemptAsset[]): Sec87ExclusionsResult {
  const exclusionLog: Sec87ExclusionEntry[] = [];

  for (const asset of sec87ExemptAssets) {
    const reason =
      REASON_MAP[asset.exemptionType] ??
      `Unknown exemption type: ${asset.exemptionType} — excluded from gross estate`;

    exclusionLog.push({
      assetDescription: asset.description,
      exemptionType: asset.exemptionType,
      fmv: asset.fmv,
      reason,
    });
  }

  return { exclusionLog };
}
