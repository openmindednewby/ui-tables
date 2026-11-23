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

/** Whether the variant lays the bar out as one full-width column at this viewport width. */
export function isStackedVariant(variant: FiltersVariant, width: number, breakpoint: number): boolean {
  return variant === FiltersVariant.Bare && width < breakpoint;
}

/** The fields as laid out by the variant: every field one full row when stacked, untouched otherwise. */
export function variantFields(fields: readonly FilterField[], stacked: boolean): readonly FilterField[] {
  return stacked ? fields.map((field) => ({ ...field, gridColumns: FULL_ROW })) : fields;
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
