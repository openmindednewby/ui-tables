/**
 * Narrow-container guard. A field's per-kind minimum width (dateRange 260px, text 200px) used to
 * beat `maxWidth: '100%'`, so at a 400px viewport the date range ran past its card. These pin the
 * clamp itself and that the rendered field wrapper carries both halves of it.
 */
import { render, screen } from '@testing-library/react';

import { UiProvider, type UiTheme } from '@dloizides/ui-feedback';

import { Filters } from '../Filters';
import { FILTERS_TEST_ID, fieldTestID } from '../constants';
import type { FilterField, FilterValues } from '../types';
import { clampedMinWidth } from './clampedMinWidth';

// Test fixture only: any valid colour works; the assertions read layout, not colour.
const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#0b6bcb' } },
  semantic: { error: { '500': '#dc2626' } },
};

const DATE_FLOOR = 260;

describe('clampedMinWidth', () => {
  it('keeps the floor at desktop widths but never lets it exceed the container on web', () => {
    expect(clampedMinWidth(DATE_FLOOR)).toBe('min(260px, 100%)');
  });
});

describe('a filter field inside a narrow container', () => {
  it('caps the wrapper at the container and clamps its pixel floor to the container', () => {
    const fields: readonly FilterField[] = [{ key: 'captured', kind: 'dateRange', label: 'Captured' }];
    const values: FilterValues = { captured: { from: '', to: '' } };
    render(
      <UiProvider theme={theme} t={(key) => key}>
        <Filters fields={fields} values={values} onChange={() => undefined} />
      </UiProvider>,
    );
    const style = window.getComputedStyle(screen.getByTestId(fieldTestID(FILTERS_TEST_ID, 'captured')));
    expect(style.maxWidth).toBe('100%');
    expect(style.minWidth).toBe('min(260px, 100%)');
  });
});
