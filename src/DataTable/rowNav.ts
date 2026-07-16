/**
 * Keyboard navigation — the pure parts: decoding a key press into an intent, and moving an
 * index. Split from the hook so the rules are testable as LOGIC, without a DOM.
 *
 * The ARIA grid pattern (roving tabindex) is what this implements: arrows MOVE FOCUS
 * between rows, they do not scroll and they do not wrap. Wrapping from the last row to the
 * first reads as "the page changed" to someone who cannot see the screen, which is exactly
 * the illusion a paged table must not create.
 */
import { RowNavAction } from './rowNavAction';

/** The first row's index. */
const FIRST_INDEX = 0;
/** Offset to the adjacent row. */
const ONE_ROW = 1;
/** `indexOf` miss. */
const NOT_FOUND = -1;

/**
 * Decode a `KeyboardEvent.key` into a row-grid intent, or `undefined` for a key this table
 * has no opinion about (which the caller must then leave alone — never `preventDefault` a
 * key you are not handling, or you break Tab, typeahead and browser shortcuts).
 *
 * `'Spacebar'` is the legacy (IE/old-Edge) `key` value for the space bar; both spellings
 * are accepted so the space key behaves the same everywhere.
 */
export function toRowNavAction(key: string): RowNavAction | undefined {
  switch (key) {
    case 'ArrowDown':
      return RowNavAction.Next;
    case 'ArrowUp':
      return RowNavAction.Prev;
    case 'Home':
      return RowNavAction.First;
    case 'End':
      return RowNavAction.Last;
    case ' ':
    case 'Spacebar':
      return RowNavAction.Toggle;
    case 'Enter':
      return RowNavAction.Activate;
    default:
      return undefined;
  }
}

/**
 * The index a movement action lands on — CLAMPED at both ends, never wrapping.
 *
 * Returns `undefined` for the non-movement actions (Toggle/Activate) and for an empty
 * page, so the caller can tell "no movement" from "move to row 0".
 */
export function nextRowIndex(
  currentIndex: number,
  action: RowNavAction,
  rowCount: number,
): number | undefined {
  if (rowCount === FIRST_INDEX) return undefined;
  const lastIndex = rowCount - ONE_ROW;
  switch (action) {
    case RowNavAction.Next:
      return Math.min(currentIndex + ONE_ROW, lastIndex);
    case RowNavAction.Prev:
      return Math.max(currentIndex - ONE_ROW, FIRST_INDEX);
    case RowNavAction.First:
      return FIRST_INDEX;
    case RowNavAction.Last:
      return lastIndex;
    default:
      return undefined;
  }
}

/**
 * 🔴 The roving-tabindex invariant: **exactly one row is tabbable at any time.**
 *
 * The subtle case is a PAGE CHANGE. `focusedKey` is remembered across renders, but paging
 * replaces every row — so the remembered key belongs to rows that no longer exist. Falling
 * back to the first row is what keeps the table reachable: without this, after paging no
 * row would match, no row would carry `tabIndex=0`, and a keyboard operator would be
 * unable to get back into the grid at all (Tab would skip straight past it). Same for the
 * very first render, where nothing has been focused yet.
 *
 * Returns `undefined` only for an empty page, where there is genuinely nothing to focus.
 */
export function resolveTabbableKey(
  rowKeys: readonly string[],
  focusedKey: string | undefined,
): string | undefined {
  if (rowKeys.length === FIRST_INDEX) return undefined;
  if (focusedKey !== undefined && rowKeys.includes(focusedKey)) return focusedKey;
  return rowKeys[FIRST_INDEX];
}

/**
 * The index the roving focus is currently on. Falls back to the first row when the
 * remembered key is gone (see `resolveTabbableKey`), so a movement after a page change
 * steps from the top of the new page rather than from nowhere.
 */
export function focusedRowIndex(rowKeys: readonly string[], focusedKey: string | undefined): number {
  const index = focusedKey === undefined ? NOT_FOUND : rowKeys.indexOf(focusedKey);
  return index === NOT_FOUND ? FIRST_INDEX : index;
}
