/**
 * AnchoredMenu — the floating option list shared by the `select` and `typeahead` fields.
 *
 * Renders an in-tree, absolutely-positioned popover under its anchor (the pattern aml-v2's
 * CountryPicker proved: `position:absolute; top:100%; zIndex; elevation`), so it floats over
 * sibling fields without a portal. On web it dismisses on outside-click / Escape; on native the
 * caller closes it on blur/select. Purely presentational + theme-flat, so it stays reusable.
 *
 * Deliberately kept in-tree (no ui-layout dependency): ui-tables is a low-level table primitive
 * and must not take a runtime dependency on the higher-level ui-layout ModalDropdown. Apps that
 * need the responsive modal/bottom-sheet variant inject ModalDropdown via `Filters.renderSelect`.
 */
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import { filterStyles as s } from '../styles';
import type { FilterOption } from '../types';

const IS_WEB = typeof document !== 'undefined';
const ESCAPE_KEY = 'Escape';
const ACTIVE_WEIGHT = '700' as const;
const IDLE_WEIGHT = '400' as const;

export interface AnchoredMenuColors {
  text: string;
  border: string;
  surface: string;
  brand: string;
}

export interface AnchoredMenuProps {
  options: readonly FilterOption[];
  /** The currently-selected value, highlighted in the list ('' = none). */
  selectedValue: string;
  onSelect: (value: string) => void;
  onDismiss: () => void;
  colors: AnchoredMenuColors;
  /** Pre-localized accessibility hint applied to every option. */
  optionHint: string;
  /** Base testID: the menu is `${testID}-menu`, each option `${testID}-option-${value}`. */
  testID: string;
  /** Node whose clicks count as "inside" (the anchor) so its own press doesn't self-dismiss. */
  anchorRef: React.RefObject<View | null>;
}

/** Web-only outside-click + Escape dismissal (no-op on native). */
function useDismiss(
  anchorRef: React.RefObject<View | null>,
  menuRef: React.RefObject<View | null>,
  onDismiss: () => void,
): void {
  useEffect(() => {
    if (!IS_WEB) return undefined;
    const onMouseDown = (event: MouseEvent): void => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- RN web refs are HTMLElements at runtime
      const anchorNode = anchorRef.current as unknown as HTMLElement | null;
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- RN web refs are HTMLElements at runtime
      const menuNode = menuRef.current as unknown as HTMLElement | null;
      const target = event.target instanceof Node ? event.target : null;
      const insideAnchor = anchorNode !== null && target !== null && anchorNode.contains(target);
      const insideMenu = menuNode !== null && target !== null && menuNode.contains(target);
      if (!insideAnchor && !insideMenu) onDismiss();
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === ESCAPE_KEY) onDismiss();
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [anchorRef, menuRef, onDismiss]);
}

export function AnchoredMenu({
  options,
  selectedValue,
  onSelect,
  onDismiss,
  colors,
  optionHint,
  testID,
  anchorRef,
}: AnchoredMenuProps): React.ReactElement {
  const menuRef = React.useRef<View>(null);
  useDismiss(anchorRef, menuRef, onDismiss);

  return (
    <View
      ref={menuRef}
      accessibilityRole="menu"
      style={[s.menu, { borderColor: colors.border, backgroundColor: colors.surface }]}
      testID={`${testID}-menu`}
    >
      {options.map((opt) => {
        const active = opt.value === selectedValue;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="menuitem"
            accessibilityLabel={opt.label}
            accessibilityHint={optionHint}
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(opt.value)}
            style={s.option}
            testID={`${testID}-option-${opt.value}`}
          >
            <Text style={[s.optionText, { color: active ? colors.brand : colors.text, fontWeight: active ? ACTIVE_WEIGHT : IDLE_WEIGHT }]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default AnchoredMenu;
