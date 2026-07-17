import { isUnmatched, suggestOptions } from './suggest';
import type { FilterOption } from '../types';

const COUNTRIES: readonly FilterOption[] = [
  { label: 'Cyprus', value: 'CY' },
  { label: 'Czechia', value: 'CZ' },
  { label: 'Canada', value: 'CA' },
  { label: 'Germany', value: 'DE' },
  { label: 'Cayman Islands', value: 'KY' },
];

describe('suggestOptions', () => {
  it('returns nothing until minChars is reached', () => {
    expect(suggestOptions(COUNTRIES, '', 1, 8)).toEqual([]);
    expect(suggestOptions(COUNTRIES, 'c', 2, 8)).toEqual([]);
    expect(suggestOptions(COUNTRIES, '  ', 1, 8)).toEqual([]);
  });

  it('ranks an exact value match first', () => {
    const out = suggestOptions(COUNTRIES, 'cy', 1, 8);
    expect(out[0]?.value).toBe('CY');
  });

  it('ranks value-prefix above label-prefix above label-contains', () => {
    // "ca" → value prefix (CA Canada, KY? no) ; label prefix (Canada, Cayman) ; label contains
    const out = suggestOptions(COUNTRIES, 'ca', 1, 8).map((o) => o.value);
    // CA is a value prefix match, so it must come before the pure label matches.
    expect(out[0]).toBe('CA');
    expect(out).toContain('KY'); // "Cayman Islands" label-prefix
  });

  it('breaks rank ties by label localeCompare', () => {
    const out = suggestOptions(COUNTRIES, 'c', 1, 8).map((o) => o.label);
    // CA/CY/CZ are value-prefix (rank 1, alphabetical by label); "Cayman Islands" (KY) is only a
    // label-prefix (rank 2) so it sorts LAST despite its label — rank dominates the localeCompare.
    expect(out).toEqual(['Canada', 'Cyprus', 'Czechia', 'Cayman Islands']);
  });

  it('caps the results at the limit', () => {
    expect(suggestOptions(COUNTRIES, 'c', 1, 2)).toHaveLength(2);
  });

  it('matches a label substring (contains)', () => {
    const out = suggestOptions(COUNTRIES, 'many', 1, 8).map((o) => o.value);
    expect(out).toEqual(['DE']); // "Germany" contains "many"
  });
});

describe('isUnmatched', () => {
  it('is false for an empty string', () => {
    expect(isUnmatched(COUNTRIES, '')).toBe(false);
    expect(isUnmatched(COUNTRIES, '   ')).toBe(false);
  });

  it('is false when the text equals a value or label (case-insensitive)', () => {
    expect(isUnmatched(COUNTRIES, 'cy')).toBe(false);
    expect(isUnmatched(COUNTRIES, 'Cyprus')).toBe(false);
    expect(isUnmatched(COUNTRIES, '  CYPRUS ')).toBe(false);
  });

  it('is true for non-empty text that matches nothing exactly', () => {
    expect(isUnmatched(COUNTRIES, 'Atlantis')).toBe(true);
    expect(isUnmatched(COUNTRIES, 'Cy')).toBe(false); // matches value CY
    expect(isUnmatched(COUNTRIES, 'Cypru')).toBe(true); // partial, not exact
  });
});
