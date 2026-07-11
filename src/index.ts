// StatCard — the proven (erevna+katalogos) metric tile.
export { StatCard } from './StatCard/StatCard';
export type { StatCardProps } from './StatCard/StatCard';

// DataTable family — the shared, tokenized RN-web grid (GRID.md contract) promoted
// from the /coverage POC. Its 2nd consumer is the AML v2 parallel-run portal.
export { DataTable, FilterBar, Pager } from './DataTable';
export type { DataTableColumn, DataTableProps, FilterBarProps, PagerProps } from './DataTable';
export {
  TABLE_TEST_IDS,
  TABLE_I18N,
  CARD_STACK_BREAKPOINT,
  DEFAULT_PAGE_SIZE_OPTIONS,
  rowTestID,
  rowDetailTestID,
} from './DataTable';
