import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeCurrencyString,
  normalizeCurrencyValue,
} from '../src/normalization/currency.ts';
import { normalizeDateString } from '../src/normalization/date.ts';
import { normalizeNumberValue } from '../src/normalization/number.ts';
import {
  normalizePersonName,
  normalizeIdentifier,
  normalizeCategorical,
} from '../src/normalization/text.ts';
import { normalizeFactValue } from '../src/normalization/index.ts';

test('Currency Normalization: Indian Lakh & Crore representations', () => {
  const lakh1 = normalizeCurrencyString('₹15 lakh');
  assert.equal(lakh1?.amount, 1500000);
  assert.equal(lakh1?.currency, 'INR');

  const lakh2 = normalizeCurrencyString('1500000 INR');
  assert.equal(lakh2?.amount, 1500000);
  assert.equal(lakh2?.currency, 'INR');

  const lakh3 = normalizeCurrencyString('Rs. 15,00,000');
  assert.equal(lakh3?.amount, 1500000);
  assert.equal(lakh3?.currency, 'INR');

  const lakh4 = normalizeCurrencyString('15L');
  assert.equal(lakh4?.amount, 1500000);

  const crore = normalizeCurrencyString('1.5 Cr');
  assert.equal(crore?.amount, 15000000);
  assert.equal(crore?.currency, 'INR');

  const thousand = normalizeCurrencyString('31.5K');
  assert.equal(thousand?.amount, 31500);

  // All 4 lakh variants should produce the same standardized representation
  const v1 = normalizeCurrencyValue('₹15 lakh');
  const v2 = normalizeCurrencyValue('1500000 INR');
  const v3 = normalizeCurrencyValue('Rs. 15,00,000');
  const v4 = normalizeCurrencyValue('15L');
  assert.equal(v1.standardized_representation, 'INR:1500000.00');
  assert.equal(v2.standardized_representation, 'INR:1500000.00');
  assert.equal(v3.standardized_representation, 'INR:1500000.00');
  assert.equal(v4.standardized_representation, 'INR:1500000.00');
});

test('Currency Normalization: International Currencies', () => {
  const usd = normalizeCurrencyString('$50,000');
  assert.equal(usd?.amount, 50000);
  assert.equal(usd?.currency, 'USD');

  const eur = normalizeCurrencyString('€2,500');
  assert.equal(eur?.amount, 2500);
  assert.equal(eur?.currency, 'EUR');
});

test('Date Normalization: Multiple calendar formats and granularities', () => {
  const d1 = normalizeDateString('15/01/2024');
  assert.equal(d1.date_string, '2024-01-15');
  assert.equal(d1.granularity, 'DAY');

  const d2 = normalizeDateString('15-Jan-2024');
  assert.equal(d2.date_string, '2024-01-15');
  assert.equal(d2.granularity, 'DAY');

  const d3 = normalizeDateString('January 2024');
  assert.equal(d3.date_string, '2024-01');
  assert.equal(d3.granularity, 'MONTH');

  const d4 = normalizeDateString('Q1 2024');
  assert.equal(d4.date_string, '2024-Q1');
  assert.equal(d4.granularity, 'QUARTER');

  const d5 = normalizeDateString('2024');
  assert.equal(d5.date_string, '2024');
  assert.equal(d5.granularity, 'YEAR');
});

test('Number & Percentage Normalization', () => {
  const p1 = normalizeNumberValue('42%');
  assert.equal(p1.parsed_numeric, 42);
  assert.equal(p1.data_type, 'PERCENTAGE');
  assert.equal(p1.standardized_representation, '42.00%');

  const n1 = normalizeNumberValue('10,000.50');
  assert.equal(n1.parsed_numeric, 10000.5);
  assert.equal(n1.data_type, 'NUMBER');
});

test('Text & Identifier Normalization', () => {
  const name1 = normalizePersonName('Mr. Ramesh Kumar');
  assert.equal(name1.canonical_name, 'Ramesh Kumar');

  const name2 = normalizePersonName('DR. SIDDHARTH SHARMA');
  assert.equal(name2.canonical_name, 'Siddharth Sharma');

  const pan = normalizeIdentifier('pan', 'abcde1234f');
  assert.equal(pan, 'ABCDE1234F');

  const phone = normalizeIdentifier('phone', '+91-98765-43210');
  assert.equal(phone, '9876543210');

  const emp = normalizeCategorical('employment_status', 'full time salaried employee');
  assert.equal(emp, 'SALARIED');
});

test('Unified normalizeFactValue dispatcher', () => {
  const income = normalizeFactValue('monthly_income', '₹42,000');
  assert.equal(income.data_type, 'CURRENCY');
  assert.equal(income.parsed_numeric, 42000);

  const dob = normalizeFactValue('date_of_birth', '15/04/1985');
  assert.equal(dob.data_type, 'DATE');
  assert.equal(dob.parsed_date?.date_string, '1985-04-15');

  const pan = normalizeFactValue('pan_number', 'abcde1234f');
  assert.equal(pan.data_type, 'IDENTIFIER');
  assert.equal(pan.standardized_representation, 'ABCDE1234F');
});
