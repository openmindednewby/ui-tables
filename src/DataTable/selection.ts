/**
 * Bulk-select — the pure logic, kept out of the component so it is testable as LOGIC
 * (the platform's testing philosophy) rather than through the DOM.
 *
 * ## The shape is the design
 *
 * The ZY-02 grid spike (`zygos/docs/03-zy02-grid-spike.md`) measured this table at ~2–3 ms
 * and ~16 DOM nodes per row, with no virtualization *by design* — it is a server-paged
 * table. So **"select all N matching the filter" is a FLAG plus a COUNT, never an id list**:
 * the rows on other pages are not in the DOM, the table cannot enumerate them, and it must
 * not try. The consumer resolves the flag server-side against the same filter the list
 * endpoint took, which is a better design anyway — the work survives a closed tab.
 *
 * Everything here is domain-neutral: rows have keys, a page has some of them, a filter
 * matches a count. Nothing knows what a row *is*.
 */
import { HeaderCheckboxState } from './headerCheckboxState';
import { SelectAllBannerMode } from './selectAllBannerMode';

/** No rows selected / no rows on the page — the empty count. */
const NONE = 0;

/**
 * Toggle one row's selection, returning the NEXT selection array.
 *
 * Pure: never mutates the input (the caller owns that array as React state).
 */
export function toggleSelectedKey(selectedKeys: readonly string[], key: string): string[] {
  return selectedKeys.includes(key)
    ? selectedKeys.filter((selected) => selected !== key)
    : [...selectedKeys, key];
}

/** How many of THIS page's rows are currently selected. */
function countSelectedOnPage(selectedKeys: readonly string[], pageKeys: readonly string[]): number {
  return pageKeys.filter((key) => selectedKeys.includes(key)).length;
}

/**
 * The header checkbox's tri-state, derived from the selection ∩ this page.
 *
 * Scoped to the PAGE, not to the whole selection: a header checkbox says "is this page
 * selected?", and off-page keys (which the caller may legitimately hold) must not make an
 * empty page look partially selected.
 */
export function resolveHeaderCheckboxState(
  selectedKeys: readonly string[],
  pageKeys: readonly string[],
): HeaderCheckboxState {
  if (pageKeys.length === NONE) return HeaderCheckboxState.None;
  const selectedOnPage = countSelectedOnPage(selectedKeys, pageKeys);
  if (selectedOnPage === NONE) return HeaderCheckboxState.None;
  return selectedOnPage === pageKeys.length ? HeaderCheckboxState.All : HeaderCheckboxState.Some;
}

/**
 * The header checkbox toggle: select every row on this page, or clear them.
 *
 * From `Some` (indeterminate) this selects the REST of the page rather than clearing —
 * the conventional behaviour, and the one that matches what the tri-state box looks like
 * it will do.
 *
 * Only ever adds/removes keys that are ON THIS PAGE. Any off-page keys the caller holds
 * survive untouched: the table only knows about the rows it was given, so it must not
 * silently drop a selection it cannot see.
 */
export function toggleAllOnPage(selectedKeys: readonly string[], pageKeys: readonly string[]): string[] {
  const state = resolveHeaderCheckboxState(selectedKeys, pageKeys);
  if (state === HeaderCheckboxState.All) return selectedKeys.filter((key) => !pageKeys.includes(key));
  const merged = [...selectedKeys];
  pageKeys.forEach((key) => {
    if (!merged.includes(key)) merged.push(key);
  });
  return merged;
}

/**
 * What the select-all-matching banner should say.
 *
 * `Active` wins over everything: once the flag is set, the selection IS "the filter", and
 * the per-page arithmetic stops being the truth on screen.
 *
 * `Offer` only appears when the whole page is selected AND the filter matches more rows
 * than this page holds — otherwise "select all matching" would either be premature or a
 * no-op that just re-states the page.
 */
export function resolveSelectAllBannerMode(
  headerState: HeaderCheckboxState,
  allMatchingSelected: boolean,
  pageCount: number,
  matchingCount: number,
): SelectAllBannerMode {
  if (allMatchingSelected) return SelectAllBannerMode.Active;
  const pageFullySelected = headerState === HeaderCheckboxState.All && pageCount > NONE;
  const moreBeyondThisPage = matchingCount > pageCount;
  return pageFullySelected && moreBeyondThisPage ? SelectAllBannerMode.Offer : SelectAllBannerMode.Hidden;
}

/**
 * Whether a row reads as selected.
 *
 * When the select-all-matching FLAG is set every row matching the filter is selected —
 * including this one, and including rows on pages the operator never opened. So the flag
 * short-circuits the id lookup rather than the table back-filling 5,000 ids to make the
 * checkboxes look right. That back-filling is exactly what the spike ruled out.
 */
export function isRowSelected(
  selectedKeys: readonly string[],
  key: string,
  allMatchingSelected: boolean,
): boolean {
  return allMatchingSelected || selectedKeys.includes(key);
}
