/**
 * Display formatting utilities for the legal interest engine.
 *
 * All monetary values in the engine are stored as integers in centavos
 * (1 PHP = 100 centavos). These helpers convert engine values to
 * human-readable strings for display.
 */

/**
 * Formats a centavo amount to a Philippine Peso display string.
 *
 * @param centavos - Integer amount in centavos (e.g. 5_000_000 = ₱50,000.00)
 * @returns Formatted string with peso sign, thousands separators, and 2 decimal places
 *
 * @example
 *   formatPeso(5_000_000)   // "₱50,000.00"
 *   formatPeso(100)         // "₱1.00"
 *   formatPeso(1)           // "₱0.01"
 *   formatPeso(0)           // "₱0.00"
 *   formatPeso(-100)        // "-₱1.00"
 */
export function formatPeso(centavos: number): string {
  const isNegative = centavos < 0;
  const absCentavos = Math.abs(centavos);

  const pesos = Math.floor(absCentavos / 100);
  const cents = absCentavos % 100;

  const pesosFormatted = pesos.toLocaleString('en-PH');
  const centsFormatted = String(cents).padStart(2, '0');

  const formatted = `₱${pesosFormatted}.${centsFormatted}`;
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Formats a basis-point rate to a percentage string.
 *
 * @param bps - Rate in basis points (e.g. 600 = 6%, 1200 = 12%)
 * @returns Percentage string without trailing zero decimals
 *
 * @example
 *   formatRate(600)   // "6%"
 *   formatRate(1200)  // "12%"
 *   formatRate(150)   // "1.5%"
 *   formatRate(0)     // "0%"
 */
export function formatRate(bps: number): string {
  const pct = bps / 100;
  // Avoid unnecessary decimal places for whole numbers
  const formatted = Number.isInteger(pct) ? `${pct}` : `${pct}`;
  return `${formatted}%`;
}

/**
 * Formats a basis-point rate as a full rate label with "p.a." suffix.
 *
 * @param bps - Rate in basis points (e.g. 600 = 6%, 1200 = 12%)
 * @returns Human-readable rate label
 *
 * @example
 *   formatRateLabel(600)   // "6% p.a."
 *   formatRateLabel(1200)  // "12% p.a."
 *   formatRateLabel(150)   // "1.5% p.a."
 */
export function formatRateLabel(bps: number): string {
  return `${formatRate(bps)} p.a.`;
}
