import React, { useCallback, useState } from 'react';

import { Button } from '@dloizides/ui-buttons';
import type { CsvColumn } from '@dloizides/utils';

import type { ExportOutcome } from './ExportOutcome';
import { runCsvExport, type CsvRowsSource } from './utils/downloadCsv';

export const EXPORT_CSV_TEST_ID = 'ui-export-csv';

export interface ExportCsvActionProps<T> {
  rows: CsvRowsSource<T>;
  columns: ReadonlyArray<CsvColumn<T>>;
  filename: string;
  label: string;
  hint: string;
  disabled?: boolean;
  onDone?: (outcome: ExportOutcome) => void;
  testID?: string;
}

export function ExportCsvAction<T>({
  rows,
  columns,
  filename,
  label,
  hint,
  disabled = false,
  onDone,
  testID = EXPORT_CSV_TEST_ID,
}: ExportCsvActionProps<T>): React.ReactElement {
  const [busy, setBusy] = useState(false);

  const run = useCallback(async () => {
    setBusy(true);
    const outcome = await runCsvExport(rows, columns, filename);
    setBusy(false);
    onDone?.(outcome);
  }, [rows, columns, filename, onDone]);

  return (
    <Button
      label={label}
      accessibilityLabel={label}
      accessibilityHint={hint}
      disabled={disabled}
      loading={busy}
      onPress={() => {
        void run();
      }}
      testID={testID}
    />
  );
}

export default ExportCsvAction;
