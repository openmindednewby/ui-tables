import type { FilterBarStyleOverrides } from '../../DataTable/FilterBar';
import { FiltersVariant } from '../FiltersVariant';
import type { FilterField } from '../types';

const FULL_ROW = 1;
const NO_BORDER = 0;
const NO_PAD = 0;

const BARE_SHELL: FilterBarStyleOverrides = {
  filters: { borderWidth: NO_BORDER, paddingHorizontal: NO_PAD, paddingVertical: NO_PAD, backgroundColor: 'transparent' },
};

const BARE_NARROW_SHELL: FilterBarStyleOverrides = {
  ...BARE_SHELL,
  filtersSpacer: { display: 'none' },
  filtersActions: { width: '100%', flexDirection: 'column', alignItems: 'stretch' },
};

const GRID_MAX_COLUMNS = 4;

/** Whether the variant lays the bar out as one full-width column at this viewport width. */
export function isStackedVariant(variant: FiltersVariant, width: number, breakpoint: number): boolean {
  return variant !== FiltersVariant.Boxed && width < breakpoint;
}

/**
 * The fields as laid out by the variant: every field one full row when stacked; for `Grid`, each field without its own
 * `gridColumns` takes an equal cell of one row of up to four; untouched otherwise.
 */
export function variantFields(fields: readonly FilterField[], stacked: boolean, variant: FiltersVariant = FiltersVariant.Boxed): readonly FilterField[] {
  if (stacked) return fields.map((field) => ({ ...field, gridColumns: FULL_ROW }));
  if (variant !== FiltersVariant.Grid) return fields;
  const columns = Math.min(Math.max(fields.length, 1), GRID_MAX_COLUMNS);
  return fields.map((field) => ({ ...field, gridColumns: field.gridColumns ?? columns }));
}

/**
 * The FilterBar shell styles of the variant, with the caller's overrides merged after them.
 * @returns the caller's overrides unchanged for the boxed variant.
 */
export function variantShell(
  variant: FiltersVariant,
  stacked: boolean,
  overrides: FilterBarStyleOverrides | undefined,
): FilterBarStyleOverrides | undefined {
  if (variant === FiltersVariant.Boxed) return overrides;
  const base = stacked ? BARE_NARROW_SHELL : BARE_SHELL;
  return {
    filters: [base.filters, overrides?.filters],
    filtersSpacer: [base.filtersSpacer, overrides?.filtersSpacer],
    results: overrides?.results,
    filtersActions: [base.filtersActions, overrides?.filtersActions],
  };
}
