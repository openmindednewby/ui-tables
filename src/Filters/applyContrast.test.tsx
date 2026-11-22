import { render, screen } from '@testing-library/react';

import { AA_NORMAL_TEXT_RATIO, contrastRatio } from '@dloizides/design-tokens';
import { UiProvider, type UiTheme } from '@dloizides/ui-feedback';

import { Filters } from './Filters';
import { applyTestID } from './constants';
import type { FilterField, FilterValues } from './types';

const HEX_RADIX = 16;
const HEX_PAIR = 2;
const SKY_FILL = '#38BDF8';
const TEST_ID = 'cases';

const SKY_THEME: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111111', textSecondary: '#666666', border: '#dddddd' },
  palette: { primary: { '500': SKY_FILL } },
  semantic: { error: { '500': '#dc2626' } },
};
const FIELDS: readonly FilterField[] = [{ key: 'q', kind: 'text', label: 'Search' }];
const VALUES: FilterValues = { q: '' };

function toHex(rgb: string): string {
  const channels = rgb.match(/\d+/g) ?? [];
  return `#${channels.slice(0, 3).map((c) => Number(c).toString(HEX_RADIX).padStart(HEX_PAIR, '0')).join('')}`;
}

function applyLabelInk(theme: UiTheme): string {
  render(
    <UiProvider theme={theme} t={(key) => key}>
      <Filters testID={TEST_ID} fields={FIELDS} values={VALUES} onChange={() => undefined} onApply={() => undefined} applyLabel="Apply" applyHint="Applies the filters" />
    </UiProvider>,
  );
  const button = screen.getByTestId(applyTestID(TEST_ID));
  return toHex(getComputedStyle(button.querySelector('div') ?? button).color);
}

describe('Filters apply button', () => {
  it('with an uppercase sky brand fill, the Apply label meets AA against the fill', () => {
    const theme = SKY_THEME;

    const ink = applyLabelInk(theme);

    expect(contrastRatio(ink, SKY_FILL)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT_RATIO);
  });
});
