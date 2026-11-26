import { DEFAULT_PAGE_SIZE_OPTIONS } from './constants';

export const NO_AUTO_PAGE = 0;

/** The auto pager's page size: none when the table opts out, sits in a caller's paged layout, or no default is set. */
export function resolveAutoPageSize(autoPage: boolean | undefined, defaultSize: number | undefined, inPagedLayout: boolean): number {
  if (autoPage === false || inPagedLayout || defaultSize === undefined) return NO_AUTO_PAGE;
  return Math.max(NO_AUTO_PAGE, Math.floor(defaultSize));
}

/** The Rows choices of the auto pager: its first page size, then the shared choices above it. */
export function autoPageSizeOptions(firstSize: number): readonly number[] {
  return [firstSize, ...DEFAULT_PAGE_SIZE_OPTIONS.filter((size) => size > firstSize)];
}
