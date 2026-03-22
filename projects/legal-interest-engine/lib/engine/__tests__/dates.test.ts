import { describe, it, expect } from 'vitest';
import { daysBetween, getInterestStartDate, splitPeriodsAtTransition } from '../dates';
import { BSP_799_EFFECTIVE } from '../constants';

describe('daysBetween', () => {
  it('returns 0 for same date', () => {
    expect(daysBetween('2020-01-01', '2020-01-01')).toBe(0);
  });

  it('returns 1 for consecutive dates', () => {
    expect(daysBetween('2020-01-01', '2020-01-02')).toBe(1);
  });

  it('returns 365 for a full non-leap year', () => {
    expect(daysBetween('2019-01-01', '2020-01-01')).toBe(365);
  });

  it('returns 366 for a leap year', () => {
    expect(daysBetween('2020-01-01', '2021-01-01')).toBe(366);
  });

  it('returns correct days spanning months', () => {
    // Jan 1 to Apr 1 = 31+28+31 = 90 days (2019 non-leap)
    expect(daysBetween('2019-01-01', '2019-04-01')).toBe(90);
  });

  it('returns correct days for a long span', () => {
    // 2010-01-01 to 2013-07-01
    // 2010: 365, 2011: 365, 2012: 366 (leap), 2013 Jan-Jul: 31+28+31+30+31+30 = 181
    // total = 365+365+366+181 = 1277
    expect(daysBetween('2010-01-01', '2013-07-01')).toBe(1277);
  });
});

describe('getInterestStartDate', () => {
  it('returns demandDate for liquidated claim', () => {
    const result = getInterestStartDate('liquidated', '2020-01-01', '2020-03-01');
    expect(result).toBe('2020-01-01');
  });

  it('returns judgmentDate for unliquidated claim when provided', () => {
    const result = getInterestStartDate('unliquidated', '2020-01-01', '2020-03-01', '2021-06-15');
    expect(result).toBe('2021-06-15');
  });

  it('throws for unliquidated claim without judgmentDate', () => {
    expect(() => {
      getInterestStartDate('unliquidated', '2020-01-01', '2020-03-01');
    }).toThrow();
  });

  it('throws for unliquidated claim with undefined judgmentDate', () => {
    expect(() => {
      getInterestStartDate('unliquidated', '2020-01-01', '2020-03-01', undefined);
    }).toThrow();
  });
});

describe('splitPeriodsAtTransition', () => {
  it('returns single period when entirely before BSP transition', () => {
    const periods = splitPeriodsAtTransition('2010-01-01', '2013-06-30');
    expect(periods).toHaveLength(1);
    expect(periods[0]).toEqual({
      start: '2010-01-01',
      end: '2013-06-30',
      regime: 'pre',
    });
  });

  it('returns single period when entirely after BSP transition', () => {
    const periods = splitPeriodsAtTransition('2013-07-01', '2020-01-01');
    expect(periods).toHaveLength(1);
    expect(periods[0]).toEqual({
      start: '2013-07-01',
      end: '2020-01-01',
      regime: 'post',
    });
  });

  it('returns single post period when start is exactly BSP transition date', () => {
    const periods = splitPeriodsAtTransition(BSP_799_EFFECTIVE, '2020-01-01');
    expect(periods).toHaveLength(1);
    expect(periods[0].regime).toBe('post');
  });

  it('splits at BSP transition when period spans it', () => {
    const periods = splitPeriodsAtTransition('2010-01-01', '2020-01-01');
    expect(periods).toHaveLength(2);
    expect(periods[0]).toEqual({
      start: '2010-01-01',
      end: '2013-06-30',
      regime: 'pre',
    });
    expect(periods[1]).toEqual({
      start: '2013-07-01',
      end: '2020-01-01',
      regime: 'post',
    });
  });

  it('handles period ending exactly at BSP transition eve', () => {
    const periods = splitPeriodsAtTransition('2012-01-01', '2013-06-30');
    expect(periods).toHaveLength(1);
    expect(periods[0].regime).toBe('pre');
    expect(periods[0].end).toBe('2013-06-30');
  });

  it('handles zero-duration period after BSP', () => {
    const periods = splitPeriodsAtTransition('2015-01-01', '2015-01-01');
    expect(periods).toHaveLength(1);
    expect(periods[0].regime).toBe('post');
  });
});
