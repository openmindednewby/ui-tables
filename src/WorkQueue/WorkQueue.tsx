import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';

import { useToneColor } from '../StatusLedger/hooks/useLedgerView';
import { StatusLedger } from '../StatusLedger/StatusLedger';
import { sortOldestFirst } from '../StatusLedger/utils/ageBands';
import { elapsedMs } from '../StatusLedger/utils/duration';
import { AgeBandQueue } from './components/AgeBandQueue';
import { WORK_QUEUE_TEST_ID, workQueueLedgerTestID } from './constants';
import type { WorkQueueProps } from './types';
import { buildAgeColumn } from './utils/ageColumn';
import { WorkQueueVariant } from './WorkQueueVariant';

/** A StatusLedger of waiting work, oldest first, in one of three looks chosen by `variant` (default age bands). */
export function WorkQueue<T>(props: WorkQueueProps<T>): React.ReactElement {
  const { ledger, getStartedAt, nowMs, bands, durationStrings, labels, variant = WorkQueueVariant.Bands, limitMs, largestUnit, testID = WORK_QUEUE_TEST_ID } = props;
  const toneColor = useToneColor(ledger.toneColors);
  const ageOf = useCallback((row: T) => elapsedMs(getStartedAt(row), nowMs), [getStartedAt, nowMs]);
  const limit = limitMs ?? Math.max(0, ...bands.map((band) => band.minAgeMs));

  const queueLedger = useMemo(() => {
    const ageColumn = buildAgeColumn({ asBar: variant === WorkQueueVariant.Bar, ageOf, bands, strings: durationStrings, labels, limitMs: limit, toneColor, largestUnit });
    return { ...ledger, rows: sortOldestFirst(ledger.rows, ageOf), columns: [ageColumn, ...ledger.columns], testID: workQueueLedgerTestID(testID) };
  }, [ledger, ageOf, bands, durationStrings, labels, limit, toneColor, largestUnit, variant, testID]);

  if (variant === WorkQueueVariant.Bands) return <AgeBandQueue ageOf={ageOf} bandCountLabel={labels.bandCount} bands={bands} ledger={queueLedger} testID={testID} />;
  return (
    <View testID={testID}>
      <StatusLedger {...queueLedger} />
    </View>
  );
}
