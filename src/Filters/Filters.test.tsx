import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { Filters } from './Filters';
import { FILTERS_I18N, FILTERS_TEST_ID, applyTestID, clearTestID, fieldTestID } from './constants';
import type { FilterField, FilterValues } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#4f46e5' } },
  semantic: { error: { '500': '#dc2626' } },
};
const T_MAP: Record<string, string> = {
  [FILTERS_I18N.apply]: 'Apply',
  [FILTERS_I18N.clear]: 'Clear',
  [FILTERS_I18N.selectPlaceholder]: 'Any',
  [FILTERS_I18N.from]: 'From',
  [FILTERS_I18N.to]: 'To',
};
const t: UiValue['t'] = (key) => T_MAP[key] ?? key;

const FIELDS: readonly FilterField[] = [
  { key: 'q', kind: 'text', label: 'Search', grow: true },
  { key: 'year', kind: 'number', label: 'Year' },
  { key: 'status', kind: 'select', label: 'Status', options: [{ label: 'Any', value: '' }, { label: 'Open', value: 'open' }, { label: 'Closed', value: 'closed' }] },
  { key: 'dates', kind: 'dateRange', label: 'Value date' },
  { key: 'country', kind: 'typeahead', label: 'Country', options: [{ label: 'Cyprus', value: 'CY' }, { label: 'Canada', value: 'CA' }] },
  { key: 'active', kind: 'boolean', label: 'Active only' },
];

const EMPTY: FilterValues = { q: '', year: '', status: '', dates: { from: '', to: '' }, country: '', active: false };

function renderFilters(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<UiProvider theme={theme} t={t}>{ui}</UiProvider>);
}

describe('Filters — declarative schema render', () => {
  const noop = (): void => undefined;

  it('renders one control per field, from the schema', () => {
    renderFilters(<Filters fields={FIELDS} values={EMPTY} onChange={noop} />);
    expect(screen.getByTestId(FILTERS_TEST_ID)).toBeTruthy();
    expect(screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'q')}-input`)).toBeTruthy();
    expect(screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'year')}-input`)).toBeTruthy();
    expect(screen.getByTestId(fieldTestID(FILTERS_TEST_ID, 'status'))).toBeTruthy();
    expect(screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'dates')}-range`)).toBeTruthy();
    expect(screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'country')}-input`)).toBeTruthy();
    expect(screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'active')}-switch`)).toBeTruthy();
  });

  it('renders each field label', () => {
    renderFilters(<Filters fields={FIELDS} values={EMPTY} onChange={noop} />);
    for (const label of ['Search', 'Year', 'Status', 'Value date', 'Country', 'Active only']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });

  it('renders no fields for an empty schema (edge: zero fields)', () => {
    renderFilters(<Filters fields={[]} values={{}} onChange={noop} />);
    expect(screen.getByTestId(FILTERS_TEST_ID)).toBeTruthy();
  });
});

describe('Filters — live value model (no onApply)', () => {
  it('emits the full patched value map on a text edit', () => {
    const onChange = jest.fn();
    renderFilters(<Filters fields={FIELDS} values={EMPTY} onChange={onChange} />);
    fireEvent.change(screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'q')}-input`), { target: { value: 'acme' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ q: 'acme', status: '' }));
  });

  it('shows no Apply/Clear buttons in live mode', () => {
    renderFilters(<Filters fields={FIELDS} values={EMPTY} onChange={() => undefined} />);
    expect(screen.queryByTestId(applyTestID(FILTERS_TEST_ID))).toBeNull();
    expect(screen.queryByTestId(clearTestID(FILTERS_TEST_ID))).toBeNull();
  });

  it('numeric field emits its string value', () => {
    const onChange = jest.fn();
    renderFilters(<Filters fields={FIELDS} values={EMPTY} onChange={onChange} />);
    fireEvent.change(screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'year')}-input`), { target: { value: '1990' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ year: '1990' }));
  });

  it('boolean field toggles', () => {
    const onChange = jest.fn();
    renderFilters(<Filters fields={FIELDS} values={EMPTY} onChange={onChange} />);
    const sw = screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'active')}-switch`);
    // RN-web Switch renders an inner checkbox input; the change event drives onValueChange.
    const input = sw.tagName === 'INPUT' ? sw : (sw.querySelector('input') as HTMLElement);
    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ active: true }));
  });
});

describe('Filters — draft/apply value model (onApply set)', () => {
  it('renders Apply + Clear when both handlers are supplied', () => {
    renderFilters(<Filters fields={FIELDS} values={EMPTY} onChange={() => undefined} onApply={() => undefined} onClear={() => undefined} />);
    expect(screen.getByTestId(applyTestID(FILTERS_TEST_ID)).textContent).toContain('Apply');
    expect(screen.getByTestId(clearTestID(FILTERS_TEST_ID)).textContent).toContain('Clear');
  });

  it('fires onApply when Apply is pressed', () => {
    const onApply = jest.fn();
    renderFilters(<Filters fields={FIELDS} values={EMPTY} onChange={() => undefined} onApply={onApply} />);
    fireEvent.click(screen.getByTestId(applyTestID(FILTERS_TEST_ID)));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('fires onClear when Clear is pressed', () => {
    const onClear = jest.fn();
    renderFilters(<Filters fields={FIELDS} values={EMPTY} onChange={() => undefined} onApply={() => undefined} onClear={onClear} />);
    fireEvent.click(screen.getByTestId(clearTestID(FILTERS_TEST_ID)));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('commits on Enter in a text field (onSubmitEditing → keydown Enter)', () => {
    const onApply = jest.fn();
    renderFilters(<Filters fields={FIELDS} values={EMPTY} onChange={() => undefined} onApply={onApply} />);
    fireEvent.keyDown(screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'q')}-input`), { key: 'Enter', keyCode: 13, charCode: 13 });
    expect(onApply).toHaveBeenCalled();
  });

  it('does not commit on Enter when applyDisabled', () => {
    const onApply = jest.fn();
    renderFilters(<Filters fields={FIELDS} values={EMPTY} onChange={() => undefined} onApply={onApply} applyDisabled />);
    fireEvent.keyDown(screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'q')}-input`), { key: 'Enter', keyCode: 13, charCode: 13 });
    expect(onApply).not.toHaveBeenCalled();
  });

  it('disables the Apply button when applyDisabled', () => {
    renderFilters(<Filters fields={FIELDS} values={EMPTY} onChange={() => undefined} onApply={() => undefined} applyDisabled />);
    expect(screen.getByTestId(applyTestID(FILTERS_TEST_ID))).toBeDisabled();
  });
});

describe('Filters — select field', () => {
  it('shows the placeholder label when unset and opens the menu on press', () => {
    renderFilters(<Filters fields={FIELDS} values={EMPTY} onChange={() => undefined} />);
    const trigger = screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'status')}-trigger`);
    expect(trigger.textContent).toContain('Any');
    expect(screen.queryByTestId(`${fieldTestID(FILTERS_TEST_ID, 'status')}-menu`)).toBeNull();
    fireEvent.click(trigger);
    expect(screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'status')}-menu`)).toBeTruthy();
  });

  it('emits the picked option value and closes', () => {
    const onChange = jest.fn();
    renderFilters(<Filters fields={FIELDS} values={EMPTY} onChange={onChange} />);
    fireEvent.click(screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'status')}-trigger`));
    fireEvent.click(screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'status')}-option-open`));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'open' }));
    expect(screen.queryByTestId(`${fieldTestID(FILTERS_TEST_ID, 'status')}-menu`)).toBeNull();
  });

  it('shows the selected option label when a value is set', () => {
    renderFilters(<Filters fields={FIELDS} values={{ ...EMPTY, status: 'closed' }} onChange={() => undefined} />);
    expect(screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'status')}-trigger`).textContent).toContain('Closed');
  });

  it('uses a caller-injected select renderer (e.g. ui-layout ModalDropdown) when provided', () => {
    const onChange = jest.fn();
    renderFilters(
      <Filters
        fields={FIELDS}
        values={EMPTY}
        onChange={onChange}
        renderSelect={({ field, onChange: onSelect, testID }) => (
          <button type="button" data-testid={`${testID}-injected`} onClick={() => onSelect(field.options[1].value)}>
            injected
          </button>
        )}
      />,
    );
    // The built-in trigger is replaced by the injected control.
    expect(screen.queryByTestId(`${fieldTestID(FILTERS_TEST_ID, 'status')}-trigger`)).toBeNull();
    const injected = screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'status')}-injected`);
    fireEvent.click(injected);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'open' }));
  });
});

describe('Filters — typeahead field', () => {
  it('surfaces ranked suggestions as the user types and hides them until then', () => {
    const onChange = jest.fn();
    const { rerender } = renderFilters(<Filters fields={FIELDS} values={EMPTY} onChange={onChange} />);
    // No suggestions before typing.
    expect(screen.queryByTestId(`${fieldTestID(FILTERS_TEST_ID, 'country')}-menu`)).toBeNull();
    const input = screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'country')}-input`);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'ca' } });
    rerender(<UiProvider theme={theme} t={t}><Filters fields={FIELDS} values={{ ...EMPTY, country: 'ca' }} onChange={onChange} /></UiProvider>);
    expect(screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'country')}-option-CA`)).toBeTruthy();
  });

  it('picking a suggestion fills the canonical label', () => {
    const onChange = jest.fn();
    const { rerender } = renderFilters(<Filters fields={FIELDS} values={EMPTY} onChange={onChange} />);
    const input = screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'country')}-input`);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'cy' } });
    rerender(<UiProvider theme={theme} t={t}><Filters fields={FIELDS} values={{ ...EMPTY, country: 'cy' }} onChange={onChange} /></UiProvider>);
    fireEvent.click(screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'country')}-option-CY`));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ country: 'Cyprus' }));
  });

  it('renders a persistent error banner when the field carries an error', () => {
    const fields: readonly FilterField[] = [
      { key: 'country', kind: 'typeahead', label: 'Country', options: [{ label: 'Cyprus', value: 'CY' }], error: 'Unrecognised country' },
    ];
    renderFilters(<Filters fields={fields} values={{ country: 'xx' }} onChange={() => undefined} />);
    const err = screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'country')}-error`);
    expect(err.textContent).toBe('Unrecognised country');
    expect(err.getAttribute('role')).toBe('alert');
  });
});

describe('Filters — date range field', () => {
  it('patches only the from side, preserving to', () => {
    const onChange = jest.fn();
    renderFilters(<Filters fields={FIELDS} values={{ ...EMPTY, dates: { from: '', to: '2024-12-31' } }} onChange={onChange} />);
    fireEvent.change(screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'dates')}-from`), { target: { value: '2024-01-01' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ dates: { from: '2024-01-01', to: '2024-12-31' } }));
  });

  it('patches only the to side, preserving from', () => {
    const onChange = jest.fn();
    renderFilters(<Filters fields={FIELDS} values={{ ...EMPTY, dates: { from: '2024-01-01', to: '' } }} onChange={onChange} />);
    fireEvent.change(screen.getByTestId(`${fieldTestID(FILTERS_TEST_ID, 'dates')}-to`), { target: { value: '2024-12-31' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ dates: { from: '2024-01-01', to: '2024-12-31' } }));
  });
});

describe('Filters — results count + custom actions', () => {
  it('passes the results count through to the FilterBar live region', () => {
    renderFilters(<Filters fields={FIELDS} values={EMPTY} onChange={() => undefined} resultsCount={42} resultsLabel="results" />);
    expect(screen.getByTestId('ui-results').textContent).toContain('42');
    expect(screen.getByTestId('ui-results').textContent).toContain('results');
  });

  it('renders custom actions (Export) alongside Apply', () => {
    renderFilters(
      <Filters
        fields={FIELDS}
        values={EMPTY}
        onChange={() => undefined}
        onApply={() => undefined}
        actions={<button type="button">Export CSV</button>}
      />,
    );
    expect(screen.getByText('Export CSV')).toBeTruthy();
    expect(screen.getByTestId(applyTestID(FILTERS_TEST_ID))).toBeTruthy();
  });
});
