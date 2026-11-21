import { render, screen } from '@testing-library/react';

import { AA_NORMAL_TEXT_RATIO, contrastRatio } from '@dloizides/design-tokens';
import { UiProvider, type UiTheme } from '@dloizides/ui-feedback';

import { Pager } from './Pager';
import { TABLE_TEST_IDS } from './constants';

const HEX_RADIX = 16;
const HEX_PAIR = 2;
const PAGE_SIZE = 50;
const TOTAL = 128;

const PALE_FILL_DARK_SURFACE: UiTheme = {
  colors: { background: '#020617', surface: '#0f172a', surfaceElevated: '#1e293b', text: '#f8fafc', textSecondary: '#94a3b8', border: '#334155' },
  palette: { primary: { '500': '#38bdf8' } },
  semantic: { error: { '500': '#f87171' } },
};
const DEEP_FILL_LIGHT_SURFACE: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111111', textSecondary: '#666666', border: '#dddddd' },
  palette: { primary: { '500': '#1d4ed8' } },
  semantic: { error: { '500': '#dc2626' } },
};
const noop = (): void => undefined;

function toHex(rgb: string): string {
  const channels = rgb.match(/\d+/g) ?? [];
  return `#${channels.slice(0, 3).map((c) => Number(c).toString(HEX_RADIX).padStart(HEX_PAIR, '0')).join('')}`;
}

function activePillContrast(theme: UiTheme): number {
  render(
    <UiProvider theme={theme} t={(key) => key}>
      <Pager page={1} pageSize={PAGE_SIZE} total={TOTAL} onPageChange={noop} onPageSizeChange={noop} />
    </UiProvider>,
  );
  const pill = screen.getByTestId(`${TABLE_TEST_IDS.pager}-size-${String(PAGE_SIZE)}`);
  const ink = toHex(getComputedStyle(pill.querySelector('div') ?? pill).color);
  return contrastRatio(ink, theme.palette.primary['500'] ?? '');
}

describe('PagerNav active size pill', () => {
  it('with a pale brand fill on a dark surface, the label meets AA against the fill', () => {
    const theme = PALE_FILL_DARK_SURFACE;

    const ratio = activePillContrast(theme);

    expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT_RATIO);
  });

  it('with a deep brand fill on a light surface, the label meets AA against the fill', () => {
    const theme = DEEP_FILL_LIGHT_SURFACE;

    const ratio = activePillContrast(theme);

    expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT_RATIO);
  });
});
