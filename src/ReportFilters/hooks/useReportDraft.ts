import { useCallback, useState } from 'react';

import type { ReportFilterValues } from '../types';
import { isRangeInverted, reportFiltersToSearch } from '../utils/reportQuery';

export interface ReportDraft {
  draft: ReportFilterValues;
  edit: (next: ReportFilterValues) => void;
}

export function useReportDraft(value: ReportFilterValues, onChange: (next: ReportFilterValues) => void): ReportDraft {
  const committedKey = reportFiltersToSearch(value);
  const [draft, setDraft] = useState(value);
  const [seenKey, setSeenKey] = useState(committedKey);

  if (seenKey !== committedKey) {
    setSeenKey(committedKey);
    setDraft(value);
  }

  const edit = useCallback(
    (next: ReportFilterValues) => {
      setDraft(next);
      if (!isRangeInverted(next.range)) onChange(next);
    },
    [onChange],
  );

  return { draft, edit };
}
