import { fireEvent, render, screen } from '@testing-library/react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { Filters } from './Filters';
import { FILTERS_I18N, FILTERS_TEST_ID, fieldTestID } from './constants';
import type { FilterField, FilterValues } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#4f46e5' } },
  semantic: { error: { '500': '#dc2626' } },
};
const T_MAP: Record<string, string> = { [FILTERS_I18N.from]: 'From', [FILTERS_I18N.to]: 'To' };
const t: UiValue['t'] = (key) => T_MAP[key] ?? key;

const FIELDS: readonly FilterField[] = [
  { key: 'dates', kind: 'dateRange', label: 'Value date' },
  { key: 'on', kind: 'date', label: 'Booked on' },
];
const EMPTY: FilterValues = { dates: { from: '', to: '' }, on: '' };
const RANGE_ID = fieldTestID(FILTERS_TEST_ID, 'dates');
const DATE_ID = `${fieldTestID(FILTERS_TEST_ID, 'on')}-input`;

function renderFilters(values: FilterValues, onChange: (v: FilterValues) => void = () => undefined): void {
  render(<UiProvider theme={theme} t={t}><Filters fields={FIELDS} values={values} onChange={onChange} /></UiProvider>);
}

describe('FilterFieldView dateRange', () => {
  it('with a dateRange field, renders the from side as a native date input', () => {
    renderFilters(EMPTY);

    const from = screen.getByTestId(`${RANGE_ID}-from`);

    expect(from.getAttribute('type')).toBe('date');
  });

  it('with a dateRange field, renders the to side as a native date input', () => {
    renderFilters(EMPTY);

    const to = screen.getByTestId(`${RANGE_ID}-to`);

    expect(to.getAttribute('type')).toBe('date');
  });

  it('with a stored range, shows each side as its ISO value', () => {
    renderFilters({ ...EMPTY, dates: { from: '2024-01-01', to: '2024-12-31' } });

    const from = screen.getByTestId(`${RANGE_ID}-from`) as HTMLInputElement;

    expect(from.value).toBe('2024-01-01');
  });
});

describe('FilterFieldView date', () => {
  it('with a date field, renders a native date input', () => {
    renderFilters(EMPTY);

    const input = screen.getByTestId(DATE_ID);

    expect(input.getAttribute('type')).toBe('date');
  });

  it('with a date picked, emits the ISO value under the field key', () => {
    const onChange = jest.fn();
    renderFilters(EMPTY, onChange);

    fireEvent.change(screen.getByTestId(DATE_ID), { target: { value: '2024-03-05' } });

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ on: '2024-03-05' }));
  });

  it('with a non-string stored value, shows an empty input', () => {
    renderFilters({ ...EMPTY, on: true });

    const input = screen.getByTestId(DATE_ID) as HTMLInputElement;

    expect(input.value).toBe('');
  });
});
