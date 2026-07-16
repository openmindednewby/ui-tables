/**
 * Bulk-select LOGIC (the platform's testing philosophy: logic, not rendering).
 *
 * The load-bearing claims here are the indeterminate arithmetic, the "never touch keys you
 * cannot see" rule, and the fact that select-all-matching is a FLAG — so these are the
 * tests that were mutation-checked (see the task doc).
 */
import { HeaderCheckboxState } from './headerCheckboxState';
import { SelectAllBannerMode } from './selectAllBannerMode';
import {
  isRowSelected,
  resolveHeaderCheckboxState,
  resolveSelectAllBannerMode,
  toggleAllOnPage,
  toggleSelectedKey,
} from './selection';

const PAGE = ['a', 'b', 'c'];

describe('toggleSelectedKey', () => {
  it('adds an unselected key', () => {
    expect(toggleSelectedKey(['a'], 'b')).toEqual(['a', 'b']);
  });

  it('removes an already-selected key', () => {
    expect(toggleSelectedKey(['a', 'b'], 'a')).toEqual(['b']);
  });

  it('never mutates the caller-owned array (it is React state)', () => {
    const selected = ['a'];
    toggleSelectedKey(selected, 'b');
    expect(selected).toEqual(['a']);
  });
});

describe('resolveHeaderCheckboxState — the indeterminate arithmetic', () => {
  it('is None when nothing on the page is selected', () => {
    expect(resolveHeaderCheckboxState([], PAGE)).toBe(HeaderCheckboxState.None);
  });

  it('is Some (indeterminate) when SOME of the page is selected', () => {
    expect(resolveHeaderCheckboxState(['a'], PAGE)).toBe(HeaderCheckboxState.Some);
    expect(resolveHeaderCheckboxState(['a', 'b'], PAGE)).toBe(HeaderCheckboxState.Some);
  });

  it('is All only when EVERY row on the page is selected', () => {
    expect(resolveHeaderCheckboxState(['a', 'b', 'c'], PAGE)).toBe(HeaderCheckboxState.All);
  });

  it('ignores order', () => {
    expect(resolveHeaderCheckboxState(['c', 'a', 'b'], PAGE)).toBe(HeaderCheckboxState.All);
  });

  /**
   * 🔴 The off-page trap. A selection of 3 keys and a page of 3 rows is NOT "all selected"
   * when the keys belong to a different page. Counting `selected.length` against
   * `pageKeys.length` would say All here and tick a header over an untouched page.
   */
  it('is None when the selection is entirely off-page, even at the same COUNT', () => {
    expect(resolveHeaderCheckboxState(['x', 'y', 'z'], PAGE)).toBe(HeaderCheckboxState.None);
  });

  it('counts only the page ∩ selection when the selection spans pages', () => {
    expect(resolveHeaderCheckboxState(['a', 'x', 'y'], PAGE)).toBe(HeaderCheckboxState.Some);
  });

  /** An empty page has nothing to be partially selected — never indeterminate. */
  it('is None for an empty page even when keys are selected', () => {
    expect(resolveHeaderCheckboxState(['x'], [])).toBe(HeaderCheckboxState.None);
  });
});

describe('toggleAllOnPage', () => {
  it('selects the whole page from empty', () => {
    expect(toggleAllOnPage([], PAGE)).toEqual(['a', 'b', 'c']);
  });

  it('completes the page from indeterminate (rather than clearing)', () => {
    expect(toggleAllOnPage(['b'], PAGE)).toEqual(['b', 'a', 'c']);
  });

  it('clears the page when it was fully selected', () => {
    expect(toggleAllOnPage(['a', 'b', 'c'], PAGE)).toEqual([]);
  });

  it('never duplicates a key that was already selected', () => {
    expect(toggleAllOnPage(['a'], PAGE)).toHaveLength(PAGE.length);
  });

  /**
   * 🔴 The table only knows the rows it was handed. Dropping keys from other pages would
   * silently shrink a selection the caller legitimately holds.
   */
  it('PRESERVES off-page keys when selecting the page', () => {
    expect(toggleAllOnPage(['x'], PAGE)).toEqual(['x', 'a', 'b', 'c']);
  });

  it('PRESERVES off-page keys when clearing the page', () => {
    expect(toggleAllOnPage(['x', 'a', 'b', 'c'], PAGE)).toEqual(['x']);
  });

  it('never mutates the caller-owned array', () => {
    const selected = ['x'];
    toggleAllOnPage(selected, PAGE);
    expect(selected).toEqual(['x']);
  });
});

describe('resolveSelectAllBannerMode', () => {
  const PAGE_COUNT = 3;
  const MATCHING = 3_023;

  it('is Hidden while the page is only partly selected', () => {
    expect(resolveSelectAllBannerMode(HeaderCheckboxState.Some, false, PAGE_COUNT, MATCHING)).toBe(
      SelectAllBannerMode.Hidden,
    );
  });

  it('is Hidden when nothing is selected', () => {
    expect(resolveSelectAllBannerMode(HeaderCheckboxState.None, false, PAGE_COUNT, MATCHING)).toBe(
      SelectAllBannerMode.Hidden,
    );
  });

  it('OFFERS the flag once the whole page is selected and more rows match', () => {
    expect(resolveSelectAllBannerMode(HeaderCheckboxState.All, false, PAGE_COUNT, MATCHING)).toBe(
      SelectAllBannerMode.Offer,
    );
  });

  /**
   * 🔴 The filter fits on one page: "select all matching" would just re-state what is
   * already ticked. Offering it would be a button that does nothing.
   */
  it('is Hidden when the filter fits entirely on this page', () => {
    expect(resolveSelectAllBannerMode(HeaderCheckboxState.All, false, PAGE_COUNT, PAGE_COUNT)).toBe(
      SelectAllBannerMode.Hidden,
    );
  });

  it('is Hidden when the server reports FEWER matches than the page holds', () => {
    expect(resolveSelectAllBannerMode(HeaderCheckboxState.All, false, PAGE_COUNT, 1)).toBe(
      SelectAllBannerMode.Hidden,
    );
  });

  it('is Active whenever the flag is set, whatever the page arithmetic says', () => {
    expect(resolveSelectAllBannerMode(HeaderCheckboxState.None, true, PAGE_COUNT, MATCHING)).toBe(
      SelectAllBannerMode.Active,
    );
    expect(resolveSelectAllBannerMode(HeaderCheckboxState.Some, true, PAGE_COUNT, MATCHING)).toBe(
      SelectAllBannerMode.Active,
    );
  });

  it('never offers on an empty page', () => {
    expect(resolveSelectAllBannerMode(HeaderCheckboxState.All, false, 0, MATCHING)).toBe(
      SelectAllBannerMode.Hidden,
    );
  });
});

describe('isRowSelected', () => {
  it('reads the id list when the flag is off', () => {
    expect(isRowSelected(['a'], 'a', false)).toBe(true);
    expect(isRowSelected(['a'], 'b', false)).toBe(false);
  });

  /**
   * 🔴 The whole point. With the flag set every matching row is selected — including rows
   * on pages that were never fetched. If this consulted the id list, the table would have
   * to back-fill 5,000 ids to make the checkboxes look right, which is exactly the
   * DOM/memory blow-up the ZY-02 spike ruled out.
   */
  it('reports EVERY row selected under the flag, with an EMPTY id list', () => {
    expect(isRowSelected([], 'any-row-on-any-page', true)).toBe(true);
  });
});
