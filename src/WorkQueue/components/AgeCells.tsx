import React from 'react';

import { AgeBar } from '../../StatusLedger/components/AgeBar';
import { AgeLabel } from '../../StatusLedger/components/AgeLabel';
import type { DurationUnit } from '../../StatusLedger/DurationUnit';
import { ageFraction, fillTemplate, formatDuration, type DurationStrings } from '../../StatusLedger/utils/duration';

export interface AgeCellProps {
  ageMs: number | null;
  color: string;
  strings: DurationStrings;
  limitMs: number;
  ageOfLimit: string;
  largestUnit?: DurationUnit;
}

/** Age cell as a toned age label. */
export function AgeLabelCell({ ageMs, color, strings, largestUnit }: AgeCellProps): React.ReactElement {
  return <AgeLabel ageMs={ageMs} color={color} largestUnit={largestUnit} strings={strings} />;
}

/** Age cell as a bar filled against `limitMs`, labelled "age of limit". */
export function AgeBarCell({ ageMs, color, strings, limitMs, ageOfLimit, largestUnit }: AgeCellProps): React.ReactElement {
  const label = fillTemplate(ageOfLimit, { age: formatDuration(ageMs, strings, largestUnit), limit: formatDuration(limitMs, strings, largestUnit) });
  return <AgeBar color={color} fraction={ageFraction(ageMs, limitMs)} label={label} />;
}
