import {
  FACET_TEST_IDS,
  addFacetTestID,
  columnToggleTestID,
  dateFieldTestID,
  dateRangeTestID,
  facetChipRemoveTestID,
  facetChipTestID,
  facetOptionTestID,
} from './constants';

export interface FacetTestIds {
  bar: string;
  addFilter: string;
  addMenu: string;
  reset: string;
  editor: string;
  dateChip: string;
  dateTrigger: string;
  dateClear: string;
  columnPicker: string;
  columns: string;
  footer: string;
  found: string;
  pageSize: string;
  prev: string;
  next: string;
  chip: (key: string) => string;
  chipRemove: (key: string) => string;
  addFacet: (key: string) => string;
  option: (key: string, value: string) => string;
  dateField: (field: string) => string;
  dateRange: (range: string) => string;
  columnToggle: (key: string) => string;
}

const UNPREFIXED: FacetTestIds = {
  ...FACET_TEST_IDS,
  dateTrigger: 'date-filter-chip',
  columns: 'column-picker-button',
  footer: 'cursor-footer',
  found: 'cursor-footer-found',
  pageSize: 'cursor-footer-page-size',
  prev: 'cursor-footer-prev',
  next: 'cursor-footer-next',
  chip: facetChipTestID,
  chipRemove: facetChipRemoveTestID,
  addFacet: addFacetTestID,
  option: facetOptionTestID,
  dateField: dateFieldTestID,
  dateRange: dateRangeTestID,
  columnToggle: columnToggleTestID,
};

/** The facet filter test ids: the 3.8.0 ids with no prefix, `<prefix>-chip-<key>` style ids with one. */
export function facetTestIds(prefix?: string): FacetTestIds {
  if (prefix === undefined || prefix === '') return UNPREFIXED;
  const p = (part: string): string => `${prefix}-${part}`;
  return {
    bar: p('filterbar'),
    addFilter: p('add-filter'),
    addMenu: p('add-filter-menu'),
    reset: p('reset'),
    editor: p('filter-editor'),
    dateChip: p('date-panel'),
    dateTrigger: p('chip-date'),
    dateClear: p('date-clear'),
    columnPicker: p('column-picker'),
    columns: p('columns'),
    footer: p('footer'),
    found: p('found'),
    pageSize: p('page-size'),
    prev: p('prev'),
    next: p('next'),
    chip: (key) => p(`chip-${key}`),
    chipRemove: (key) => p(`chip-${key}-remove`),
    addFacet: (key) => p(`add-filter-${key}`),
    option: (_key, value) => p(`filter-option-${value}`),
    dateField: (field) => p(`date-mode-${field}`),
    dateRange: (range) => p(`date-range-${range}`),
    columnToggle: (key) => p(`column-toggle-${key}`),
  };
}
