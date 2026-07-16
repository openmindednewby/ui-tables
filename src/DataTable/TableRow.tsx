/**
 * A DataTable row container.
 *
 * A module-level component ON PURPOSE: defining this inside `DataTable`'s render body would
 * give it a fresh identity every render and remount the whole row subtree on each hover or
 * selection change. (It replaces the `rowContainer` closure for exactly that reason — the
 * closure returned elements rather than being a component, which was correct but no longer
 * fits now that a row has three shapes.)
 *
 * ## The three shapes, and why
 *
 * 1. **Static** (no `onRowPress`) → a plain `<View>`. NOT a `Pressable`: on react-native-web
 *    a `Pressable` installs pointer responders on the row container that CAPTURE a real
 *    pointer gesture and cancel the press of any interactive child, so an Edit/Delete button
 *    in a cell would look clickable and silently do nothing (the 1.9.2 fix).
 * 2. **Interactive** (`onRowPress`) → a `<Pressable>`. Unchanged from 1.9.2.
 * 3. **Selectable** (`selectionSlot`) → a plain `<View>` FRAME holding the checkbox and a
 *    separate pressable content area.
 *
 * Shape 3 exists *because of* the 1.9.2 bug. A checkbox nested inside an interactive row's
 * `Pressable` is precisely the shape that fix identified as broken: the row would capture
 * the gesture and the checkbox would do nothing on a real click while passing a synthetic
 * `element.click()` test. So on a selectable row the checkbox is a SIBLING of the pressable
 * area, never a descendant of it — the gesture it receives is its own.
 */
import React from 'react';
import { Pressable, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { selectionStyles as sel } from './styles';
import type { RowKeyEvent } from './useRovingFocus';

/** Focusable programmatically but skipped by Tab — see `keyboard` below. */
const TAB_INDEX_INACTIVE = -1;

/**
 * The a11y props spread onto a row. The expanded state is emitted only when the table is
 * expandable, and via BOTH spellings: `accessibilityState` (RN native) and `aria-expanded`
 * (react-native-web ≥ 0.19 no longer maps the legacy prop). `aria-selected` follows the
 * same two-spelling rule and appears only when the table is selectable.
 */
export interface RowA11y {
  accessibilityLabel: string;
  accessibilityHint: string;
  accessibilityRole: 'button' | 'text';
  accessibilityState?: { expanded?: boolean; selected?: boolean };
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  role?: 'row';
}

/** The roving-tabindex wiring for one row. Absent when keyboard navigation is off. */
export interface RowKeyboard {
  /** `0` for the single tabbable row, `-1` for the rest. */
  tabIndex: 0 | -1;
  /** Web-only; `useRovingFocus` returns `undefined` off web. */
  onKeyDown?: (event: RowKeyEvent) => void;
  onFocus: () => void;
  registerNode: (node: unknown) => void;
}

export interface TableRowProps {
  testID: string;
  /** The row frame: border, tint, padding. */
  style: StyleProp<ViewStyle>;
  children: React.ReactNode;
  a11y: RowA11y;
  /** Present ⇒ the row is interactive. */
  onPress?: () => void;
  onHoverIn?: () => void;
  onHoverOut?: () => void;
  /** The checkbox element. Present ⇒ the selectable frame shape. */
  selectionSlot?: React.ReactNode;
  /** Card-stack rows lay their content out as a column, not a row. */
  stacked?: boolean;
  keyboard?: RowKeyboard;
}

/**
 * `onKeyDown` is a **react-native-web-only** prop: RNW forwards it (its `keyboardProps`
 * list) but RN's `ViewProps` does not type it, because native has no key events. Cast at
 * this ONE boundary, through `unknown` and never `any` — the same documented escape hatch,
 * for the same reason, as `resolveStickyHeaderStyle`'s `position: 'sticky'` in `styles.ts`.
 *
 * Safe by construction on native: `useRovingFocus` hands back no handler off web, so this
 * returns an empty object and nothing web-only reaches the native renderer.
 */
function webKeyProps(onKeyDown: ((event: RowKeyEvent) => void) | undefined): ViewProps {
  return (onKeyDown === undefined ? {} : { onKeyDown }) as unknown as ViewProps;
}

/** The focus/keyboard props shared by every row shape. Empty when navigation is off. */
function focusProps(keyboard: RowKeyboard | undefined): ViewProps {
  if (keyboard === undefined) return {};
  return {
    tabIndex: keyboard.tabIndex,
    onFocus: keyboard.onFocus,
    ref: (node: unknown) => keyboard.registerNode(node),
    ...webKeyProps(keyboard.onKeyDown),
  } as unknown as ViewProps;
}

export function TableRow({
  testID,
  style,
  children,
  a11y,
  onPress,
  onHoverIn,
  onHoverOut,
  selectionSlot,
  stacked,
  keyboard,
}: TableRowProps): React.ReactElement {
  const interactive = onPress !== undefined;
  const hover = interactive ? { onHoverIn, onHoverOut } : null;

  // --- shapes 1 + 2: unchanged from 1.9.2 (plus the optional roving tabindex) ---
  if (selectionSlot === undefined) {
    return interactive ? (
      <Pressable style={style} testID={testID} onPress={onPress} {...hover} {...a11y} {...focusProps(keyboard)}>
        {children}
      </Pressable>
    ) : (
      <View style={style} testID={testID} {...a11y} {...focusProps(keyboard)}>
        {children}
      </View>
    );
  }

  // --- shape 3: the checkbox is a SIBLING of the pressable area, never inside it ---
  //
  // The FRAME owns identity + semantics (testID, label, role, aria-selected, roving
  // tabindex): it is the row, and it is the thing a keyboard operator lands on.
  //
  // The inner pressable is an anonymous gesture target for the CELLS only. Its tabIndex is
  // forced to -1 ONLY when keyboard navigation is on, because then the frame is the focus
  // stop and two tab stops per row would be one too many. With navigation OFF it keeps
  // RNW's default focusability, so a selectable-but-not-navigable table stays exactly as
  // reachable by Tab as an interactive row is today.
  const contentStyle = stacked ? sel.cardContent : sel.rowContent;
  const content = interactive ? (
    <Pressable
      style={contentStyle}
      tabIndex={keyboard === undefined ? undefined : TAB_INDEX_INACTIVE}
      onPress={onPress}
      {...hover}
    >
      {children}
    </Pressable>
  ) : (
    <View style={contentStyle}>{children}</View>
  );

  return (
    <View style={style} testID={testID} {...a11y} {...focusProps(keyboard)}>
      <View style={sel.selectCell}>{selectionSlot}</View>
      {content}
    </View>
  );
}
