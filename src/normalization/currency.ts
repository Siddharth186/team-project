/**
 * NEXUS AI — Currency Normalizer
 *
 * Deterministically normalizes amounts across multiple currencies, units, and notation systems:
 * Examples:
 *   - "₹15 lakh", "1500000 INR", "Rs. 15,00,000", "15L" -> INR: 1,500,000
 *   - "1.5 Cr", "1.5 crore", "Rs 1.5 Crores" -> INR: 15,000,000
 *   - "31.5K", "31,500" -> INR: 31,500
 *   - "$50,000", "50000 USD" -> USD: 50,000
 */

import type { NormalizedCurrency, NormalizedValue } from '../models/types.ts';

interface ScaleMultiplier {
  regex: RegExp;
  multiplier: number;
  scaleName: string;
}

const SCALE_MULTIPLIERS: ScaleMultiplier[] = [
  { regex: /(?:\b|(?<=\d))(crore|crores|cr)\b/i, multiplier: 10_000_000, scaleName: 'CRORE' },
  { regex: /(?:\b|(?<=\d))(lakh|lakhs|lac|lacs|l)\b/i, multiplier: 100_000, scaleName: 'LAKH' },
  { regex: /(?:\b|(?<=\d))(million|mn|m)\b/i, multiplier: 1_000_000, scaleName: 'MILLION' },
  { regex: /(?:\b|(?<=\d))(billion|bn|b)\b/i, multiplier: 1_000_000_000, scaleName: 'BILLION' },
  { regex: /(?:\b|(?<=\d))(thousand|thousands|k)\b/i, multiplier: 1_000, scaleName: 'THOUSAND' },
];

export function normalizeCurrencyString(raw: string | number, defaultCurrency = 'INR'): NormalizedCurrency | null {
  if (raw === null || raw === undefined) return null;

  if (typeof raw === 'number') {
    return {
      amount: Math.round(raw * 100) / 100,
      currency: defaultCurrency,
      formatted: `${defaultCurrency} ${raw.toLocaleString('en-IN')}`,
    };
  }

  const str = raw.toString().trim();
  if (!str) return null;

  // Detect currency symbol or code
  let currency = defaultCurrency;
  if (/(\$|USD)/i.test(str)) {
    currency = 'USD';
  } else if (/(€|EUR)/i.test(str)) {
    currency = 'EUR';
  } else if (/(£|GBP)/i.test(str)) {
    currency = 'GBP';
  } else if (/(₹|rs\.?|inr|rupees?)/i.test(str)) {
    currency = 'INR';
  }

  // Remove currency symbols & words
  let cleaned = str
    .replace(/(₹|rs\.?|inr|rupees?|\$|usd|€|eur|£|gbp)/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Check scale multipliers (Lakh, Crore, K, etc.)
  let multiplier = 1;
  let scaleName: string | undefined = undefined;

  for (const scale of SCALE_MULTIPLIERS) {
    if (scale.regex.test(cleaned)) {
      multiplier = scale.multiplier;
      scaleName = scale.scaleName;
      cleaned = cleaned.replace(scale.regex, '').trim();
      break;
    }
  }

  // Handle commas in Indian/Western notation: e.g. "15,00,000" or "1,500,000"
  cleaned = cleaned.replace(/,/g, '').trim();

  // Extract primary floating point number
  const numMatch = cleaned.match(/[-+]?[0-9]*\.?[0-9]+/);
  if (!numMatch) {
    return null;
  }

  const baseNumber = parseFloat(numMatch[0]);
  if (isNaN(baseNumber)) return null;

  const totalAmount = Math.round(baseNumber * multiplier * 100) / 100;

  // Format nicely for humans
  const formattedLocale = currency === 'INR' ? 'en-IN' : 'en-US';
  const prefix = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : `${currency} `;
  let formatted = `${prefix}${totalAmount.toLocaleString(formattedLocale)}`;
  if (scaleName) {
    formatted += ` (${baseNumber} ${scaleName.toLowerCase()})`;
  }

  return {
    amount: totalAmount,
    currency,
    formatted,
    scale: scaleName,
  };
}

export function normalizeCurrencyValue(raw: string | number, defaultCurrency = 'INR'): NormalizedValue {
  const norm = normalizeCurrencyString(raw, defaultCurrency);
  if (!norm) {
    return {
      data_type: 'CURRENCY',
      raw_value: raw,
      standardized_representation: String(raw),
    };
  }

  return {
    data_type: 'CURRENCY',
    raw_value: raw,
    parsed_numeric: norm.amount,
    parsed_currency: norm,
    unit: norm.currency,
    standardized_representation: `${norm.currency}:${norm.amount.toFixed(2)}`,
  };
}
