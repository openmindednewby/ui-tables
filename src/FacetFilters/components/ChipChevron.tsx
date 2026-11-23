import React from 'react';
import { Text } from 'react-native';

import { facetStyles as s } from './styles';

const CHEVRON_GLYPH = ' \u25BE';

/** The small down chevron a chip shows when it opens a picker. */
export function ChipChevron({ color }: { color: string }): React.ReactElement {
  return (
    <Text aria-hidden style={[s.chevron, { color }]}>
      {CHEVRON_GLYPH}
    </Text>
  );
}
