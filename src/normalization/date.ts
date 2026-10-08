/**
 * NEXUS AI — Date & Temporal Normalizer
 *
 * Deterministically parses and standardizes dates across Indian, US, ISO, and fiscal formats:
 * Examples:
 *   - "15/01/2024", "15-01-2024", "2024-01-15" -> Day granularity ISO 2024-01-15
 *   - "15-Jan-2024", "January 15, 2024" -> Day granularity ISO 2024-01-15
 *   - "Jan 2024", "January 2024", "01/2024" -> Month granularity 2024-01
 *   - "Q1 2024", "FY2023-24" -> Quarter / Fiscal granularity
 */

import type { NormalizedTime, TimeGranularity } from '../models/types.ts';

const MONTH_NAMES: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

export function normalizeDateString(raw: string | number | undefined | null): NormalizedTime {
  if (raw === undefined || raw === null) {
    return { granularity: 'UNSPECIFIED' };
  }

  const str = raw.toString().trim();
  if (!str) {
    return { granularity: 'UNSPECIFIED' };
  }

  // 1. Quarter / FY format: e.g. "Q1 2024", "2024 Q3", "FY 2024", "FY2023-24"
  const quarterMatch = str.match(/\bQ([1-4])\s*[-/]?\s*(\d{4})\b/i) || str.match(/\b(\d{4})\s*[-/]?\s*Q([1-4])\b/i);
  if (quarterMatch) {
    const q = quarterMatch[1].length === 1 ? quarterMatch[1] : quarterMatch[2];
    const y = parseInt(quarterMatch[1].length === 4 ? quarterMatch[1] : quarterMatch[2], 10);
    const startMonth = (parseInt(q, 10) - 1) * 3 + 1;
    const iso = new Date(Date.UTC(y, startMonth - 1, 1)).toISOString();
    return {
      raw_time: str,
      iso_timestamp: iso,
      date_string: `${y}-Q${q}`,
      year: y,
      month: startMonth,
      quarter: `${y}-Q${q}`,
      granularity: 'QUARTER',
    };
  }

  const fyMatch = str.match(/\bFY\s*(\d{4})(?:-(\d{2,4}))?\b/i);
  if (fyMatch) {
    const y = parseInt(fyMatch[1], 10);
    return {
      raw_time: str,
      iso_timestamp: new Date(Date.UTC(y, 3, 1)).toISOString(), // Apr 1
      date_string: `FY${y}`,
      year: y,
      month: 4,
      granularity: 'YEAR',
    };
  }

  // 2. Year only: "2024"
  if (/^\d{4}$/.test(str)) {
    const y = parseInt(str, 10);
    return {
      raw_time: str,
      iso_timestamp: new Date(Date.UTC(y, 0, 1)).toISOString(),
      date_string: `${y}`,
      year: y,
      granularity: 'YEAR',
    };
  }

  // 3. Month & Year: "Jan 2024", "January 2024", "01/2024", "2024-01"
  const monthYearWord = str.match(/^([a-zA-Z]+)[,\s]+(\d{4})$/);
  if (monthYearWord) {
    const mWord = monthYearWord[1].toLowerCase();
    const mNum = MONTH_NAMES[mWord];
    const y = parseInt(monthYearWord[2], 10);
    if (mNum) {
      const padM = mNum.toString().padStart(2, '0');
      return {
        raw_time: str,
        iso_timestamp: new Date(Date.UTC(y, mNum - 1, 1)).toISOString(),
        date_string: `${y}-${padM}`,
        year: y,
        month: mNum,
        granularity: 'MONTH',
      };
    }
  }

  const monthYearSlash = str.match(/^(\d{1,2})[/-](\d{4})$/);
  if (monthYearSlash) {
    const mNum = parseInt(monthYearSlash[1], 10);
    const y = parseInt(monthYearSlash[2], 10);
    if (mNum >= 1 && mNum <= 12) {
      const padM = mNum.toString().padStart(2, '0');
      return {
        raw_time: str,
        iso_timestamp: new Date(Date.UTC(y, mNum - 1, 1)).toISOString(),
        date_string: `${y}-${padM}`,
        year: y,
        month: mNum,
        granularity: 'MONTH',
      };
    }
  }

  const yearMonthIso = str.match(/^(\d{4})-(\d{2})$/);
  if (yearMonthIso) {
    const y = parseInt(yearMonthIso[1], 10);
    const m = parseInt(yearMonthIso[2], 10);
    return {
      raw_time: str,
      iso_timestamp: new Date(Date.UTC(y, m - 1, 1)).toISOString(),
      date_string: `${y}-${m.toString().padStart(2, '0')}`,
      year: y,
      month: m,
      granularity: 'MONTH',
    };
  }

  // 4. Day-Month-Year with word: "15-Jan-2024", "15 January 2024", "January 15, 2024"
  const dmyWord = str.match(/^(\d{1,2})[-/\s]+([a-zA-Z]+)[-/\s,]+(\d{4})$/);
  if (dmyWord) {
    const d = parseInt(dmyWord[1], 10);
    const mWord = dmyWord[2].toLowerCase();
    const m = MONTH_NAMES[mWord];
    const y = parseInt(dmyWord[3], 10);
    if (m && d >= 1 && d <= 31) {
      const padD = d.toString().padStart(2, '0');
      const padM = m.toString().padStart(2, '0');
      return {
        raw_time: str,
        iso_timestamp: new Date(Date.UTC(y, m - 1, d)).toISOString(),
        date_string: `${y}-${padM}-${padD}`,
        year: y,
        month: m,
        granularity: 'DAY',
      };
    }
  }

  const mdyWord = str.match(/^([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (mdyWord) {
    const mWord = mdyWord[1].toLowerCase();
    const m = MONTH_NAMES[mWord];
    const d = parseInt(mdyWord[2], 10);
    const y = parseInt(mdyWord[3], 10);
    if (m && d >= 1 && d <= 31) {
      const padD = d.toString().padStart(2, '0');
      const padM = m.toString().padStart(2, '0');
      return {
        raw_time: str,
        iso_timestamp: new Date(Date.UTC(y, m - 1, d)).toISOString(),
        date_string: `${y}-${padM}-${padD}`,
        year: y,
        month: m,
        granularity: 'DAY',
      };
    }
  }

  // 5. Numerical Dates: "DD/MM/YYYY" or "YYYY-MM-DD"
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    return {
      raw_time: str,
      iso_timestamp: new Date(Date.UTC(y, m - 1, d)).toISOString(),
      date_string: `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`,
      year: y,
      month: m,
      granularity: 'DAY',
    };
  }

  const slashMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slashMatch) {
    const first = parseInt(slashMatch[1], 10);
    const second = parseInt(slashMatch[2], 10);
    const y = parseInt(slashMatch[3], 10);

    // Standard in India / UK / Commonwealth is DD/MM/YYYY. If first > 12, it must be DD/MM.
    let d = first;
    let m = second;
    if (first <= 12 && second > 12) {
      // MM/DD/YYYY
      m = first;
      d = second;
    }

    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const padD = d.toString().padStart(2, '0');
      const padM = m.toString().padStart(2, '0');
      return {
        raw_time: str,
        iso_timestamp: new Date(Date.UTC(y, m - 1, d)).toISOString(),
        date_string: `${y}-${padM}-${padD}`,
        year: y,
        month: m,
        granularity: 'DAY',
      };
    }
  }

  // Fallback: standard Date.parse
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    const dt = new Date(parsed);
    const y = dt.getUTCFullYear();
    const m = dt.getUTCMonth() + 1;
    const d = dt.getUTCDate();
    return {
      raw_time: str,
      iso_timestamp: dt.toISOString(),
      date_string: `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`,
      year: y,
      month: m,
      granularity: 'DAY',
    };
  }

  return {
    raw_time: str,
    granularity: 'UNSPECIFIED',
  };
}
