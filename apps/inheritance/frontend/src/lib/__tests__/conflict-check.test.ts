import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ConflictCheckResult } from '@/lib/conflict-check';

const mockRpc = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

import { getSimilarityColor, runConflictCheck } from '../conflict-check';

function makeClearResult(name: string): ConflictCheckResult {
  return {
    client_matches: [],
    heir_matches: [],
    tin_matches: [],
    total_matches: 0,
    outcome: 'clear',
    checked_name: name,
    checked_tin: null,
    checked_at: '2026-03-03T12:00:00Z',
  };
}

describe('getSimilarityColor', () => {
  it('returns red "Exact" for score >= 1.00', () => {
    const result = getSimilarityColor(1.0);
    expect(result.color).toBe('red');
    expect(result.label).toBe('Exact');
    expect(result.className).toContain('red');
  });

  it('returns amber "High" for score >= 0.70', () => {
    const result = getSimilarityColor(0.82);
    expect(result.color).toBe('amber');
    expect(result.label).toBe('High');
    expect(result.className).toContain('amber');
  });

  it('returns amber "High" for score exactly 0.70', () => {
    const result = getSimilarityColor(0.7);
    expect(result.color).toBe('amber');
    expect(result.label).toBe('High');
  });

  it('returns yellow "Moderate" for score >= 0.50', () => {
    const result = getSimilarityColor(0.51);
    expect(result.color).toBe('yellow');
    expect(result.label).toBe('Moderate');
    expect(result.className).toContain('yellow');
  });

  it('returns yellow "Moderate" for score exactly 0.50', () => {
    const result = getSimilarityColor(0.5);
    expect(result.color).toBe('yellow');
    expect(result.label).toBe('Moderate');
  });

  it('returns gray "Low" for score < 0.50', () => {
    const result = getSimilarityColor(0.38);
    expect(result.color).toBe('gray');
    expect(result.label).toBe('Low');
    expect(result.className).toContain('gray');
  });

  it('returns gray "Low" for score 0', () => {
    const result = getSimilarityColor(0);
    expect(result.color).toBe('gray');
    expect(result.label).toBe('Low');
  });
});

describe('runConflictCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls supabase.rpc with correct function name and params', async () => {
    const clearResult = makeClearResult('Test Name');
    mockRpc.mockResolvedValue({ data: clearResult, error: null });

    await runConflictCheck('Test Name', '123-456-789');

    expect(mockRpc).toHaveBeenCalledWith('run_conflict_check', {
      p_name: 'Test Name',
      p_tin: '123-456-789',
    });
  });

  it('omits p_tin when tin not provided', async () => {
    const clearResult = makeClearResult('Test Name');
    mockRpc.mockResolvedValue({ data: clearResult, error: null });

    await runConflictCheck('Test Name');

    expect(mockRpc).toHaveBeenCalledWith('run_conflict_check', {
      p_name: 'Test Name',
    });
  });

  it('returns ConflictCheckResult on success', async () => {
    const expected = makeClearResult('Maria Santos');
    mockRpc.mockResolvedValue({ data: expected, error: null });

    const result = await runConflictCheck('Maria Santos');
    expect(result.outcome).toBe('clear');
    expect(result.total_matches).toBe(0);
    expect(result.checked_name).toBe('Maria Santos');
  });

  it('throws on supabase error', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'RPC failed', code: '42000' },
    });

    await expect(runConflictCheck('Test')).rejects.toEqual({
      message: 'RPC failed',
      code: '42000',
    });
  });
});
