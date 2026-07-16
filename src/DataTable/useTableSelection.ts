/**
 * Binds the pure bulk-select rules in `selection.ts` to the DataTable's props.
 *
 * Holds NO state of its own: selection is CONTROLLED by the consumer (the same contract as
 * `expandedRowKeys`). This hook only derives — which is why every rule it uses is a pure
 * function that can be tested without a component.
 */
import { useCallback, useMemo } from 'react';

import {
  isRowSelected,
  resolveHeaderCheckboxState,
  resolveSelectAllBannerMode,
  toggleAllOnPage,
  toggleSelectedKey,
} from './selection';
import { HeaderCheckboxState } from './headerCheckboxState';
import { SelectAllBannerMode } from './selectAllBannerMode';

interface TableSelectionOptions {
  /** The current page's row keys, in render order. */
  pageKeys: readonly string[];
  selectedRowKeys?: readonly string[];
  /** The enabler: absent ⇒ no checkboxes at all. */
  onSelectionChange?: (selectedRowKeys: readonly string[]) => void;
  matchingCount?: number;
  allMatchingSelected?: boolean;
  onSelectAllMatchingChange?: (allMatching: boolean) => void;
}

export interface TableSelection {
  /** Whether to render the checkbox gutter at all. */
  selectable: boolean;
  /** The header checkbox's tri-state. */
  headerState: HeaderCheckboxState;
  /** What the select-all-matching banner should say (`Hidden` ⇒ render nothing). */
  bannerMode: SelectAllBannerMode;
  isSelected: (key: string) => boolean;
  toggleRow: (key: string) => void;
  /** The header checkbox: select or clear THIS page. */
  toggleAll: () => void;
  /** The banner's action: emits the FLAG, never ids. */
  toggleAllMatching: () => void;
  /** Total matching the filter across all pages (0 when the consumer did not say). */
  matchingCount: number;
}

const NO_KEYS: readonly string[] = [];
const NO_MATCHES = 0;

export function useTableSelection({
  pageKeys,
  selectedRowKeys,
  onSelectionChange,
  matchingCount,
  allMatchingSelected,
  onSelectAllMatchingChange,
}: TableSelectionOptions): TableSelection {
  const selectable = onSelectionChange !== undefined;
  const selected = selectedRowKeys ?? NO_KEYS;
  const allMatching = allMatchingSelected ?? false;
  const matching = matchingCount ?? NO_MATCHES;

  // While the select-all-matching flag is set the header is fully checked by definition —
  // every row matching the filter is selected, so asking the page's ids is the wrong
  // question (and on a page the operator never opened they would all be absent).
  const pageHeaderState = useMemo(
    () => resolveHeaderCheckboxState(selected, pageKeys),
    [selected, pageKeys],
  );
  const headerState = allMatching ? HeaderCheckboxState.All : pageHeaderState;

  const bannerMode = useMemo(
    () =>
      onSelectAllMatchingChange === undefined
        ? SelectAllBannerMode.Hidden
        : resolveSelectAllBannerMode(pageHeaderState, allMatching, pageKeys.length, matching),
    [onSelectAllMatchingChange, pageHeaderState, allMatching, pageKeys.length, matching],
  );

  const isSelected = useCallback(
    (key: string): boolean => isRowSelected(selected, key, allMatching),
    [selected, allMatching],
  );

  /**
   * Touching one row while "all matching" is set contradicts the flag — the operator is no
   * longer approving *the filter*, they are approving a set. So the flag drops and the
   * selection becomes the honest thing it now is: this page, minus the row they just
   * unticked. Leaving the flag set would silently act on rows they had just excluded.
   */
  const toggleRow = useCallback(
    (key: string): void => {
      if (allMatching) {
        onSelectAllMatchingChange?.(false);
        onSelectionChange?.(toggleSelectedKey(pageKeys, key));
        return;
      }
      onSelectionChange?.(toggleSelectedKey(selected, key));
    },
    [allMatching, onSelectAllMatchingChange, onSelectionChange, pageKeys, selected],
  );

  const toggleAll = useCallback((): void => {
    if (allMatching) {
      // Un-ticking a fully-checked header clears everything, flag included.
      onSelectAllMatchingChange?.(false);
      onSelectionChange?.(NO_KEYS);
      return;
    }
    onSelectionChange?.(toggleAllOnPage(selected, pageKeys));
  }, [allMatching, onSelectAllMatchingChange, onSelectionChange, selected, pageKeys]);

  const toggleAllMatching = useCallback((): void => {
    const next = !allMatching;
    onSelectAllMatchingChange?.(next);
    // Clearing the flag leaves nothing selected: the ids were never enumerated, so there is
    // no page-shaped remnant to fall back to, and silently keeping this page ticked would
    // be a different set than the one the operator just cleared.
    if (!next) onSelectionChange?.(NO_KEYS);
  }, [allMatching, onSelectAllMatchingChange, onSelectionChange]);

  return { selectable, headerState, bannerMode, isSelected, toggleRow, toggleAll, toggleAllMatching, matchingCount: matching };
}
