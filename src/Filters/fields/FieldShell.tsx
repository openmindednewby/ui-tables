/**
 * FieldShell — the label-over-control wrapper every declarative field shares. Applies the
 * per-field width/grow reflow rules (so fields wrap to new lines as the bar narrows — the
 * FilterBar's responsive behaviour) and the caller's per-field style override LAST.
 */
import React from 'react';
import { Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { FIELD_MIN_WIDTH, fieldTestID } from '../constants';
import { filterStyles as s } from '../styles';
import type { FilterField } from '../types';

const GROW_FLEX = 1;

export interface FieldShellProps {
  field: FilterField;
  barTestID: string;
  children: React.ReactNode;
}

export function FieldShell({ field, barTestID, children }: FieldShellProps): React.ReactElement {
  const { theme } = useUi();
  const minWidth = field.minWidth ?? FIELD_MIN_WIDTH[field.kind];
  const grow = field.grow === true ? { flexGrow: GROW_FLEX } : null;

  return (
    <View
      style={[s.field, { minWidth }, grow, field.style]}
      testID={field.testID ?? fieldTestID(barTestID, field.key)}
    >
      <Text style={[s.label, { color: theme.colors.textSecondary }]}>{field.label}</Text>
      {children}
    </View>
  );
}

export default FieldShell;
