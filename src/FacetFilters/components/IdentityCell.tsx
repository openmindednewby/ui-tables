import React from 'react';
import { Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { FACET_TEST_IDS, IDENTITY_JOINER } from '../constants';
import { facetStyles as s } from './styles';

export interface IdentityCellProps {
  primary: string;
  secondary: readonly (string | null | undefined)[];
  testID?: string;
}

/** Joins the non-empty secondary parts (for example ID and country code) with a middle dot. */
export function joinIdentityParts(parts: readonly (string | null | undefined)[]): string {
  return parts.filter((p): p is string => p !== null && p !== undefined && p !== '').join(IDENTITY_JOINER);
}

/** A two-line dense-row cell: the name, then the ID and country on a muted line. */
export function IdentityCell({ primary, secondary, testID = FACET_TEST_IDS.identityCell }: IdentityCellProps): React.ReactElement {
  const { theme } = useUi();
  const second = joinIdentityParts(secondary);
  return (
    <View testID={testID}>
      <Text numberOfLines={1} style={[s.primary, { color: theme.colors.text }]}>
        {primary}
      </Text>
      {second !== '' && (
        <Text numberOfLines={1} style={[s.secondary, { color: theme.colors.textSecondary }]}>
          {second}
        </Text>
      )}
    </View>
  );
}
