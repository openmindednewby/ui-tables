import React from 'react';
import { Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { facetTestIds } from '../testIds';
import type { CursorFooterLabels } from '../types';
import { TextButton } from './TextButton';
import { facetStyles as s } from './styles';

export interface CursorFooterProps {
  total: number | null;
  size: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  labels: CursorFooterLabels;
  testIDPrefix?: string;
}

/** Footer for a cursor-paged list: found count, page size, Previous and Next; no page numbers or offset. */
export function CursorFooter({ total, size, hasPrev, hasNext, onPrev, onNext, labels, testIDPrefix }: CursorFooterProps): React.ReactElement {
  const { theme } = useUi();
  const ids = facetTestIds(testIDPrefix);
  return (
    <View style={s.footer} testID={ids.footer}>
      {total !== null && (
        <Text style={[s.chipText, s.chipLabel, { color: theme.colors.text }]} testID={ids.found}>
          {labels.found(total)}
        </Text>
      )}
      <Text style={[s.chipText, { color: theme.colors.textSecondary }]} testID={ids.pageSize}>
        {labels.pageSize(size)}
      </Text>
      <View style={s.footerNav}>
        <TextButton disabled={!hasPrev} hint={labels.prevHint} label={labels.prev} onPress={onPrev} testID={ids.prev} />
        <TextButton disabled={!hasNext} hint={labels.nextHint} label={labels.next} onPress={onNext} testID={ids.next} />
      </View>
    </View>
  );
}
