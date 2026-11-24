import React from 'react';
import { StyleSheet, View } from 'react-native';

export const ROW_ACTIONS_TEST_ID = 'ui-row-actions';
/** Space between two row-action buttons in a compact table row. */
export const ROW_ACTIONS_GAP = 4;

const styles = StyleSheet.create({
  group: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: ROW_ACTIONS_GAP },
  end: { justifyContent: 'flex-end' },
});

export const enum RowActionsAlign {
  Start = 'start',
  End = 'end',
}

export interface RowActionsProps {
  /** The row's buttons, normally `size="sm"` (28 px) secondary buttons. */
  children: React.ReactNode;
  align?: RowActionsAlign;
  testID?: string;
}

/** The trailing action cell of a table row: its buttons side by side with a 4 px gap, wrapping when the cell is narrow. */
export function RowActions({ children, align = RowActionsAlign.Start, testID = ROW_ACTIONS_TEST_ID }: RowActionsProps): React.ReactElement {
  return (
    <View style={[styles.group, align === RowActionsAlign.End && styles.end]} testID={testID}>
      {children}
    </View>
  );
}
