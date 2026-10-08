/**
 * NEXUS AI — Text, Name, Identifier, & Categorical Normalizer
 *
 * Normalizes names, government identifiers, categorical values, and text attributes:
 * Examples:
 *   - "Mr. Ramesh Kumar", "R. Kumar", "RAMESH KUMAR", "Ramesh K." -> Normalized tokens
 *   - "abcde1234f" -> "ABCDE1234F" (PAN format)
 *   - "+91-98765-43210" -> "9876543210" (Phone format)
 *   - "Salaried Employee", "salaried", "FULL TIME SALARIED" -> "SALARIED"
 */

const HONORIFICS_REGEX = /^(mr|mrs|ms|miss|dr|prof|shri|smt|kumari)\.?\s+/i;

export interface NormalizedName {
  canonical_name: string;      // e.g. "Ramesh Kumar"
  first_name: string;          // e.g. "Ramesh"
  last_name: string;           // e.g. "Kumar"
  tokens: string[];            // e.g. ["ramesh", "kumar"]
  initials: string[];          // e.g. ["r", "k"]
  raw_name: string;
}

export function normalizePersonName(raw: string): NormalizedName {
  if (!raw) {
    return {
      canonical_name: '',
      first_name: '',
      last_name: '',
      tokens: [],
      initials: [],
      raw_name: '',
    };
  }

  let cleaned = raw.trim().replace(HONORIFICS_REGEX, '').trim();
  // Remove special characters other than letters and spaces, keep period if in initials
  cleaned = cleaned.replace(/[^a-zA-Z\s.]/g, ' ').replace(/\s+/g, ' ').trim();

  // Split tokens
  const rawTokens = cleaned.split(' ').filter(Boolean);
  const tokens = rawTokens.map(t => t.replace(/\./g, '').toLowerCase());

  // Capitalize properly for canonical representation
  const capitalizedTokens = rawTokens.map(t => {
    const cleanT = t.replace(/\./g, '');
    if (cleanT.length <= 1) return cleanT.toUpperCase();
    return cleanT.charAt(0).toUpperCase() + cleanT.slice(1).toLowerCase();
  });

  const canonical = capitalizedTokens.join(' ');
  const firstName = capitalizedTokens[0] || '';
  const lastName = capitalizedTokens.length > 1 ? capitalizedTokens[capitalizedTokens.length - 1] : '';
  const initials = tokens.map(t => t[0]);

  return {
    canonical_name: canonical,
    first_name: firstName,
    last_name: lastName,
    tokens,
    initials,
    raw_name: raw,
  };
}

export function normalizeIdentifier(type: string, value: string): string {
  if (!value) return '';
  const str = value.trim();

  switch (type.toLowerCase()) {
    case 'pan':
    case 'pan_number':
      // 10 alphanumeric characters e.g. ABCDE1234F
      return str.toUpperCase().replace(/[^A-Z0-9]/g, '');

    case 'phone':
    case 'mobile':
    case 'contact': {
      // Strip everything except numbers; if 12 digits starting with 91, strip 91
      const digits = str.replace(/\D/g, '');
      if (digits.length === 12 && digits.startsWith('91')) {
        return digits.slice(2);
      }
      if (digits.length > 10) {
        return digits.slice(-10);
      }
      return digits;
    }

    case 'email':
      return str.toLowerCase().trim();

    case 'account_number':
    case 'bank_account':
    case 'account_no':
      return str.replace(/[\s-]/g, '').toUpperCase();

    case 'aadhaar':
    case 'aadhaar_number':
      return str.replace(/[\s-]/g, '');

    case 'passport':
      return str.replace(/[\s-]/g, '').toUpperCase();

    default:
      return str.replace(/\s+/g, ' ').trim();
  }
}

export function normalizeCategorical(category: string, value: string): string {
  if (!value) return '';
  const str = value.trim().toLowerCase();

  if (category === 'employment_status') {
    if (str.includes('salaried') || str.includes('full time') || str.includes('employed')) {
      return 'SALARIED';
    }
    if (str.includes('self') || str.includes('business') || str.includes('proprietor')) {
      return 'SELF_EMPLOYED';
    }
    if (str.includes('unemployed') || str.includes('not working')) {
      return 'UNEMPLOYED';
    }
    if (str.includes('retired')) {
      return 'RETIRED';
    }
    if (str.includes('student')) {
      return 'STUDENT';
    }
    if (str.includes('contract') || str.includes('freelance')) {
      return 'CONTRACT';
    }
  }

  if (category === 'marital_status') {
    if (str.includes('single') || str.includes('unmarried')) return 'SINGLE';
    if (str.includes('married')) return 'MARRIED';
    if (str.includes('divorced')) return 'DIVORCED';
    if (str.includes('widow')) return 'WIDOWED';
  }

  // Standardize generic categorical strings
  return str.toUpperCase().replace(/[\s-]+/g, '_');
}

export function normalizeGeneralText(value: string): string {
  if (!value) return '';
  return value.trim().replace(/\s+/g, ' ');
}
