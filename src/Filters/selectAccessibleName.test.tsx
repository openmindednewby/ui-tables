/**
 * SelectField accessible NAME — the defect: `accessibilityLabel` REPLACES the trigger's
 * visible text for a screen reader, so labelling it with the field name alone silently hid
 * the current selection. Sighted users saw "Closed"; screen-reader users heard only "Status".
 */
import { render, screen } from '@testing-library/react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { Filters } from './Filters';
import { FILTERS_I18N, FILTERS_TEST_ID, fieldTestID } from './constants';
import type { FilterField, FilterValues } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#4f46e5' } },
  semantic: { error: { '500': '#dc2626' } },
};

const EN: Record<string, string> = {
  [FILTERS_I18N.selectPlaceholder]: 'Any',
  [FILTERS_I18N.selectTriggerLabel]: '{{p1}}: {{p2}}',
};
const EL: Record<string, string> = {
  ...EN,
  [FILTERS_I18N.selectTriggerLabel]: '{{p1}} — επιλογή {{p2}}',
};

function makeT(map: Record<string, string>): UiValue['t'] {
  return (key, p1, p2, p3) => {
    const template = map[key];
    if (template === undefined) return key;
    return template.replace('{{p1}}', p1 ?? '').replace('{{p2}}', p2 ?? '').replace('{{p3}}', p3 ?? '');
  };
}

const FIELDS: readonly FilterField[] = [
  { key: 'status', kind: 'select', label: 'Status', options: [{ label: 'Any', value: '' }, { label: 'Closed', value: 'closed' }] },
];

const noop = (): void => undefined;
const TRIGGER = `${fieldTestID(FILTERS_TEST_ID, 'status')}-trigger`;

function renderSelect(values: FilterValues, map: Record<string, string> = EN): void {
  render(
    <UiProvider theme={theme} t={makeT(map)}>
      <Filters fields={FIELDS} values={values} onChange={noop} />
    </UiProvider>,
  );
}

function labelOf(testID: string): string {
  return screen.getByTestId(testID).getAttribute('aria-label') ?? '';
}

describe('SelectField — accessible name carries the selection', () => {
  it('announces the selected value, not just the field name', () => {
    renderSelect({ status: 'closed' });
    expect(labelOf(TRIGGER)).toBe('Status: Closed');
    // The regression: the name was the field label alone, hiding what was selected.
    expect(labelOf(TRIGGER)).not.toBe('Status');
  });

  it('announces the placeholder when nothing is selected', () => {
    renderSelect({ status: '' });
    expect(labelOf(TRIGGER)).toBe('Status: Any');
  });

  it('is localized, not a hardcoded English join', () => {
    renderSelect({ status: 'closed' }, EL);
    expect(labelOf(TRIGGER)).toBe('Status — επιλογή Closed');
  });

  it('degrades to the field label for a host that has not defined the new key', () => {
    renderSelect({ status: 'closed' }, { [FILTERS_I18N.selectPlaceholder]: 'Any' });
    expect(labelOf(TRIGGER)).toBe('Status');
    expect(labelOf(TRIGGER)).not.toContain('uiTables.');
  });
});
