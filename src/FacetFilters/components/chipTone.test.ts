import type { UiTheme } from '@dloizides/ui-feedback';

import { chipTone } from './chipTone';

const BRAND = '#0ea5e9';
const BORDER = '#d0d5dd';
const SURFACE = '#ffffff';
const theme = { colors: { border: BORDER, surface: SURFACE }, palette: { primary: { '500': BRAND } } } as unknown as UiTheme;

describe('chipTone', () => {
  it('with a value set, returns the brand border on a soft brand tint', () => {
    const active = true;

    const tone = chipTone(theme, active);

    expect(tone).toEqual({ borderColor: BRAND, backgroundColor: `${BRAND}1f` });
  });

  it('with no value set, returns the neutral border on the surface', () => {
    const active = false;

    const tone = chipTone(theme, active);

    expect(tone).toEqual({ borderColor: BORDER, backgroundColor: SURFACE });
  });
});
