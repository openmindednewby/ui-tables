import { render, screen } from '@testing-library/react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { fieldTestID } from '../constants';
import type { TextFilterField } from '../types';
import { TextField } from './TextField';

const theme: UiTheme = {
  colors: { background: '#fff', surface: '#fff', surfaceElevated: '#fff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#333' } },
  semantic: { error: { '500': '#900' } },
};

const translateKey: UiValue['t'] = (key) => key;
const noop = (): void => undefined;

describe('TextField', () => {
  it('with an accessibilityHint on web, describes the DOM input with the hint text', () => {
    const hint = 'Searches name, email and organization';
    const field: TextFilterField = { key: 'search', kind: 'text', label: 'Search', accessibilityHint: hint };

    render(
      <UiProvider theme={theme} t={translateKey}>
        <TextField field={field} barTestID="bar" value="" onChange={noop} onSubmit={noop} />
      </UiProvider>,
    );

    const describedById = screen.getByTestId(`${fieldTestID('bar', 'search')}-input`).getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(describedById)?.textContent).toBe(hint);
  });
});
