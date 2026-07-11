/**
 * SizeDropdown — the compact rows-per-page control for the Pager's `dropdown` variant.
 *
 * Matches the v1 console's `<select class="ui-select ui-btn--sm">`: a compact bordered
 * trigger (height-matched to the Prev/Next ghost buttons) showing the current page size
 * plus a chevron, which opens an anchored popover of the page-size options. Selecting one
 * fires `onPageSizeChange` and closes; it also closes on outside-click / Escape.
 *
 * Self-contained (no cross-package dependency): ui-tables is a low-level table primitive,
 * so it deliberately does NOT depend on the higher-level `@dloizides/ui-layout` ModalDropdown
 * — that trigger has fixed, non-overridable chunky padding and no chevron, so it cannot match
 * v1's compact select. This minimal anchored menu reuses the same web click-outside/Escape
 * dismissal pattern as ui-layout's InlineMenu.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { chromeStyles as c } from './styles';

const CHEVRON_DOWN = '▾';
const CHEVRON_UP = '▴';

/** Web-only outside-click + Escape dismissal, mirroring ui-layout's InlineMenu. No-op on native. */
function useDismissOnOutside(anchorRef: React.RefObject<View | null>, isOpen: boolean, onClose: () => void): void {
  useEffect(() => {
    if (Platform.OS !== 'web' || !isOpen) return undefined;

    const onMouseDown = (event: MouseEvent): void => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- RN web ref is an HTMLElement at runtime
      const node = anchorRef.current as unknown as HTMLElement | null;
      const target = event.target instanceof Node ? event.target : null;
      const clickedOutside = node !== null && (target === null || !node.contains(target));
      if (clickedOutside) onClose();
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [anchorRef, isOpen, onClose]);
}

export interface SizeDropdownProps {
  pageSize: number;
  pageSizeOptions: readonly number[];
  onPageSizeChange: (pageSize: number) => void;
  /** Base pager test id; the trigger is `${testID}-size-trigger`, each option `${testID}-size-${size}`. */
  testID: string;
  /** Already-translated accessible hint for the trigger. */
  triggerHint: string;
  /** Already-translated accessible hint for each option. */
  optionHint: string;
  /** Theme colours from the Pager (kept flat so this stays a pure presentational unit). */
  textColor: string;
  mutedColor: string;
  borderColor: string;
  surfaceColor: string;
  brandColor: string;
  triggerStyle?: StyleProp<ViewStyle>;
  triggerTextStyle?: StyleProp<TextStyle>;
}

export function SizeDropdown({
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  testID,
  triggerHint,
  optionHint,
  textColor,
  mutedColor,
  borderColor,
  surfaceColor,
  brandColor,
  triggerStyle,
  triggerTextStyle,
}: SizeDropdownProps): React.ReactElement {
  const anchorRef = useRef<View>(null);
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => { setIsOpen(false); }, []);
  const toggle = useCallback(() => { setIsOpen((prev) => !prev); }, []);
  const select = useCallback(
    (size: number) => {
      onPageSizeChange(size);
      setIsOpen(false);
    },
    [onPageSizeChange],
  );

  useDismissOnOutside(anchorRef, isOpen, close);

  return (
    <View ref={anchorRef} style={c.sizeAnchor}>
      <Pressable
        testID={`${testID}-size-trigger`}
        accessibilityRole="button"
        accessibilityLabel={String(pageSize)}
        accessibilityHint={triggerHint}
        accessibilityState={{ expanded: isOpen }}
        aria-expanded={isOpen}
        onPress={toggle}
        style={[c.sizeTrigger, { borderColor, backgroundColor: surfaceColor }, triggerStyle]}
      >
        <Text style={[c.sizeTriggerText, { color: textColor }, triggerTextStyle]}>{pageSize}</Text>
        <Text style={[c.sizeChevron, { color: mutedColor }]} aria-hidden>{isOpen ? CHEVRON_UP : CHEVRON_DOWN}</Text>
      </Pressable>

      {isOpen ? (
        <View accessibilityRole="menu" style={[c.sizeMenu, { borderColor, backgroundColor: surfaceColor }]} testID={`${testID}-size-menu`}>
          {pageSizeOptions.map((size) => {
            const active = size === pageSize;
            return (
              <Pressable
                key={size}
                testID={`${testID}-size-${size}`}
                accessibilityRole="menuitem"
                accessibilityLabel={String(size)}
                accessibilityHint={optionHint}
                accessibilityState={{ selected: active }}
                onPress={() => select(size)}
                style={c.sizeOption}
              >
                <Text style={[c.sizeOptionText, { color: active ? brandColor : textColor, fontWeight: active ? '700' : '400' }]}>{size}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

export default SizeDropdown;
