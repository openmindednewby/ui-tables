import { render, screen } from '@testing-library/react';
import React from 'react';

import { UiProvider, type UiTheme } from '@dloizides/ui-feedback';

import { Filters } from './Filters';
import { applyTestID, clearTestID, fieldTestID } from './constants';
import type { FilterField, FilterValues } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#4f46e5' } },
  semantic: { error: { '500': '#dc2626' } },
};
const VALUES: FilterValues = { name: '' };
const noop = (): void => undefined;

function renderBar(fields: readonly FilterField[], ids?: { apply?: string; clear?: string }): void {
  render(
    <UiProvider theme={theme} t={(key) => key}>
      <Filters actionTestIDs={ids} fields={fields} testID="bar" values={VALUES} onApply={noop} onChange={noop} onClear={noop} />
    </UiProvider>,
  );
}

describe('Filters actionTestIDs', () => {
  it('with caller ids, puts them on Apply and Clear', () => {
    const fields: FilterField[] = [{ key: 'name', kind: 'text', label: 'Name' }];

    renderBar(fields, { apply: 'search-submit', clear: 'search-reset' });

    expect([screen.queryByTestId('search-submit') !== null, screen.queryByTestId('search-reset') !== null]).toEqual([true, true]);
  });

  it('without caller ids, keeps the derived Apply and Clear ids', () => {
    const fields: FilterField[] = [{ key: 'name', kind: 'text', label: 'Name' }];

    renderBar(fields);

    expect([screen.queryByTestId(applyTestID('bar')) !== null, screen.queryByTestId(clearTestID('bar')) !== null]).toEqual([true, true]);
  });
});

describe('TextFilterField inputRef', () => {
  it('with an inputRef, the ref holds the rendered input', () => {
    const inputRef = React.createRef<HTMLInputElement>();
    const fields = [{ key: 'name', kind: 'text', label: 'Name', inputRef }] as unknown as FilterField[];

    renderBar(fields);

    expect(inputRef.current).toBe(screen.getByTestId(`${fieldTestID('bar', 'name')}-input`));
  });

  it('with an inputRef, focusing the ref focuses the input', () => {
    const inputRef = React.createRef<HTMLInputElement>();
    const fields = [{ key: 'name', kind: 'text', label: 'Name', inputRef }] as unknown as FilterField[];
    renderBar(fields);

    inputRef.current?.focus();

    expect(document.activeElement).toBe(screen.getByTestId(`${fieldTestID('bar', 'name')}-input`));
  });
});
