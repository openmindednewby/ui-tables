import type { DurationUnit } from '../StatusLedger/DurationUnit';
import type { StatusLedgerProps } from '../StatusLedger/types';
import type { AgeBand } from '../StatusLedger/utils/ageBands';
import type { DurationStrings } from '../StatusLedger/utils/duration';
import type { TimeInput } from '../StatusLedger/utils/relativeTime';
import type { WorkQueueVariant } from './WorkQueueVariant';

/** Caller-translated strings: `ageOfLimit` uses `{{age}}` and `{{limit}}`, `bandCount` uses `{{n}}`. */
export interface WorkQueueLabels {
  age: string;
  ageOfLimit: string;
  bandCount: string;
}

export interface WorkQueueProps<T> {
  ledger: StatusLedgerProps<T>;
  getStartedAt: (row: T) => TimeInput;
  nowMs: number;
  bands: readonly AgeBand[];
  durationStrings: DurationStrings;
  labels: WorkQueueLabels;
  variant?: WorkQueueVariant;
  limitMs?: number;
  largestUnit?: DurationUnit;
  testID?: string;
}
