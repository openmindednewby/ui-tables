import type { ReportFilterLabels, ReportFilterValues } from '../types';
import { buildReportFields, fromFilterValues, toFilterValues } from './reportFields';

const LABELS: ReportFilterLabels = {
  scope: 'Merchant',
  range: 'Value date',
  from: 'From',
  to: 'To',
  statuses: 'Status',
  currency: 'Currency',
  invalidRange: 'From must be on or before To',
  openPanel: 'Filters',
  openPanelHint: 'Opens the filters',
  panelTitle: 'Filters',
  closePanel: 'Done',
  closePanelHint: 'Closes the filters',
};
const OPTIONS = { scopes: [], statuses: [{ value: 'Settled', label: 'Settled' }], currencies: [] };

describe('buildReportFields', () => {
  it('with an inverted range, puts the invalid-range error on the range field', () => {
    const values: ReportFilterValues = { scope: '', range: { from: '2026-02-01', to: '2026-01-01' }, statuses: [], currency: '' };

    const fields = buildReportFields(OPTIONS, LABELS, values);

    expect(fields.find((field) => field.key === 'range')).toMatchObject({ error: 'From must be on or before To' });
  });

  it('with a valid range, leaves the range field without an error', () => {
    const values: ReportFilterValues = { scope: '', range: { from: '2026-01-01', to: '2026-02-01' }, statuses: [], currency: '' };

    const fields = buildReportFields(OPTIONS, LABELS, values);

    expect(fields.find((field) => field.key === 'range')).toMatchObject({ error: undefined });
  });
});

describe('fromFilterValues', () => {
  it('with a map made by toFilterValues, returns the original values', () => {
    const values: ReportFilterValues = { scope: 'm1', range: { from: '2026-01-01', to: '' }, statuses: ['Settled'], currency: 'EUR' };

    const restored = fromFilterValues(toFilterValues(values));

    expect(restored).toEqual(values);
  });

  it('with an empty map, returns every filter unset', () => {
    const map = {};

    const restored = fromFilterValues(map);

    expect(restored).toEqual({ scope: '', range: { from: '', to: '' }, statuses: [], currency: '' });
  });
});
