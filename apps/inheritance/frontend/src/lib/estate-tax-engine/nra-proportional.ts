/**
 * Estate Tax Engine — NRA Proportional Factor (spec §15)
 *
 * For non-resident alien decedents, ELIT and public use transfers are
 * proportional to the ratio of PH gross estate to worldwide gross estate.
 *
 * Pure function; no side effects. All monetary values in centavos (integer).
 */

// ── Error types ───────────────────────────────────────────────────────────────

export class NRAProportionalError extends Error {
  constructor(
    message: string,
    public readonly code: 'ERR_WORLDWIDE_ESTATE_ZERO' | 'ERR_PH_EXCEEDS_WORLDWIDE',
  ) {
    super(message);
    this.name = 'NRAProportionalError';
  }
}

// ── computeNRAFactor ──────────────────────────────────────────────────────────

/**
 * Compute the NRA proportional factor: grossEstatePH / worldwideGrossEstate.
 *
 * Returns:
 * - `null` when decedent is not NRA
 * - A number in [0, 1] representing the PH fraction of the worldwide estate
 *
 * Throws NRAProportionalError when:
 * - worldwideGrossEstate === 0 (ERR_WORLDWIDE_ESTATE_ZERO)
 * - grossEstatePH > worldwideGrossEstate (ERR_PH_EXCEEDS_WORLDWIDE)
 */
export function computeNRAFactor(
  isNRA: boolean,
  grossEstatePH: number,
  worldwideGrossEstate: number,
): number | null {
  if (!isNRA) {
    return null;
  }

  if (worldwideGrossEstate === 0) {
    throw new NRAProportionalError(
      'Worldwide gross estate cannot be zero for NRA proportional factor computation.',
      'ERR_WORLDWIDE_ESTATE_ZERO',
    );
  }

  if (grossEstatePH > worldwideGrossEstate) {
    throw new NRAProportionalError(
      'Philippine gross estate cannot exceed the worldwide gross estate.',
      'ERR_PH_EXCEEDS_WORLDWIDE',
    );
  }

  return grossEstatePH / worldwideGrossEstate;
}
