/**
 * NEXUS AI — Number & Percentage Normalizer
 *
 * Deterministically parses numeric values, units, and percentages:
 * Examples:
 *   - "42%", "15.5%" -> PERCENTAGE: 42 or 15.5
 *   - "10,000.50", "42000" -> NUMBER: 42000
 */

import type { NormalizedValue } from '../models/types.ts';

export function normalizeNumberValue(raw: string | number, isPercentage = false): NormalizedValue {
  if (typeof raw === 'number') {
    return {
      data_type: isPercentage ? 'PERCENTAGE' : 'NUMBER',
      raw_value: raw,
      parsed_numeric: raw,
      unit: isPercentage ? 'PERCENT' : undefined,
      standardized_representation: isPercentage ? `${raw}%` : raw.toString(),
    };
  }

  const str = raw.toString().trim();
  const hasPercent = str.includes('%') || isPercentage;

  let cleaned = str.replace(/%/g, '').replace(/,/g, '').trim();

  // Multipliers for plain numbers
  let multiplier = 1;
  if (/\b(crore|crores|cr)\b/i.test(cleaned)) {
    multiplier = 10_000_000;
    cleaned = cleaned.replace(/\b(crore|crores|cr)\b/i, '').trim();
  } else if (/\b(lakh|lakhs|lac|lacs|l)\b/i.test(cleaned)) {
    multiplier = 100_000;
    cleaned = cleaned.replace(/\b(lakh|lakhs|lac|lacs|l)\b/i, '').trim();
  } else if (/\b(thousand|thousands|k)\b/i.test(cleaned)) {
    multiplier = 1_000;
    cleaned = cleaned.replace(/\b(thousand|thousands|k)\b/i, '').trim();
  }

  const match = cleaned.match(/[-+]?[0-9]*\.?[0-9]+/);
  if (!match) {
    return {
      data_type: 'TEXT',
      raw_value: raw,
      standardized_representation: str,
    };
  }

  const parsed = parseFloat(match[0]) * multiplier;

  if (hasPercent) {
    return {
      data_type: 'PERCENTAGE',
      raw_value: raw,
      parsed_numeric: parsed,
      unit: 'PERCENT',
      standardized_representation: `${parsed.toFixed(2)}%`,
    };
  }

  return {
    data_type: 'NUMBER',
    raw_value: raw,
    parsed_numeric: parsed,
    standardized_representation: parsed.toString(),
  };
}
