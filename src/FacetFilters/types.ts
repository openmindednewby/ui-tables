export interface FacetOption {
  value: string;
  label: string;
}

/** One filterable dimension (status, risk, country) with its already-translated choices. */
export interface FacetDefinition {
  key: string;
  label: string;
  options: readonly FacetOption[];
}

export type FacetValues = Readonly<Record<string, readonly string[] | undefined>>;

/** Which date the range applies to (for example updated, created or reviewed) plus the range preset. */
export interface DateFilterValue {
  field: string;
  range: string;
}

/** Everything a filtered, paged list keeps in the URL. */
export interface ListFilterState {
  facets: FacetValues;
  date: DateFilterValue | null;
  page: number;
  size: number;
  columns: readonly string[] | null;
  extras?: Readonly<Record<string, string | undefined>>;
  after?: string | null;
}

/** Already-translated copy for the chip bar and its chips. */
export interface FilterChipBarLabels {
  addFilter: string;
  addFilterHint: string;
  reset: string;
  resetHint: string;
  remove: (facetLabel: string) => string;
  removeHint: string;
  editHint: string;
  optionHint: string;
  allSelected: string;
  /** Value text of a pinned chip with nothing picked; defaults to `allSelected`. */
  noneSelected?: string;
  countSelected: (count: number) => string;
}

/** Already-translated copy for the which-date chip. */
export interface DateFieldChipLabels {
  title: string;
  fieldGroup: string;
  rangeGroup: string;
  fieldHint: string;
  rangeHint: string;
  clear: string;
  clearHint: string;
}

export interface ColumnOption {
  key: string;
  label: string;
  locked?: boolean;
}

export interface ColumnPickerLabels {
  title: string;
  toggleHint: string;
  lockedHint: string;
}

export interface DateFilterChipLabels {
  title: string;
  anyDate: string;
  editHint: string;
}

export interface CursorFooterLabels {
  found: (total: number) => string;
  pageSize: (size: number) => string;
  prev: string;
  prevHint: string;
  next: string;
  nextHint: string;
}
