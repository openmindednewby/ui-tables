import { render, screen } from '@testing-library/react';

import { AA_NORMAL_TEXT_RATIO, contrastRatio } from '@dloizides/design-tokens';
import { UiProvider, type UiTheme } from '@dloizides/ui-feedback';

import { ActionButton } from './ActionButton';

const HEX_RADIX = 16;
const HEX_PAIR = 2;

const LIGHT_PALE_FILL: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111111', textSecondary: '#666666', border: '#dddddd' },
  palette: { primary: { '500': '#38bdf8' } },
  semantic: { error: { '500': '#dc2626' } },
};
const DARK_DEEP_FILL: UiTheme = {
  colors: { background: '#020617', surface: '#0f172a', surfaceElevated: '#1e293b', text: '#f8fafc', textSecondary: '#94a3b8', border: '#334155' },
  palette: { primary: { '500': '#1d4ed8' } },
  semantic: { error: { '500': '#f87171' } },
};

function toHex(rgb: string): string {
  const channels = rgb.match(/\d+/g) ?? [];
  return `#${channels.slice(0, 3).map((c) => Number(c).toString(HEX_RADIX).padStart(HEX_PAIR, '0')).join('')}`;
}

function renderPrimary(theme: UiTheme): { label: string; fill: string } {
  render(
    <UiProvider theme={theme} t={(key) => key}>
      <ActionButton label="Apply" hint="Applies the filters" tone="primary" onPress={() => undefined} testID="apply" />
    </UiProvider>,
  );
  return {
    label: toHex(getComputedStyle(screen.getByText('Apply')).color),
    fill: theme.palette.primary['500'] ?? '',
  };
}

describe('ActionButton', () => {
  it('with a pale brand fill on a light surface, the primary label meets AA against the fill', () => {
    const theme = LIGHT_PALE_FILL;

    const { label, fill } = renderPrimary(theme);

    expect(contrastRatio(label, fill)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT_RATIO);
  });

  it('with a deep brand fill on a dark surface, the primary label meets AA against the fill', () => {
    const theme = DARK_DEEP_FILL;

    const { label, fill } = renderPrimary(theme);

    expect(contrastRatio(label, fill)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT_RATIO);
  });
});
