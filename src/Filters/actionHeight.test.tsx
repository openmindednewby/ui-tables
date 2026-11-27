import { render, screen } from '@testing-library/react';

let mockWidth = 1280;
jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native-web');
  return {
    ...actual,
    useWindowDimensions: (): { width: number; height: number; scale: number; fontScale: number } => ({ width: mockWidth, height: 800, scale: 1, fontScale: 1 }),
  };
});

import { UiProvider, type UiTheme } from '@dloizides/ui-feedback';

import { Filters } from './Filters';
import { FiltersVariant } from './FiltersVariant';
import { applyTestID, clearTestID } from './constants';
import type { FilterField, FilterValues } from './types';

const DESKTOP_WIDTH = 1280;
const PHONE_WIDTH = 360;
const TEST_ID = 'bar';
const THEME: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111111', textSecondary: '#666666', border: '#dddddd' },
  palette: { primary: { '500': '#1d4ed8' } },
  semantic: { error: { '500': '#dc2626' } },
};
const FIELDS: readonly FilterField[] = [{ key: 'q', kind: 'text', label: 'Search' }];
const VALUES: FilterValues = { q: '' };
const VARIANTS = [FiltersVariant.Boxed, FiltersVariant.Bare, FiltersVariant.Grid];

function renderActions(variant: FiltersVariant): HTMLElement[] {
  render(
    <UiProvider theme={THEME} t={(key) => key}>
      <Filters testID={TEST_ID} variant={variant} fields={FIELDS} values={VALUES} onChange={() => undefined} onApply={() => undefined} onClear={() => undefined} />
    </UiProvider>,
  );
  return [screen.getByTestId(applyTestID(TEST_ID)), screen.getByTestId(clearTestID(TEST_ID))];
}

describe('Filters action height', () => {
  afterEach(() => {
    mockWidth = DESKTOP_WIDTH;
  });

  it.each(VARIANTS)('with the %s variant on desktop, draws Apply and Reset 36 px tall', (variant) => {
    mockWidth = DESKTOP_WIDTH;

    const buttons = renderActions(variant);

    buttons.forEach((button) => expect(button).toHaveStyle({ height: '36px' }));
  });

  it.each(VARIANTS)('with the %s variant on a phone, keeps Apply and Reset at the 44 px touch floor', (variant) => {
    mockWidth = PHONE_WIDTH;

    const buttons = renderActions(variant);

    buttons.forEach((button) => expect(button).toHaveStyle({ minHeight: '44px' }));
  });
});
