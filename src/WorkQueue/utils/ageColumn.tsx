import React from 'react';

import { AgeBar } from '../../StatusLedger/components/AgeBar';
import { AgeLabel } from '../../StatusLedger/components/AgeLabel';
import type { DurationUnit } from '../../StatusLedger/DurationUnit';
import { StatusTone } from '../../StatusLedger/StatusTone';
import type { StatusLedgerColumn } from '../../StatusLedger/types';
import { assignAgeBand, type AgeBand } from '../../StatusLedger/utils/ageBands';
import { ageFraction, fillTemplate, formatDuration, type DurationStrings } from '../../StatusLedger/utils/duration';
import { AGE_BAR_MIN_WIDTH, AGE_COLUMN_KEY, AGE_MIN_WIDTH } from '../constants';
import type { WorkQueueLabels } from '../types';

export interface AgeColumnOptions<T> {
  asBar: boolean;
  ageOf: (row: T) => number | null;
  bands: readonly AgeBand[];
  strings: DurationStrings;
  labels: WorkQueueLabels;
  limitMs: number;
  toneColor: (tone: StatusTone) => string;
  largestUnit?: DurationUnit;
}

/** The sortable age column: a toned age label, or an age bar against `limitMs`. */
export function buildAgeColumn<T>(options: AgeColumnOptions<T>): StatusLedgerColumn<T> {
  const { asBar, ageOf, bands, strings, labels, limitMs, toneColor, largestUnit } = options;
  const colorOf = (age: number | null): string => toneColor(assignAgeBand(age, bands)?.tone ?? StatusTone.Neutral);
  const render = (row: T): React.ReactNode => {
    const age = ageOf(row);
    if (!asBar) return <AgeLabel ageMs={age} color={colorOf(age)} largestUnit={largestUnit} strings={strings} />;
    const label = fillTemplate(labels.ageOfLimit, { age: formatDuration(age, strings, largestUnit), limit: formatDuration(limitMs, strings, largestUnit) });
    return <AgeBar color={colorOf(age)} fraction={ageFraction(age, limitMs)} label={label} />;
  };
  return { key: AGE_COLUMN_KEY, header: labels.age, minWidth: asBar ? AGE_BAR_MIN_WIDTH : AGE_MIN_WIDTH, sortValue: ageOf, render };
}
