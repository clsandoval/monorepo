/**
 * Tests for centavo / rate formatting utilities.
 */

import { describe, it, expect } from 'vitest';
import { formatPeso, formatRate, formatRateLabel } from '../format';

// ---------------------------------------------------------------------------
// formatPeso
// ---------------------------------------------------------------------------

describe('formatPeso', () => {
  it('formats whole peso amounts correctly', () => {
    expect(formatPeso(5_000_000)).toBe('₱50,000.00');
  });

  it('formats ₱1 (100 centavos)', () => {
    expect(formatPeso(100)).toBe('₱1.00');
  });

  it('formats single centavo', () => {
    expect(formatPeso(1)).toBe('₱0.01');
  });

  it('formats zero', () => {
    expect(formatPeso(0)).toBe('₱0.00');
  });

  it('formats large amount — ₱1,000,000', () => {
    expect(formatPeso(100_000_000)).toBe('₱1,000,000.00');
  });

  it('formats amount with cents — ₱158,919.20', () => {
    // ₱158,919.20 = 15_891_920 centavos
    expect(formatPeso(15_891_920)).toBe('₱158,919.20');
  });

  it('formats amount with single-digit cents — ₱100.01', () => {
    expect(formatPeso(10_001)).toBe('₱100.01');
  });

  it('formats amount with zero cents — ₱500.00', () => {
    expect(formatPeso(50_000)).toBe('₱500.00');
  });

  it('includes peso sign ₱', () => {
    const result = formatPeso(5_000_000);
    expect(result).toMatch(/^₱/);
  });

  it('formats negative amounts with minus prefix', () => {
    const result = formatPeso(-100);
    expect(result).toBe('-₱1.00');
  });

  it('uses comma as thousands separator', () => {
    const result = formatPeso(100_000_000); // ₱1,000,000.00
    expect(result).toContain(',');
  });

  it('has two decimal places always', () => {
    const result = formatPeso(50_000); // ₱500.00
    expect(result).toMatch(/\.\d{2}$/);
  });

  it('formats ₱100,000 (the Isla principal)', () => {
    // 10_000_000 centavos = ₱100,000.00
    expect(formatPeso(10_000_000)).toBe('₱100,000.00');
  });
});

// ---------------------------------------------------------------------------
// formatRate
// ---------------------------------------------------------------------------

describe('formatRate', () => {
  it('formats 600 bps as 6%', () => {
    expect(formatRate(600)).toBe('6%');
  });

  it('formats 1200 bps as 12%', () => {
    expect(formatRate(1200)).toBe('12%');
  });

  it('formats 150 bps as 1.5%', () => {
    expect(formatRate(150)).toBe('1.5%');
  });

  it('formats 0 bps as 0%', () => {
    expect(formatRate(0)).toBe('0%');
  });

  it('formats 100 bps as 1%', () => {
    expect(formatRate(100)).toBe('1%');
  });

  it('formats 1800 bps as 18%', () => {
    expect(formatRate(1800)).toBe('18%');
  });

  it('always includes percent sign', () => {
    expect(formatRate(600)).toMatch(/%$/);
  });
});

// ---------------------------------------------------------------------------
// formatRateLabel
// ---------------------------------------------------------------------------

describe('formatRateLabel', () => {
  it('formats 600 bps as "6% p.a."', () => {
    expect(formatRateLabel(600)).toBe('6% p.a.');
  });

  it('formats 1200 bps as "12% p.a."', () => {
    expect(formatRateLabel(1200)).toBe('12% p.a.');
  });

  it('formats 150 bps as "1.5% p.a."', () => {
    expect(formatRateLabel(150)).toBe('1.5% p.a.');
  });

  it('formats 0 bps as "0% p.a."', () => {
    expect(formatRateLabel(0)).toBe('0% p.a.');
  });

  it('includes p.a. suffix', () => {
    expect(formatRateLabel(600)).toContain('p.a.');
  });

  it('includes percent sign before p.a.', () => {
    expect(formatRateLabel(600)).toMatch(/%.*p\.a\./);
  });
});
