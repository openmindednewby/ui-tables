import { fireEvent, render, screen } from '@testing-library/react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';
import { DatePickerProvider } from '@dloizides/ui-forms';

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
  it('with a dateRange field, renders the from side with the shared range calendar', () => {
    renderFilters(EMPTY);

    const from = screen.getByTestId(`${RANGE_ID}-from`);

    expect([from.tagName, screen.getByTestId(`${RANGE_ID}-calendar`).tagName]).toEqual(['INPUT', 'BUTTON']);
  });

  it('with a dateRange field, renders the to side with the shared range calendar', () => {
    renderFilters(EMPTY);

    const to = screen.getByTestId(`${RANGE_ID}-to`);

    expect([to.tagName, screen.getByTestId(`${RANGE_ID}-calendar`).tagName]).toEqual(['INPUT', 'BUTTON']);
  });

  it('with a stored range in en-GB, shows the from side as 1 Jan 2024', () => {
    render(
      <UiProvider theme={theme} t={t}>
        <DatePickerProvider locale="en-GB">
          <Filters fields={FIELDS} values={{ ...EMPTY, dates: { from: '2024-01-01', to: '2024-12-31' } }} onChange={() => undefined} />
        </DatePickerProvider>
      </UiProvider>,
    );

    const from = screen.getByTestId(`${RANGE_ID}-from`) as HTMLInputElement;

    expect(from.value).toBe('1 Jan 2024');
  });
});

describe('FilterFieldView wrapperTestID', () => {
  it('with a wrapperTestID, puts that id on the field wrapper', () => {
    render(<UiProvider theme={theme} t={t}><Filters fields={[{ ...FIELDS[0], wrapperTestID: 'wrap-dates' } as FilterField]} values={EMPTY} onChange={() => undefined} /></UiProvider>);

    const wrapper = screen.getByTestId('wrap-dates');

    expect(wrapper.contains(screen.getByTestId(`${RANGE_ID}-from`))).toBe(true);
  });

  it('with a wrapperTestID, keeps the range side ids derived from the field testID', () => {
    render(<UiProvider theme={theme} t={t}><Filters fields={[{ ...FIELDS[0], wrapperTestID: 'wrap-dates' } as FilterField]} values={EMPTY} onChange={() => undefined} /></UiProvider>);

    const to = screen.getByTestId(`${RANGE_ID}-to`);

    expect([to.tagName, screen.getByTestId(`${RANGE_ID}-calendar`).tagName]).toEqual(['INPUT', 'BUTTON']);
  });

  it('without a wrapperTestID, the wrapper keeps the field testID', () => {
    renderFilters(EMPTY);

    const wrappers = screen.getAllByTestId(RANGE_ID);

    expect(wrappers.length).toBeGreaterThan(0);
  });
});

describe('FilterFieldView date', () => {
  it('with a date field, renders the input inside the shared date picker', () => {
    renderFilters(EMPTY);

    const input = screen.getByTestId(DATE_ID);

    expect(screen.getByTestId(`${DATE_ID}-anchor`).contains(input)).toBe(true);
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


describe('FilterFieldView date inputTestID', () => {
  it('with an inputTestID, puts that id on the date picker input', () => {
    const field: FilterField = { key: 'on', kind: 'date', label: 'Booked on', inputTestID: 'booked-from' };
    render(<UiProvider theme={theme} t={t}><Filters fields={[field]} values={EMPTY} onChange={() => undefined} /></UiProvider>);

    const input = screen.getByTestId('booked-from');

    expect(screen.getByTestId('booked-from-anchor').contains(input)).toBe(true);
  });

  it('without an inputTestID, keeps the field testID plus -input', () => {
    renderFilters(EMPTY);

    const input = screen.queryByTestId(DATE_ID);

    expect(input).not.toBeNull();
  });
});
