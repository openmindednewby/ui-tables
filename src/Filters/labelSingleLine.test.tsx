import { render, screen } from '@testing-library/react';

import { UiProvider, type UiTheme } from '@dloizides/ui-feedback';

import { Filters } from './Filters';
import { FiltersVariant } from './FiltersVariant';
import type { FilterField, FilterValues } from './types';

const THEME: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111111', textSecondary: '#666666', border: '#dddddd' },
  palette: { primary: { '500': '#0f766e' } },
  semantic: { error: { '500': '#dc2626' } },
};
const LONG_LABEL = 'Search sources and jobs';
const FIELDS: readonly FilterField[] = [
  { key: 'q', kind: 'text', label: LONG_LABEL },
  { key: 'status', kind: 'select', label: 'Status', options: [{ label: 'Any', value: '' }] },
  { key: 'group', kind: 'select', label: 'Group', options: [{ label: 'Any', value: '' }] },
  { key: 'sort', kind: 'select', label: 'Sort', options: [{ label: 'Any', value: '' }] },
];
const VALUES: FilterValues = { q: '', status: '', group: '', sort: '' };

function labelStyle(variant: FiltersVariant): CSSStyleDeclaration {
  render(
    <UiProvider theme={THEME} t={(key) => key}>
      <Filters testID="jobs" variant={variant} fields={FIELDS} values={VALUES} onChange={() => undefined} />
    </UiProvider>,
  );
  return getComputedStyle(screen.getByText(LONG_LABEL));
}

describe('Filters field label', () => {
  it.each([FiltersVariant.Grid, FiltersVariant.Boxed, FiltersVariant.Bare])(
    'with a label longer than its %s cell, stays on one line and ends in an ellipsis so the control keeps the row top edge',
    (variant) => {
      const expected = { whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflowX: 'hidden' };

      const style = labelStyle(variant);

      expect({ whiteSpace: style.whiteSpace, textOverflow: style.textOverflow, overflowX: style.overflowX }).toEqual(expected);
    },
  );
});
