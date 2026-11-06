import type { UiTheme } from '@dloizides/ui-feedback';

import { StatTone, resolveStatToneColor } from './StatTone';

const colors = { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111111', textSecondary: '#666666', border: '#dddddd' };
const palette = { primary: { '500': '#0f766e' } };

describe('resolveStatToneColor', () => {
  it('with the neutral tone, returns textSecondary', () => {
    const theme: UiTheme = { colors, palette, semantic: { error: { '500': '#dc2626', '700': '#b91c1c' } } };

    const color = resolveStatToneColor(theme, StatTone.Neutral);

    expect(color).toBe('#666666');
  });

  it('with the error tone and a 700 step, returns the 700 step', () => {
    const theme: UiTheme = { colors, palette, semantic: { error: { '500': '#dc2626', '700': '#b91c1c' } } };

    const color = resolveStatToneColor(theme, StatTone.Error);

    expect(color).toBe('#b91c1c');
  });

  it('with the error tone and only a 500 step, returns the 500 step', () => {
    const theme: UiTheme = { colors, palette, semantic: { error: { '500': '#dc2626' } } };

    const color = resolveStatToneColor(theme, StatTone.Error);

    expect(color).toBe('#dc2626');
  });

  it('with the success tone and a 700 step, returns the 700 step', () => {
    const theme: UiTheme = { colors, palette, semantic: { error: { '500': '#dc2626' }, success: { '500': '#16a34a', '700': '#15803d' } } };

    const color = resolveStatToneColor(theme, StatTone.Success);

    expect(color).toBe('#15803d');
  });

  it('with the success tone and no success scale, returns textSecondary', () => {
    const theme: UiTheme = { colors, palette, semantic: { error: { '500': '#dc2626' } } };

    const color = resolveStatToneColor(theme, StatTone.Success);

    expect(color).toBe('#666666');
  });
});
