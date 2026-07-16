/**
 * Keyboard-navigation LOGIC. The load-bearing rule is `resolveTabbableKey`'s page-change
 * fallback — without it the grid becomes keyboard-unreachable after paging. That test was
 * mutation-checked (see the task doc).
 */
import { focusedRowIndex, nextRowIndex, resolveTabbableKey, toRowNavAction } from './rowNav';
import { RowNavAction } from './rowNavAction';

const KEYS = ['a', 'b', 'c'];
const COUNT = KEYS.length;
const FIRST = 0;
const MIDDLE = 1;
const LAST = 2;

describe('toRowNavAction', () => {
  it.each([
    ['ArrowDown', RowNavAction.Next],
    ['ArrowUp', RowNavAction.Prev],
    ['Home', RowNavAction.First],
    ['End', RowNavAction.Last],
    [' ', RowNavAction.Toggle],
    ['Spacebar', RowNavAction.Toggle],
    ['Enter', RowNavAction.Activate],
  ])('decodes %s', (key, expected) => {
    expect(toRowNavAction(key)).toBe(expected);
  });

  /**
   * 🔴 A key we do not handle must decode to `undefined` so the caller leaves it alone.
   * Claiming an unknown key would `preventDefault` Tab, typeahead and browser shortcuts —
   * i.e. the "keyboard support" would break the keyboard.
   */
  it.each(['Tab', 'a', 'Escape', 'ArrowLeft', 'PageDown', 'F5'])('has no opinion about %s', (key) => {
    expect(toRowNavAction(key)).toBeUndefined();
  });
});

describe('nextRowIndex — clamped, never wrapping', () => {
  it('moves down and up', () => {
    expect(nextRowIndex(FIRST, RowNavAction.Next, COUNT)).toBe(MIDDLE);
    expect(nextRowIndex(MIDDLE, RowNavAction.Prev, COUNT)).toBe(FIRST);
  });

  it('jumps to first and last', () => {
    expect(nextRowIndex(MIDDLE, RowNavAction.First, COUNT)).toBe(FIRST);
    expect(nextRowIndex(FIRST, RowNavAction.Last, COUNT)).toBe(LAST);
  });

  /**
   * 🔴 Wrapping past the last row reads as "the page changed" to someone who cannot see the
   * screen — an illusion a paged table must never create. Clamp instead.
   */
  it('CLAMPS at the last row rather than wrapping to the first', () => {
    expect(nextRowIndex(LAST, RowNavAction.Next, COUNT)).toBe(LAST);
  });

  it('CLAMPS at the first row rather than wrapping to the last', () => {
    expect(nextRowIndex(FIRST, RowNavAction.Prev, COUNT)).toBe(FIRST);
  });

  it('returns undefined for the non-movement actions', () => {
    expect(nextRowIndex(FIRST, RowNavAction.Toggle, COUNT)).toBeUndefined();
    expect(nextRowIndex(FIRST, RowNavAction.Activate, COUNT)).toBeUndefined();
  });

  it('returns undefined on an empty page (there is nowhere to go)', () => {
    expect(nextRowIndex(FIRST, RowNavAction.Next, 0)).toBeUndefined();
  });
});

describe('resolveTabbableKey — the roving-tabindex invariant', () => {
  it('keeps the focused row tabbable while it exists', () => {
    expect(resolveTabbableKey(KEYS, 'b')).toBe('b');
  });

  it('falls back to the first row before anything has been focused', () => {
    expect(resolveTabbableKey(KEYS, undefined)).toBe('a');
  });

  /**
   * 🔴 THE page-boundary rule. Paging replaces every row, so the remembered key belongs to
   * rows that no longer exist. Without the fallback NO row matches, NO row carries
   * `tabIndex=0`, and Tab skips the whole grid — the table becomes keyboard-unreachable
   * the moment the operator turns a page.
   */
  it('re-homes onto the new first row when the page changed underneath it', () => {
    expect(resolveTabbableKey(['x', 'y', 'z'], 'b')).toBe('x');
  });

  it('is undefined only for an empty page', () => {
    expect(resolveTabbableKey([], 'b')).toBeUndefined();
  });

  it('always yields EXACTLY ONE tabbable row for any page/focus combination', () => {
    const cases: Array<string | undefined> = [undefined, 'a', 'c', 'gone'];
    cases.forEach((focused) => {
      const tabbable = resolveTabbableKey(KEYS, focused);
      expect(KEYS.filter((key) => key === tabbable)).toHaveLength(1);
    });
  });
});

describe('focusedRowIndex', () => {
  it('finds the focused row', () => {
    expect(focusedRowIndex(KEYS, 'c')).toBe(LAST);
  });

  it('falls back to the first row when nothing is focused', () => {
    expect(focusedRowIndex(KEYS, undefined)).toBe(FIRST);
  });

  /** Same page-change rule: step from the top of the new page, not from nowhere (-1). */
  it('falls back to the first row when the focused key is gone', () => {
    expect(focusedRowIndex(KEYS, 'gone')).toBe(FIRST);
  });
});
