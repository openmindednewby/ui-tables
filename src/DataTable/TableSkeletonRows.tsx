import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';
import { Skeleton } from '@dloizides/ui-motion';

import { TABLE_I18N } from './constants';
import { SKELETON_TEST_ID, skeletonBarWidth, skeletonRowIndexes, skeletonRowTestID } from './skeletonBars';

const DEFAULT_ROWS = 5;
const BAR_HEIGHT = 12;
const LABEL_BAR_WIDTH = '28%';
const LINE_GAP = 8;
const CELL_LINE_HEIGHT = 20;

const s = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row' },
  cell: { justifyContent: 'center', minHeight: CELL_LINE_HEIGHT },
  numeric: { alignItems: 'flex-end' },
  card: { gap: LINE_GAP },
  cardLine: { alignItems: 'center', flexDirection: 'row', gap: LINE_GAP },
});

/** One placeholder column: the same width share as the real column, so the bars sit under its header. */
export interface SkeletonColumn {
  key: string;
  weight?: number;
  minWidth?: number;
  numeric?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface TableSkeletonRowsProps {
  columns: ReadonlyArray<SkeletonColumn>;
  rows?: number;
  stacked?: boolean;
  rowStyle?: StyleProp<ViewStyle>;
  trailingGutter?: number;
  loadingLabel?: string;
  testID?: string;
}

/** Placeholder rows at a table's real columns and row height, shown while its first page loads. */
export function TableSkeletonRows({ columns, rows = DEFAULT_ROWS, stacked = false, rowStyle, trailingGutter, loadingLabel, testID = SKELETON_TEST_ID }: TableSkeletonRowsProps): React.ReactElement {
  const { theme, t } = useUi();
  const { colors } = theme;
  const bar = (width: string): React.ReactElement => <Skeleton backgroundColor={colors.border} height={BAR_HEIGHT} highlightColor={colors.surface} testID={`${testID}-bar`} width={width} />;
  const cellStyle = (col: SkeletonColumn): StyleProp<ViewStyle> => col.style ?? { flex: col.weight ?? 1, minWidth: col.minWidth };
  return (
    <View accessibilityLabel={loadingLabel ?? t(TABLE_I18N.loading)} accessibilityLiveRegion="polite" accessibilityRole="progressbar" aria-busy testID={testID}>
      {skeletonRowIndexes(rows).map((r) => (
        <View key={r} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[stacked ? s.card : s.row, { borderColor: colors.border }, rowStyle]} testID={skeletonRowTestID(testID, r)}>
          {columns.map((col, c) => stacked ? (
            <View key={col.key} style={s.cardLine}>{bar(LABEL_BAR_WIDTH)}{bar(skeletonBarWidth(r, c, col.numeric))}</View>
          ) : (
            <View key={col.key} style={[s.cell, col.numeric === true ? s.numeric : null, cellStyle(col)]}>{bar(skeletonBarWidth(r, c, col.numeric))}</View>
          ))}
          {trailingGutter === undefined || stacked ? null : <View style={{ width: trailingGutter }} />}
        </View>
      ))}
    </View>
  );
}
