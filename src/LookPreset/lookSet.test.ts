import { TableLook } from '../DataTable/TableLookName';
import { ChipSize } from '../FacetFilters/ChipSize';
import { SearchFieldLook } from '../FacetFilters/SearchFieldLook';
import { TextButtonVariant } from '../FacetFilters/TextButtonVariant';
import { LookPreset } from './LookPreset';
import { definedField, hasFieldLook, resolveLookSet } from './lookSet';

describe('resolveLookSet', () => {
  it('with the Standard preset, returns the package default looks', () => {
    const set = resolveLookSet(LookPreset.Standard);

    expect(set).toEqual({ table: TableLook.Default, chips: { size: ChipSize.Regular, addFilter: TextButtonVariant.Plain }, searchField: SearchFieldLook.Plain, field: {} });
  });

  it('with the Dense preset, returns banded table, compact dashed chips and framed search', () => {
    const set = resolveLookSet(LookPreset.Dense);

    expect(set).toEqual({ table: TableLook.Banded, chips: { size: ChipSize.Compact, addFilter: TextButtonVariant.DashedChip }, searchField: SearchFieldLook.Framed, field: { size: 'compact', labelVariant: 'caption' } });
  });

  it('with a chip size override, keeps the preset add-filter look', () => {
    const set = resolveLookSet(LookPreset.Dense, { chips: { size: ChipSize.Regular } });

    expect(set.chips).toEqual({ size: ChipSize.Regular, addFilter: TextButtonVariant.DashedChip });
  });

  it('with table and search overrides, replaces only those parts', () => {
    const set = resolveLookSet(LookPreset.Dense, { table: TableLook.Default, searchField: SearchFieldLook.Plain });

    expect(set).toEqual({ table: TableLook.Default, chips: { size: ChipSize.Compact, addFilter: TextButtonVariant.DashedChip }, searchField: SearchFieldLook.Plain, field: { size: 'compact', labelVariant: 'caption' } });
  });
  it('with a field label override, keeps the preset field size', () => {
    const set = resolveLookSet(LookPreset.Dense, { field: definedField(undefined, 'field') });

    expect(set.field).toEqual({ size: 'compact', labelVariant: 'field' });
  });
});

describe('hasFieldLook', () => {
  it('with no key set, returns false', () => {
    const field = definedField(undefined, undefined);

    const result = hasFieldLook(field);

    expect(result).toBe(false);
  });
});
