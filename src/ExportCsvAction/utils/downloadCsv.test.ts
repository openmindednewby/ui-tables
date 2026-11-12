import { ExportOutcome } from '../ExportOutcome';
import { csvFilename, runCsvExport } from './downloadCsv';

interface Row {
  merchant: string;
  total: number;
}

const COLUMNS = [
  { header: 'Merchant', value: (row: Row) => row.merchant },
  { header: 'Total', value: (row: Row) => row.total },
];

describe('csvFilename', () => {
  it('with a full range, appends from--to before the extension', () => {
    const range = { from: '2026-01-01', to: '2026-01-31' };

    const name = csvFilename('master-report', range);

    expect(name).toBe('master-report_2026-01-01--2026-01-31.csv');
  });

  it('with an empty range, returns the base name only', () => {
    const range = { from: '', to: '' };

    const name = csvFilename('master-report', range);

    expect(name).toBe('master-report.csv');
  });

  it('with spaces and slashes in the base, replaces them with dashes', () => {
    const base = 'Acme Ltd / payments';

    const name = csvFilename(base);

    expect(name).toBe('Acme-Ltd-payments.csv');
  });
});

describe('runCsvExport', () => {
  it('with rows and a working downloader, hands it the CSV and returns Downloaded', async () => {
    const download = jest.fn().mockReturnValue(true);
    const rows: Row[] = [{ merchant: 'Acme, Ltd', total: 12 }];

    const outcome = await runCsvExport(rows, COLUMNS, 'r.csv', download);

    expect(outcome).toBe(ExportOutcome.Downloaded);
    expect(download).toHaveBeenCalledWith('Merchant,Total\r\n"Acme, Ltd",12', 'r.csv');
  });

  it('with an async row loader, waits for its rows before downloading', async () => {
    const download = jest.fn().mockReturnValue(true);
    const loadRows = (): Promise<Row[]> => Promise.resolve([{ merchant: 'Beta', total: 3 }]);

    await runCsvExport(loadRows, COLUMNS, 'r.csv', download);

    expect(download).toHaveBeenCalledWith('Merchant,Total\r\nBeta,3', 'r.csv');
  });

  it('with a loader reporting truncated rows, downloads them and returns Truncated', async () => {
    const download = jest.fn().mockReturnValue(true);
    const loadRows = (): Promise<{ rows: Row[]; truncated: boolean }> =>
      Promise.resolve({ rows: [{ merchant: 'Beta', total: 3 }], truncated: true });

    const outcome = await runCsvExport(loadRows, COLUMNS, 'r.csv', download);

    expect(outcome).toBe(ExportOutcome.Truncated);
    expect(download).toHaveBeenCalledWith('Merchant,Total\r\nBeta,3', 'r.csv');
  });

  it('with a loader reporting complete rows, returns Downloaded', async () => {
    const download = jest.fn().mockReturnValue(true);
    const loadRows = (): Promise<{ rows: Row[]; truncated: boolean }> =>
      Promise.resolve({ rows: [{ merchant: 'Beta', total: 3 }], truncated: false });

    const outcome = await runCsvExport(loadRows, COLUMNS, 'r.csv', download);

    expect(outcome).toBe(ExportOutcome.Downloaded);
  });

  it('with truncated rows and a downloader that cannot download, returns Unsupported', async () => {
    const download = jest.fn().mockReturnValue(false);
    const loadRows = (): Promise<{ rows: Row[]; truncated: boolean }> => Promise.resolve({ rows: [], truncated: true });

    const outcome = await runCsvExport(loadRows, COLUMNS, 'r.csv', download);

    expect(outcome).toBe(ExportOutcome.Unsupported);
  });

  it('with a downloader that cannot download, returns Unsupported', async () => {
    const download = jest.fn().mockReturnValue(false);

    const outcome = await runCsvExport([], COLUMNS, 'r.csv', download);

    expect(outcome).toBe(ExportOutcome.Unsupported);
  });

  it('with a row loader that rejects, returns Failed without downloading', async () => {
    const download = jest.fn();
    const loadRows = (): Promise<Row[]> => Promise.reject(new Error('network'));

    const outcome = await runCsvExport(loadRows, COLUMNS, 'r.csv', download);

    expect(outcome).toBe(ExportOutcome.Failed);
    expect(download).not.toHaveBeenCalled();
  });
});
