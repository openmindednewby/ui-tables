/**
 * The select-all-matching banner — **the flag, never the ids.**
 *
 * This is the only place the table admits rows exist beyond the current page, and it says
 * so in the only terms it honestly can: a COUNT the server reported, and a FLAG the
 * consumer resolves server-side against the same filter the list endpoint took.
 *
 * It deliberately does NOT enumerate the matching rows. It cannot — they are on pages that
 * were never fetched — and it must not: the ZY-02 spike measured this grid at ~2–3 ms and
 * ~16 DOM nodes per row, so "select all 5,000" as a DOM/id operation is indistinguishable
 * from an outage. `onAction()` carries no payload at all; the flag is the whole message.
 *
 * Reads `useUi()` directly (like `DataTable` and `Pager` do) rather than being handed a
 * dozen already-translated strings: it renders once per table, so the context read is free,
 * and it keeps the four count-dependent sentences next to the states that choose them.
 */
import React from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { TABLE_I18N } from './constants';
import { SelectAllBannerMode } from './selectAllBannerMode';
import { selectionStyles as sel } from './styles';

interface SelectAllBannerProps {
  mode: SelectAllBannerMode;
  /** Rows on the current page. */
  pageCount: number;
  /** Rows matching the filter across every page (server-reported). */
  matchingCount: number;
  /** Emits the FLAG: select all matching, or clear. */
  onAction: () => void;
  testID: string;
  actionTestID: string;
  styleOverride?: StyleProp<ViewStyle>;
}

export function SelectAllBanner({
  mode,
  pageCount,
  matchingCount,
  onAction,
  testID,
  actionTestID,
  styleOverride,
}: SelectAllBannerProps): React.ReactElement | null {
  const { theme, t } = useUi();
  const { colors, palette } = theme;

  if (mode === SelectAllBannerMode.Hidden) return null;

  const active = mode === SelectAllBannerMode.Active;
  const message = active
    ? t(TABLE_I18N.selectMatchingSelected, matchingCount.toLocaleString())
    : t(TABLE_I18N.selectPageSelected, pageCount.toLocaleString());
  const actionLabel = active
    ? t(TABLE_I18N.selectClear)
    : t(TABLE_I18N.selectAllMatching, matchingCount.toLocaleString());
  const actionHint = active ? t(TABLE_I18N.selectClearHint) : t(TABLE_I18N.selectAllMatchingHint);

  return (
    <View
      // `polite`, not `assertive`: this follows the operator's own click, so it should be
      // announced after what they did rather than interrupting them mid-action.
      accessibilityLiveRegion="polite"
      style={[sel.banner, { backgroundColor: colors.background }, styleOverride]}
      testID={testID}
    >
      <Text style={[sel.bannerText, { color: colors.textSecondary }]}>{message}</Text>
      <Pressable
        accessibilityHint={actionHint}
        accessibilityLabel={actionLabel}
        accessibilityRole="button"
        testID={actionTestID}
        onPress={onAction}
      >
        <Text style={[sel.bannerAction, { color: palette.primary['500'] }]}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}
