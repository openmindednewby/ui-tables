import React from 'react';
import { Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { facetTestIds } from '../testIds';
import type { ColumnOption, ColumnPickerLabels } from '../types';
import { toggleColumn } from '../utils/columns';
import { ToggleOption } from './ToggleOption';
import { facetStyles as s } from './styles';

export interface ColumnPickerProps {
  columns: readonly ColumnOption[];
  visible: readonly string[];
  onChange: (visible: string[]) => void;
  labels: ColumnPickerLabels;
  testID?: string;
  testIDPrefix?: string;
}

/** Shows or hides table columns; locked columns stay on and say so in their hint. */
export function ColumnPicker({ columns, visible, onChange, labels, testID, testIDPrefix }: ColumnPickerProps): React.ReactElement {
  const { theme } = useUi();
  const ids = facetTestIds(testIDPrefix);
  return (
    <View accessibilityLabel={labels.title} style={[s.panel, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} testID={testID ?? ids.columnPicker}>
      <Text style={[s.panelTitle, { color: theme.colors.textSecondary }]}>{labels.title}</Text>
      {columns.map((c) => (
        <ToggleOption
          disabled={c.locked === true}
          hint={c.locked === true ? labels.lockedHint : labels.toggleHint}
          key={c.key}
          label={c.label}
          onPress={() => onChange(toggleColumn(columns, visible, c.key))}
          role="checkbox"
          selected={c.locked === true || visible.includes(c.key)}
          testID={ids.columnToggle(c.key)}
        />
      ))}
    </View>
  );
}
