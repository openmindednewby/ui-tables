import { render, renderHook, screen } from '@testing-library/react';
import { useWindowDimensions } from 'react-native';

import { SelectLookProvider, selectLookMetrics, type SelectLook } from '@dloizides/ui-forms';
import { UiProvider, type UiTheme } from '@dloizides/ui-feedback';

import { ActionButton } from './ActionButton';

const THEME: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111111', textSecondary: '#666666', border: '#dddddd' },
  palette: { primary: { '500': '#1d4ed8' } },
  semantic: { error: { '500': '#dc2626' } },
};

function renderedHeight(look: SelectLook | undefined): string {
  const button = <ActionButton label="Apply" hint="Applies the filters" tone="primary" onPress={() => undefined} testID="apply" />;
  render(
    <UiProvider theme={THEME} t={(key) => key}>
      {look === undefined ? button : <SelectLookProvider look={look}>{button}</SelectLookProvider>}
    </UiProvider>,
  );
  return getComputedStyle(screen.getByTestId('apply')).height;
}

describe('ActionButton', () => {
  it('under the field look, is as tall as the field box at this window width', () => {
    const width = renderHook(() => useWindowDimensions()).result.current.width;
    const fieldHeight = `${String(selectLookMetrics({ look: 'field' }, width)?.height)}px`;

    const height = renderedHeight('field');

    expect(height).toBe(fieldHeight);
  });

  it('under the chip look, is as tall as the chip box at this window width', () => {
    const width = renderHook(() => useWindowDimensions()).result.current.width;
    const chipHeight = `${String(selectLookMetrics({ look: 'chip' }, width)?.height)}px`;

    const height = renderedHeight('chip');

    expect(height).toBe(chipHeight);
  });

  it('outside a select look, keeps its own height', () => {
    const look = undefined;

    const height = renderedHeight(look);

    expect(height).toBe('');
  });
});
