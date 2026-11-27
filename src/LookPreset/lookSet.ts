import type { FieldLookConfig } from '@dloizides/ui-forms';

import { TableLook } from '../DataTable/TableLookName';
import { ChipSize } from '../FacetFilters/ChipSize';
import type { ChipLook } from '../FacetFilters/components/ChipLook';
import { SearchFieldLook } from '../FacetFilters/SearchFieldLook';
import { TextButtonVariant } from '../FacetFilters/TextButtonVariant';
import { LookPreset } from './LookPreset';

/** The look of every list part: table header and rows, filter chips, search field, form field size and label voice. */
export interface LookSet {
  table: TableLook;
  chips: ChipLook;
  searchField: SearchFieldLook;
  field: FieldLookConfig;
}

/** Per-part changes laid over a preset; a part left out keeps the preset's look. */
export interface LookSetOverrides {
  table?: TableLook;
  chips?: Partial<ChipLook>;
  searchField?: SearchFieldLook;
  field?: FieldLookConfig;
}

const STANDARD: LookSet = {
  table: TableLook.Default,
  chips: { size: ChipSize.Regular, addFilter: TextButtonVariant.Plain },
  searchField: SearchFieldLook.Plain,
  field: {},
};

const DENSE: LookSet = {
  table: TableLook.Banded,
  chips: { size: ChipSize.Compact, addFilter: TextButtonVariant.DashedChip },
  searchField: SearchFieldLook.Framed,
  field: { size: 'compact', labelVariant: 'caption' },
};

/** The part looks of a preset with the overrides laid over it. */
export function resolveLookSet(preset: LookPreset, overrides: LookSetOverrides = {}): LookSet {
  const base = preset === LookPreset.Dense ? DENSE : STANDARD;
  return {
    table: overrides.table ?? base.table,
    chips: { size: overrides.chips?.size ?? base.chips.size, addFilter: overrides.chips?.addFilter ?? base.chips.addFilter },
    searchField: overrides.searchField ?? base.searchField,
    field: { ...base.field, ...overrides.field },
  };
}

/** The field look with only the keys that carry a value, so an unset override never blanks a preset key. */
export function definedField(size: FieldLookConfig['size'], labelVariant: FieldLookConfig['labelVariant']): FieldLookConfig {
  return { ...(size !== undefined ? { size } : {}), ...(labelVariant !== undefined ? { labelVariant } : {}) };
}

/** Whether a preset sets any field key; with none, fields keep an outer FieldLookProvider or the kit defaults. */
export function hasFieldLook(field: FieldLookConfig): boolean {
  return field.size !== undefined || field.labelVariant !== undefined;
}
