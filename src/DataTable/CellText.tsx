import React, { useContext } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

import { NO_WRAP_TEXT, titleRef } from './cellFit';
import { CellFitContext } from './cellFitContext';

export interface CellTextProps {
  children: string;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

/** Text inside a custom cell that follows its column's `noWrap` / `maxLines`; a clamped text keeps its full value in the web title. */
export function CellText({ children, style, testID }: CellTextProps): React.ReactElement {
  const { noWrap, maxLines } = useContext(CellFitContext);
  return (
    <Text ref={maxLines !== undefined ? titleRef(children) : undefined} numberOfLines={maxLines} style={[noWrap === true ? NO_WRAP_TEXT : null, style]} testID={testID}>
      {children}
    </Text>
  );
}
