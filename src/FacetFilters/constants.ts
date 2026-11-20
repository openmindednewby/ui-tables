export const FIRST_PAGE = 1;
export const DEFAULT_LIST_PAGE_SIZE = 50;
export const VALUE_SEPARATOR = ',';
export const DATE_SEPARATOR = ':';
export const MAX_SUMMARY_LABELS = 2;
export const SUMMARY_JOINER = ', ';
export const IDENTITY_JOINER = ' · ';

export const URL_PARAM = {
  date: 'date',
  page: 'page',
  size: 'size',
  columns: 'cols',
} as const;

export const FACET_TEST_IDS = {
  bar: 'filter-chip-bar',
  addFilter: 'filter-chip-bar-add',
  addMenu: 'filter-chip-bar-add-menu',
  reset: 'filter-chip-bar-reset',
  editor: 'facet-chip-editor',
  dateChip: 'date-field-chip',
  dateClear: 'date-field-chip-clear',
  columnPicker: 'column-picker',
  identityCell: 'identity-cell',
  dateStampCell: 'date-stamp-cell',
} as const;

export const facetChipTestID = (key: string): string => `filter-chip-${key}`;
export const facetChipRemoveTestID = (key: string): string => `filter-chip-${key}-remove`;
export const addFacetTestID = (key: string): string => `filter-chip-bar-add-${key}`;
export const facetOptionTestID = (key: string, value: string): string => `facet-chip-editor-${key}-${value}`;
export const dateFieldTestID = (field: string): string => `date-field-chip-field-${field}`;
export const dateRangeTestID = (range: string): string => `date-field-chip-range-${range}`;
export const columnToggleTestID = (key: string): string => `column-picker-${key}`;
