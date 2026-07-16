/**
 * Roving tabindex for the DataTable's rows — the ARIA grid keyboard pattern.
 *
 * Exactly ONE row carries `tabIndex=0`; the rest carry `-1`. So Tab moves INTO and OUT OF
 * the grid in one hop (rather than through 100 rows), and the arrow keys move within it.
 * That is the whole point of the pattern and the reason this is not a keydown hack.
 *
 * ## Web-only, deliberately
 *
 * Moving focus means calling `.focus()` on a host node, and `onKeyDown` is a DOM event.
 * Neither exists on real React Native, where there are no arrow keys to begin with. So the
 * keyboard wiring is emitted on WEB only and is inert on native — the same deliberate
 * split as `resolveStickyHeaderStyle` in `styles.ts`, and for the same reason: a web-only
 * escape hatch must never reach the native renderer.
 */
import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { focusedRowIndex, nextRowIndex, resolveTabbableKey, toRowNavAction } from './rowNav';
import { RowNavAction } from './rowNavAction';

/** Tabbable: the single row the roving tabindex currently rests on. */
const TAB_INDEX_ACTIVE = 0;
/** Focusable programmatically, but skipped by Tab — every other row. */
const TAB_INDEX_INACTIVE = -1;

/**
 * The host node a row ref resolves to on web. react-native-web hands the underlying DOM
 * element to the ref while typing it as a `View`, so this is cast through `unknown` at the
 * boundary (never `any`) — the same documented shape as the sticky-header cast.
 */
interface FocusableNode {
  focus?: () => void;
}

/** What the DataTable needs back to wire a row up. */
export interface RovingFocus {
  /** `0` for the one tabbable row, `-1` for the rest. */
  tabIndexFor: (key: string) => 0 | -1;
  /** Registers a row's host node so focus can be moved to it. */
  registerRow: (key: string, node: unknown) => void;
  /** Keeps the roving index in step when focus arrives by click or Tab. */
  onRowFocus: (key: string) => void;
  /** The row's keydown handler, or `undefined` when navigation is off / not on web. */
  keyDownFor: (key: string) => ((event: RowKeyEvent) => void) | undefined;
}

/**
 * The slice of a DOM `KeyboardEvent` this hook uses. Declared locally because RN's `View`
 * types carry no `onKeyDown` at all — it is a react-native-web-only prop (RNW forwards it
 * via its `keyboardProps` list). Typing just what we read keeps `no-explicit-any` clean.
 */
export interface RowKeyEvent {
  key: string;
  preventDefault: () => void;
}

interface RovingFocusOptions {
  /** The current page's row keys, in render order. */
  rowKeys: readonly string[];
  /** Off → no tabIndex, no key handlers: the table behaves exactly as it did before. */
  enabled: boolean;
  /** Space on the focused row. Omitted when the table is not selectable. */
  onToggleKey?: (key: string) => void;
  /** Enter on the focused row. Omitted when the table has no `onRowPress`. */
  onActivateKey?: (key: string) => void;
}

/** Keyboard focus movement is a DOM affair — never emitted on native. */
const IS_WEB = Platform.OS === 'web';

export function useRovingFocus({ rowKeys, enabled, onToggleKey, onActivateKey }: RovingFocusOptions): RovingFocus {
  const [focusedKey, setFocusedKey] = useState<string | undefined>(undefined);
  const nodes = useRef<Map<string, FocusableNode>>(new Map());

  // The one tabbable row. Recomputed every render from the CURRENT keys, so a page change
  // (which replaces every key) re-homes the tabindex on the new first row rather than
  // leaving the grid with no way in. See `resolveTabbableKey`.
  const tabbableKey = enabled ? resolveTabbableKey(rowKeys, focusedKey) : undefined;

  const registerRow = useCallback((key: string, node: unknown): void => {
    if (node === null || node === undefined) {
      nodes.current.delete(key);
      return;
    }
    nodes.current.set(key, node as FocusableNode);
  }, []);

  const focusRow = useCallback((key: string): void => {
    setFocusedKey(key);
    nodes.current.get(key)?.focus?.();
  }, []);

  const handleKey = useCallback(
    (event: RowKeyEvent, key: string): void => {
      const action = toRowNavAction(event.key);
      // A key we have no opinion on must pass straight through — swallowing it would break
      // Tab, browser shortcuts and screen-reader keys.
      if (action === undefined) return;

      if (action === RowNavAction.Toggle) {
        if (onToggleKey === undefined) return;
        // Space would otherwise scroll the page out from under the operator.
        event.preventDefault();
        onToggleKey(key);
        return;
      }
      if (action === RowNavAction.Activate) {
        if (onActivateKey === undefined) return;
        event.preventDefault();
        onActivateKey(key);
        return;
      }

      const target = nextRowIndex(focusedRowIndex(rowKeys, key), action, rowKeys.length);
      if (target === undefined) return;
      const targetKey = rowKeys[target];
      if (targetKey === undefined) return;
      // Arrows would otherwise scroll the container as well as move focus.
      event.preventDefault();
      focusRow(targetKey);
    },
    [rowKeys, onToggleKey, onActivateKey, focusRow],
  );

  const keyDownFor = useCallback(
    (key: string) => {
      if (!enabled || !IS_WEB) return undefined;
      return (event: RowKeyEvent): void => handleKey(event, key);
    },
    [enabled, handleKey],
  );

  const tabIndexFor = useCallback(
    (key: string): 0 | -1 => (key === tabbableKey ? TAB_INDEX_ACTIVE : TAB_INDEX_INACTIVE),
    [tabbableKey],
  );

  const onRowFocus = useCallback((key: string): void => setFocusedKey(key), []);

  return { tabIndexFor, registerRow, onRowFocus, keyDownFor };
}
