/**
 * Pager — the shared pagination control from GRID.md (`.ui-pager`): page-info on
 * the left (`from–to of N`), nav on the right (rows-per-page + Prev/Next). Sits ON
 * TOP of the grid (in the section header row), so every paged grid looks the same.
 * RN idiom: rows-per-page is a row of pressable pills (RN has no native `<select>`);
 * everything is themed from `useUi().theme` and labelled via the UiProvider `t`.
 */
import React from 'react';
import { Pressable, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { DEFAULT_PAGE_SIZE_OPTIONS, TABLE_I18N, TABLE_TEST_IDS } from './constants';
import { chromeStyles as c } from './styles';

const FIRST_PAGE = 1;
const EN_DASH = '–';
const DISABLED_OPACITY = 0.4;
const FULL_OPACITY = 1;
const TRANSPARENT = 'transparent';
const BOLD = '700' as const;
/**
 * Pager controls are compact (~24–26px tall). `hitSlop` expands the TOUCH target toward the
 * WCAG ≥44px minimum WITHOUT changing the rendered size, so the layout is byte-identical while
 * taps/clicks get an easier target. Vertical only, so adjacent pills never overlap horizontally.
 */
const PAGER_HIT_SLOP = { top: 10, bottom: 10 } as const;

/**
 * Per-slot style overrides for the Pager, merged **LAST** into each slot's style array
 * so the consumer always wins — over the base StyleSheet AND over the inline colours
 * taken from `useUi().theme`. Omit for the shared defaults (nothing changes).
 */
export interface PagerStyleOverrides {
  /** The outer pager row. */
  pager?: StyleProp<ViewStyle>;
  /** The `from–to of N` count line. */
  pagerInfo?: StyleProp<TextStyle>;
  /** The right-hand nav cluster (rows-per-page + Prev/Next). */
  pagerNav?: StyleProp<ViewStyle>;
  /** The "Rows" caption before the size pills. */
  pagerRowsLabel?: StyleProp<TextStyle>;
  /** The rows-per-page pill group. */
  sizeGroup?: StyleProp<ViewStyle>;
  /** A Prev/Next button. */
  control?: StyleProp<ViewStyle>;
  /** A Prev/Next button's label. */
  controlText?: StyleProp<TextStyle>;
  /** A rows-per-page pill. */
  sizePill?: StyleProp<ViewStyle>;
  /** A rows-per-page pill's label. */
  sizePillText?: StyleProp<TextStyle>;
}

export interface PagerProps {
  /** 1-based current page. */
  page: number;
  /** Rows per page. */
  pageSize: number;
  /** Total row count across all pages. */
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** Rows-per-page choices. Default 25 / 50 / 100 / 200. */
  pageSizeOptions?: readonly number[];
  /**
   * Optional, already-translated unit noun appended to the count line, e.g.
   * `"leadership terms"` renders `1–50 of 3,023 leadership terms`. When omitted the
   * count line stays the generic `from–to of N` (byte-identical to prior behaviour).
   */
  unitLabel?: string;
  /**
   * Optional, already-translated word prefixed to the count line, e.g. `"Showing"` renders
   * `Showing 1–50 of 3,023 leadership terms`. Omit for the bare `from–to of N` line
   * (byte-identical to prior behaviour).
   */
  infoPrefix?: string;
  /**
   * Render the three counts (from / to / total) in bold `colors.text` — matching the v1
   * console's `.ui-pager__info b`. Off by default (the whole line stays `textSecondary`,
   * byte-identical to prior behaviour); the concatenated text is unchanged either way.
   */
  boldNumbers?: boolean;
  /**
   * Per-slot style overrides, merged LAST so the consumer always wins — including over
   * the inline theme colours. Omit for the shared defaults.
   */
  styleOverrides?: PagerStyleOverrides;
  testID?: string;
}

interface NavButtonProps {
  label: string;
  hint: string;
  disabled: boolean;
  onPress: () => void;
  color: string;
  border: string;
  testID: string;
  styleOverrides?: Pick<PagerStyleOverrides, 'control' | 'controlText'>;
}

function NavButton({ label, hint, disabled, onPress, color, border, testID, styleOverrides: o }: NavButtonProps): React.ReactElement {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={PAGER_HIT_SLOP}
      onPress={onPress}
      style={[c.control, { borderColor: border, opacity: disabled ? DISABLED_OPACITY : FULL_OPACITY }, o?.control]}
    >
      <Text style={[c.controlText, { color }, o?.controlText]}>{label}</Text>
    </Pressable>
  );
}

export function Pager({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  unitLabel,
  infoPrefix,
  boldNumbers = false,
  styleOverrides: o,
  testID = TABLE_TEST_IDS.pager,
}: PagerProps): React.ReactElement {
  const { theme, t } = useUi();
  const { colors, palette } = theme;
  const brand = palette.primary['500'];

  const lastPage = Math.max(FIRST_PAGE, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, FIRST_PAGE), lastPage);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);
  const hasUnit = unitLabel !== undefined && unitLabel !== '';
  const hasPrefix = infoPrefix !== undefined && infoPrefix !== '';
  const prefix = hasPrefix ? `${infoPrefix} ` : '';
  const ofWord = t(TABLE_I18N.pagerInfo);
  const unitSuffix = hasUnit ? ` ${unitLabel}` : '';
  const count = `${from.toLocaleString()}${EN_DASH}${to.toLocaleString()} ${ofWord} ${total.toLocaleString()}`;
  const info = `${prefix}${count}${unitSuffix}`;
  const boldStyle = { color: colors.text, fontWeight: BOLD };

  return (
    <View style={[c.pager, o?.pager]} testID={testID}>
      <Text style={[c.pagerInfo, { color: colors.textSecondary }, o?.pagerInfo]} testID={TABLE_TEST_IDS.pagerInfo}>
        {boldNumbers ? (
          <>
            {prefix}
            <Text style={boldStyle}>{from.toLocaleString()}</Text>
            {EN_DASH}
            <Text style={boldStyle}>{to.toLocaleString()}</Text>
            {` ${ofWord} `}
            <Text style={boldStyle}>{total.toLocaleString()}</Text>
            {unitSuffix}
          </>
        ) : (
          info
        )}
      </Text>
      <View style={[c.pagerNav, o?.pagerNav]}>
        <Text style={[c.pagerRowsLabel, { color: colors.textSecondary }, o?.pagerRowsLabel]}>{t(TABLE_I18N.pagerRows)}</Text>
        <View style={[c.sizeGroup, o?.sizeGroup]}>
          {pageSizeOptions.map((size) => {
            const active = size === pageSize;
            return (
              <Pressable
                key={size}
                testID={`${testID}-size-${size}`}
                accessibilityRole="button"
                accessibilityLabel={String(size)}
                accessibilityHint={t(TABLE_I18N.pagerRowsOptionHint)}
                accessibilityState={{ selected: active }}
                hitSlop={PAGER_HIT_SLOP}
                onPress={() => onPageSizeChange(size)}
                style={[c.sizePill, { borderColor: active ? brand : colors.border, backgroundColor: active ? brand : TRANSPARENT }, o?.sizePill]}
              >
                <Text style={[c.sizePillText, { color: active ? colors.surface : colors.textSecondary }, o?.sizePillText]}>{size}</Text>
              </Pressable>
            );
          })}
        </View>
        <NavButton
          label={t(TABLE_I18N.pagerPrev)}
          hint={t(TABLE_I18N.pagerPrevHint)}
          disabled={safePage <= FIRST_PAGE}
          onPress={() => onPageChange(safePage - 1)}
          color={colors.text}
          border={colors.border}
          styleOverrides={o}
          testID={TABLE_TEST_IDS.pagerPrev}
        />
        <NavButton
          label={t(TABLE_I18N.pagerNext)}
          hint={t(TABLE_I18N.pagerNextHint)}
          disabled={safePage >= lastPage}
          onPress={() => onPageChange(safePage + 1)}
          color={colors.text}
          border={colors.border}
          styleOverrides={o}
          testID={TABLE_TEST_IDS.pagerNext}
        />
      </View>
    </View>
  );
}

export default Pager;
