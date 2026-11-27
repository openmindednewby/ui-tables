import React from 'react';
import { View } from 'react-native';

import type { ChipTone } from './chipTone';
import { chipSizeStyles as c } from './chipSizeStyles';

export interface ChipBackdropProps {
  tone: ChipTone;
  dashed?: boolean;
  testID?: string;
}

/** The thin pill drawn behind a compact chip, inset so the chip's 44 px tap box stays around it. */
export function ChipBackdrop({ tone, dashed = false, testID }: ChipBackdropProps): React.ReactElement {
  return <View aria-hidden pointerEvents="none" style={[c.backdrop, tone, dashed && c.dashed]} testID={testID} />;
}
