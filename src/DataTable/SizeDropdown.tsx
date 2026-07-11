/**
 * SizeDropdown — the compact rows-per-page control for the Pager's `dropdown` variant.
 *
 * Matches the v1 console's `<select class="ui-select ui-btn--sm">`: a compact bordered
 * trigger (height-matched to the Prev/Next ghost buttons) showing the current page size
 * plus a chevron, which opens an anchored popover of the page-size options. Selecting one
 * fires `onPageSizeChange` and closes; it also closes on outside-click / Escape.
 *
 * STACKING (the bug this fixes): react-native-web gives every `View` `position: relative;
 * z-index: 0`, so every View is its OWN stacking context. An absolutely-positioned popover
 * therefore has its `zIndex` trapped inside the anchor's `z-index: 0` context and paints
 * UNDER later-painting siblings (the results table / cards below). To escape that, on WEB the
 * open menu is rendered in a PORTAL to `document.body` with `position: fixed` at the trigger's
 * measured viewport rect and a high `zIndex` — clipped by nothing, above everything. The rect is
 * re-measured on scroll/resize so the menu stays glued to its trigger. On native the menu stays
 * in-tree (`position: absolute` + `elevation`). This mirrors `@dloizides/ui-layout`'s InlineMenu.
 *
 * `react-dom` is an OPTIONAL peer (only touched on web, behind `Platform.OS === 'web'`); every
 * RN-web consumer already has it. ui-tables stays a low-level table primitive with no runtime
 * dependency on the higher-level ui-layout ModalDropdown (whose trigger cannot match v1's compact
 * select), so this minimal anchored menu is kept in-tree.
 */
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Platform, Pressable, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { chromeStyles as c } from './styles';

const CHEVRON_DOWN = '▾';
const CHEVRON_UP = '▴';
const IS_WEB = Platform.OS === 'web';
/** Gap between the trigger's bottom edge and the popover's top edge (mirrors styles.ts MENU_TOP_GAP). */
const MENU_TOP_GAP = 4;
const VIEWPORT_EDGE = 0;

/** The trigger's viewport-space corner needed to place the fixed, right-aligned web menu. */
interface TriggerRect {
  bottom: number;
  right: number;
}

/** Read the trigger's viewport rect (web only). Returns null when unavailable (native / no node). */
function readTriggerRect(anchorRef: React.RefObject<View | null>): TriggerRect | null {
  if (!IS_WEB) return null;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- RN web ref is an HTMLElement at runtime
  const node = anchorRef.current as unknown as HTMLElement | null;
  if (node === null || typeof node.getBoundingClientRect !== 'function') return null;
  const r = node.getBoundingClientRect();
  return { bottom: r.bottom, right: r.right };
}

/**
 * Web-only fixed-position style: `position: fixed` under the trigger, right-aligned to it (v1's
 * menu hangs off the trigger's right edge). Merged OVER `chromeStyles.sizeMenu`, so it only needs
 * to override position/top/right — border, radius, padding, min-width, shadow and zIndex are kept.
 */
function buildWebFixedStyle(rect: TriggerRect, viewportWidth: number): ViewStyle {
  return {
    // RN's ViewStyle union omits 'fixed', but react-native-web honours it at runtime.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- web-only position value
    position: 'fixed' as unknown as ViewStyle['position'],
    top: rect.bottom + MENU_TOP_GAP,
    right: Math.max(VIEWPORT_EDGE, viewportWidth - rect.right),
  };
}

/**
 * Keep the fixed web menu glued to its trigger: measure before paint, then re-measure on scroll
 * (capture, so nested scrollers count) and resize while open. No-op on native / while closed.
 */
function useTriggerRect(anchorRef: React.RefObject<View | null>, isOpen: boolean): TriggerRect | null {
  const [rect, setRect] = useState<TriggerRect | null>(null);

  useLayoutEffect(() => {
    if (!IS_WEB || !isOpen) return undefined;
    const measure = (): void => { setRect(readTriggerRect(anchorRef)); };
    measure();
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [anchorRef, isOpen]);

  return rect;
}

/**
 * Web-only outside-click + Escape dismissal. Because the open menu is portalled OUT of the anchor
 * on web, a click is "inside" if it lands in EITHER the anchor or the portalled menu node. No-op on
 * native.
 */
function useDismissOnOutside(
  anchorRef: React.RefObject<View | null>,
  menuRef: React.RefObject<View | null>,
  isOpen: boolean,
  onClose: () => void,
): void {
  useEffect(() => {
    if (!IS_WEB || !isOpen) return undefined;

    const onMouseDown = (event: MouseEvent): void => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- RN web refs are HTMLElements at runtime
      const anchorNode = anchorRef.current as unknown as HTMLElement | null;
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- RN web refs are HTMLElements at runtime
      const menuNode = menuRef.current as unknown as HTMLElement | null;
      const target = event.target instanceof Node ? event.target : null;
      const insideAnchor = anchorNode !== null && target !== null && anchorNode.contains(target);
      const insideMenu = menuNode !== null && target !== null && menuNode.contains(target);
      if (!insideAnchor && !insideMenu) onClose();
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
  }, [anchorRef, menuRef, isOpen, onClose]);
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
  const menuRef = useRef<View>(null);
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

  const rect = useTriggerRect(anchorRef, isOpen);
  useDismissOnOutside(anchorRef, menuRef, isOpen, close);

  // Web: fixed-positioned in a portal at the measured trigger rect (escapes stacking + clipping).
  // Native: keep the in-tree absolute popover from chromeStyles.sizeMenu.
  const webFixedStyle = IS_WEB && rect !== null ? buildWebFixedStyle(rect, window.innerWidth) : null;

  const menu = (
    <View
      ref={menuRef}
      accessibilityRole="menu"
      style={[c.sizeMenu, { borderColor, backgroundColor: surfaceColor }, webFixedStyle]}
      testID={`${testID}-size-menu`}
    >
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
  );

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

      {/* Portal to document.body on web so no ancestor stacking context / overflow can trap or clip it. */}
      {isOpen ? (IS_WEB ? createPortal(menu, document.body) : menu) : null}
    </View>
  );
}

export default SizeDropdown;
