import { toCsv, type CsvColumn } from '@dloizides/utils';

import type { DateRangeValue } from '../../Filters/types';
import { ExportOutcome } from '../ExportOutcome';
import type { FetchedRows } from './fetchAllPages';

const CSV_MIME = 'text/csv;charset=utf-8';
const UTF8_BOM = '﻿';
const CSV_EXTENSION = '.csv';
const UNSAFE_FILENAME_CHARS = /[^A-Za-z0-9._-]+/g;
const SAFE_REPLACEMENT = '-';
const RANGE_JOINER = '--';
const PART_JOINER = '_';

export type CsvRowsSource<T> = readonly T[] | (() => Promise<readonly T[] | FetchedRows<T>>);

function isFetchedRows<T>(data: readonly T[] | FetchedRows<T>): data is FetchedRows<T> {
  return !Array.isArray(data);
}

export type CsvDownloader = (csv: string, filename: string) => boolean;

export function csvFilename(base: string, range?: DateRangeValue): string {
  const safeBase = base.trim().replace(UNSAFE_FILENAME_CHARS, SAFE_REPLACEMENT);
  if (range === undefined) return `${safeBase}${CSV_EXTENSION}`;
  const hasRange = range.from !== '' || range.to !== '';
  const name = hasRange ? `${safeBase}${PART_JOINER}${range.from}${RANGE_JOINER}${range.to}` : safeBase;
  return `${name}${CSV_EXTENSION}`;
}

export function downloadCsv(csv: string, filename: string): boolean {
  const hasDom = typeof document !== 'undefined' && typeof URL !== 'undefined';
  if (!hasDom || typeof URL.createObjectURL !== 'function') return false;
  const url = URL.createObjectURL(new Blob([UTF8_BOM, csv], { type: CSV_MIME }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

export async function runCsvExport<T>(
  rows: CsvRowsSource<T>,
  columns: ReadonlyArray<CsvColumn<T>>,
  filename: string,
  download: CsvDownloader = downloadCsv,
): Promise<ExportOutcome> {
  try {
    const loaded = typeof rows === 'function' ? await rows() : rows;
    const data = isFetchedRows(loaded) ? loaded.rows : loaded;
    const truncated = isFetchedRows(loaded) && loaded.truncated;
    if (!download(toCsv(data, columns), filename)) return ExportOutcome.Unsupported;
    return truncated ? ExportOutcome.Truncated : ExportOutcome.Downloaded;
  } catch {
    return ExportOutcome.Failed;
  }
}
