import React from 'react';

import { StyleSheet, Text } from 'react-native';

import { Button } from '@dloizides/ui-buttons';

export const REFRESH_ACTION_TEST_ID = 'ui-refresh-action';

const GLYPH_FONT = 16;
const REFRESH_GLYPH = '↻';

const s = StyleSheet.create({ glyph: { fontSize: GLYPH_FONT, fontWeight: '700' } });

export interface RefreshActionProps {
  label: string;
  hint: string;
  onPress: () => void | Promise<unknown>;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
}

export function RefreshAction({ label, hint, onPress, loading, disabled = false, testID = REFRESH_ACTION_TEST_ID }: RefreshActionProps): React.ReactElement {
  return (
    <Button
      accessibilityHint={hint}
      accessibilityLabel={label}
      disabled={disabled}
      label={label}
      loading={loading}
      renderIcon={(color) => <Text accessible={false} style={[s.glyph, { color }]} testID={`${testID}-glyph`}>{REFRESH_GLYPH}</Text>}
      size="md"
      testID={testID}
      variant="primary"
      onPress={onPress}
    />
  );
}

export default RefreshAction;
