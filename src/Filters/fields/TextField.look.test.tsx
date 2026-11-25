import { useWindowDimensions } from 'react-native';

import { render, renderHook, screen } from '@testing-library/react';

import { UiProvider, type UiTheme } from '@dloizides/ui-feedback';
import { SelectLookProvider, lookInputBox, selectLookMetrics } from '@dloizides/ui-forms';

import { variantFields } from '../utils/variantLayout';
import { FiltersVariant } from '../FiltersVariant';
import type { FilterField, TextFilterField } from '../types';
import { TextField } from './TextField';

const theme: UiTheme = {
  colors: { background: '#fff', surface: '#fff', surfaceElevated: '#fff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#333' } },
  semantic: { error: { '500': '#900' } },
};
const noop = (): void => undefined;

describe('TextField', () => {
  it('inside a field select look, matches the select box height, padding, font and radius', () => {
    const width = renderHook(() => useWindowDimensions()).result.current.width;
    const box = lookInputBox(selectLookMetrics({ look: 'field' }, width)) ?? {};
    const field: TextFilterField = { key: 'q', kind: 'text', label: 'Search', testID: 'bar-q' };

    render(
      <UiProvider theme={theme} t={(key) => key}>
        <SelectLookProvider look="field">
          <TextField field={field} barTestID="bar" value="" onChange={noop} onSubmit={noop} />
        </SelectLookProvider>
      </UiProvider>,
    );

    expect(screen.getByTestId('bar-q-input')).toHaveStyle({ height: `${String(box.height)}px`, fontSize: `${String(box.fontSize)}px`, borderRadius: `${String(box.borderRadius)}px`, paddingTop: `${String(box.paddingVertical)}px` });
  });
});

describe('variantFields', () => {
  it('with the Grid variant and a grow search beside three selects, gives the search two of five columns', () => {
    const fields: FilterField[] = [
      { kind: 'text', key: 'search', label: 'Search', grow: true },
      { kind: 'select', key: 'status', label: 'Status', options: [] },
      { kind: 'select', key: 'group', label: 'Group', options: [] },
      { kind: 'select', key: 'sort', label: 'Sort', options: [] },
    ];

    const laidOut = variantFields(fields, false, FiltersVariant.Grid);

    expect(laidOut.map((f) => [f.gridColumns, f.gridSpan])).toEqual([[5, 2], [5, 1], [5, 1], [5, 1]]);
  });
});
