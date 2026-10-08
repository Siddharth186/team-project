/**
 * NEXUS AI — Master Fact Normalization Engine
 *
 * Dispatches normalization based on attribute type, detected patterns, and units.
 */

import type { NormalizedValue, NormalizedTime } from '../models/types.ts';
import { normalizeCurrencyValue, normalizeCurrencyString } from './currency.ts';
import { normalizeDateString } from './date.ts';
import { normalizeNumberValue } from './number.ts';
import { normalizeIdentifier, normalizeCategorical, normalizePersonName, normalizeGeneralText } from './text.ts';

const CURRENCY_ATTRIBUTES = new Set([
  'monthly_income',
  'annual_income',
  'income',
  'salary',
  'salary_credit',
  'loan_amount',
  'loan_amount_requested',
  'requested_amount',
  'budget',
  'turnover',
  'annual_turnover',
  'bank_balance',
  'balance',
  'net_worth',
  'claim_amount',
  'premium',
  'rent',
  'total_assets',
  'total_liabilities',
  'emi_amount',
]);

const DATE_ATTRIBUTES = new Set([
  'date_of_birth',
  'dob',
  'application_date',
  'statement_date',
  'joining_date',
  'employment_start_date',
  'issue_date',
  'expiry_date',
  'transaction_date',
  'incident_date',
  'effective_date',
]);

const IDENTIFIER_ATTRIBUTES = new Set([
  'pan',
  'pan_number',
  'aadhaar',
  'aadhaar_number',
  'passport',
  'passport_number',
  'phone',
  'mobile',
  'contact_number',
  'email',
  'bank_account',
  'account_number',
  'voter_id',
]);

const PERCENTAGE_ATTRIBUTES = new Set([
  'interest_rate',
  'tax_rate',
  'ltv_ratio',
  'shareholding_percentage',
  'equity_share',
]);

export function normalizeFactValue(
  attribute: string,
  raw_value: any,
  raw_time?: string
): NormalizedValue {
  if (raw_value === null || raw_value === undefined) {
    return {
      data_type: 'TEXT',
      raw_value: '',
      standardized_representation: '',
    };
  }

  const attrLower = attribute.toLowerCase();

  // 1. Currency attributes
  if (CURRENCY_ATTRIBUTES.has(attrLower)) {
    return normalizeCurrencyValue(raw_value);
  }

  // 2. Date attributes
  if (DATE_ATTRIBUTES.has(attrLower)) {
    const normDate = normalizeDateString(raw_value);
    return {
      data_type: 'DATE',
      raw_value,
      parsed_date: normDate,
      standardized_representation: normDate.date_string || String(raw_value),
    };
  }

  // 3. Percentage attributes
  if (PERCENTAGE_ATTRIBUTES.has(attrLower)) {
    return normalizeNumberValue(raw_value, true);
  }

  // 4. Identifier attributes
  if (IDENTIFIER_ATTRIBUTES.has(attrLower)) {
    const normId = normalizeIdentifier(attrLower, String(raw_value));
    return {
      data_type: 'IDENTIFIER',
      raw_value,
      parsed_text: normId,
      standardized_representation: normId,
    };
  }

  // 5. Categorical attributes
  if (attrLower.includes('status') || attrLower.includes('type') || attrLower === 'gender') {
    const normCat = normalizeCategorical(attrLower, String(raw_value));
    return {
      data_type: 'TEXT',
      raw_value,
      parsed_text: normCat,
      standardized_representation: normCat,
    };
  }

  // 6. Person name attribute
  if (attrLower.includes('name') && !attrLower.includes('company') && !attrLower.includes('bank')) {
    const normName = normalizePersonName(String(raw_value));
    return {
      data_type: 'TEXT',
      raw_value,
      parsed_text: normName.canonical_name,
      standardized_representation: normName.canonical_name,
    };
  }

  // 7. Heuristic detection based on value string
  const str = String(raw_value).trim();

  // If currency symbols/keywords present
  if (/(₹|rs\.?|inr|\$|usd|€|eur|£|gbp|lakh|crore)/i.test(str)) {
    return normalizeCurrencyValue(raw_value);
  }

  // If percentage symbol present
  if (str.includes('%')) {
    return normalizeNumberValue(raw_value, true);
  }

  // If strictly numeric
  if (!isNaN(Number(str.replace(/,/g, ''))) && str !== '') {
    return normalizeNumberValue(raw_value, false);
  }

  // Fallback to normalized general text
  const cleanText = normalizeGeneralText(str);
  return {
    data_type: 'TEXT',
    raw_value,
    parsed_text: cleanText,
    standardized_representation: cleanText,
  };
}

export { normalizeCurrencyString, normalizeCurrencyValue } from './currency.ts';
export { normalizeDateString } from './date.ts';
export { normalizeNumberValue } from './number.ts';
export { normalizePersonName, normalizeIdentifier, normalizeCategorical, normalizeGeneralText } from './text.ts';
