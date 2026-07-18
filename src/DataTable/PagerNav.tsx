/**
 * PagerNav — the Pager's right-hand navigation cluster (rows-per-page control + First / Prev /
 * Next / Last). Split out of Pager.tsx so each file stays small and the page-math component
 * reads cleanly; purely presentational, driven by the resolved page bounds passed in.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useUi, type UiTranslate } from '@dloizides/ui-feedback';

import { accessibleName } from '../accessibleName';
import { TABLE_I18N, TABLE_TEST_IDS } from './constants';
import { SizeDropdown } from './SizeDropdown';
import { chromeStyles as c } from './styles';
import type { PagerStyleOverrides } from './Pager';

const FIRST_PAGE = 1;
const DISABLED_OPACITY = 0.4;
const FULL_OPACITY = 1;
const TRANSPARENT = 'transparent';
/** Grows the touch target toward WCAG ≥44px without changing rendered size (vertical only). */
const PAGER_HIT_SLOP = { top: 10, bottom: 10 } as const;

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

export interface PagerNavProps {
  pageSize: number;
  pageSizeOptions: readonly number[];
  onPageSizeChange: (pageSize: number) => void;
  onPageChange: (page: number) => void;
  safePage: number;
  lastPage: number;
  isCompact: boolean;
  isDropdown: boolean;
  showFirstLast: boolean;
  testID: string;
  styleOverrides?: PagerStyleOverrides;
}

/**
 * Accessible NAME of the rows-per-page control — "Rows per page, currently 50", never the
 * bare "50" it used to be, which announces the value but never says what the control is.
 */
function rowsTriggerLabel(t: UiTranslate, pageSize: number): string {
  const size = String(pageSize);
  return accessibleName(t(TABLE_I18N.pagerRowsTriggerLabel, size), TABLE_I18N.pagerRowsTriggerLabel, size);
}

/**
 * Accessible NAME of ONE rows-per-page choice — "Show 100 rows per page". Shared by the
 * `dropdown` options AND the default `pills`, which carried the identical bare-number defect.
 */
function rowsOptionLabel(t: UiTranslate, optionSize: number): string {
  const size = String(optionSize);
  return accessibleName(t(TABLE_I18N.pagerRowsOptionLabel, size), TABLE_I18N.pagerRowsOptionLabel, size);
}

/** The rows-per-page control (hidden when compact): a dropdown or a row of size pills. */
function RowsControl({ pageSize, pageSizeOptions, onPageSizeChange, isDropdown, testID, styleOverrides: o }: Pick<PagerNavProps, 'pageSize' | 'pageSizeOptions' | 'onPageSizeChange' | 'isDropdown' | 'testID' | 'styleOverrides'>): React.ReactElement {
  const { theme, t } = useUi();
  const { colors, palette } = theme;
  const brand = palette.primary['500'];

  return (
    <>
      <Text style={[isDropdown ? c.pagerRowsLabelPlain : c.pagerRowsLabel, { color: colors.textSecondary }, o?.pagerRowsLabel]}>
        {t(TABLE_I18N.pagerRows)}
      </Text>
      {isDropdown ? (
        <SizeDropdown
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={onPageSizeChange}
          testID={testID}
          triggerLabel={rowsTriggerLabel(t, pageSize)}
          getOptionLabel={(size) => rowsOptionLabel(t, size)}
          triggerHint={t(TABLE_I18N.pagerRowsTriggerHint)}
          optionHint={t(TABLE_I18N.pagerRowsOptionHint)}
          textColor={colors.text}
          mutedColor={colors.textSecondary}
          borderColor={colors.border}
          surfaceColor={colors.surface}
          brandColor={brand}
          triggerStyle={o?.sizePill}
          triggerTextStyle={o?.sizePillText}
        />
      ) : (
        <View style={[c.sizeGroup, o?.sizeGroup]}>
          {pageSizeOptions.map((size) => {
            const active = size === pageSize;
            return (
              <Pressable
                key={size}
                testID={`${testID}-size-${size}`}
                accessibilityRole="button"
                accessibilityLabel={rowsOptionLabel(t, size)}
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
      )}
    </>
  );
}

export function PagerNav({
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  onPageChange,
  safePage,
  lastPage,
  isCompact,
  isDropdown,
  showFirstLast,
  testID,
  styleOverrides: o,
}: PagerNavProps): React.ReactElement {
  const { theme, t } = useUi();
  const { colors } = theme;
  const atFirst = safePage <= FIRST_PAGE;
  const atLast = safePage >= lastPage;
  const showJumps = showFirstLast && !isCompact;

  return (
    <View style={[c.pagerNav, o?.pagerNav]}>
      {!isCompact && (
        <RowsControl
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={onPageSizeChange}
          isDropdown={isDropdown}
          testID={testID}
          styleOverrides={o}
        />
      )}
      {showJumps && (
        <NavButton
          label={t(TABLE_I18N.pagerFirst)}
          hint={t(TABLE_I18N.pagerFirstHint)}
          disabled={atFirst}
          onPress={() => onPageChange(FIRST_PAGE)}
          color={colors.text}
          border={colors.border}
          styleOverrides={o}
          testID={TABLE_TEST_IDS.pagerFirst}
        />
      )}
      <NavButton
        label={t(TABLE_I18N.pagerPrev)}
        hint={t(TABLE_I18N.pagerPrevHint)}
        disabled={atFirst}
        onPress={() => onPageChange(safePage - 1)}
        color={colors.text}
        border={colors.border}
        styleOverrides={o}
        testID={TABLE_TEST_IDS.pagerPrev}
      />
      <NavButton
        label={t(TABLE_I18N.pagerNext)}
        hint={t(TABLE_I18N.pagerNextHint)}
        disabled={atLast}
        onPress={() => onPageChange(safePage + 1)}
        color={colors.text}
        border={colors.border}
        styleOverrides={o}
        testID={TABLE_TEST_IDS.pagerNext}
      />
      {showJumps && (
        <NavButton
          label={t(TABLE_I18N.pagerLast)}
          hint={t(TABLE_I18N.pagerLastHint)}
          disabled={atLast}
          onPress={() => onPageChange(lastPage)}
          color={colors.text}
          border={colors.border}
          styleOverrides={o}
          testID={TABLE_TEST_IDS.pagerLast}
        />
      )}
    </View>
  );
}

export default PagerNav;
