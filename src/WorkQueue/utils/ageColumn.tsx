import React from 'react';

import type { DurationUnit } from '../../StatusLedger/DurationUnit';
import { StatusTone } from '../../StatusLedger/StatusTone';
import type { StatusLedgerColumn } from '../../StatusLedger/types';
import { assignAgeBand, type AgeBand } from '../../StatusLedger/utils/ageBands';
import type { DurationStrings } from '../../StatusLedger/utils/duration';
import type { AgeCellProps } from '../components/AgeCells';
import { AGE_COLUMN_KEY } from '../constants';
import type { WorkQueueLabels } from '../types';

export interface AgeColumnOptions<T> {
  Cell: React.ComponentType<AgeCellProps>;
  minWidth: number;
  ageOf: (row: T) => number | null;
  bands: readonly AgeBand[];
  strings: DurationStrings;
  labels: WorkQueueLabels;
  limitMs: number;
  toneColor: (tone: StatusTone) => string;
  largestUnit?: DurationUnit;
}

/** The sortable age column, each row drawn by `Cell` in its age band's tone. */
export function buildAgeColumn<T>(options: AgeColumnOptions<T>): StatusLedgerColumn<T> {
  const { Cell, minWidth, ageOf, bands, strings, labels, limitMs, toneColor, largestUnit } = options;
  const render = (row: T): React.ReactNode => {
    const age = ageOf(row);
    const color = toneColor(assignAgeBand(age, bands)?.tone ?? StatusTone.Neutral);
    return <Cell ageMs={age} ageOfLimit={labels.ageOfLimit} color={color} largestUnit={largestUnit} limitMs={limitMs} strings={strings} />;
  };
  return { key: AGE_COLUMN_KEY, header: labels.age, minWidth, sortValue: ageOf, render };
}
