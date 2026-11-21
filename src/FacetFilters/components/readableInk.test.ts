import { AA_NORMAL_TEXT_RATIO, contrastRatio } from '@dloizides/design-tokens';

import { readableInk } from './readableInk';

const WHITE = '#ffffff';
const SLATE_50 = '#f8fafc';
const INK = '#0f172a';

describe('readableInk', () => {
  it('with a light sky tone on white, returns the fallback ink at AA', () => {
    const sky = '#38bdf8';

    const ink = readableInk(sky, [WHITE, SLATE_50], INK);

    expect(ink).toBe(INK);
    expect(contrastRatio(ink, WHITE)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT_RATIO);
  });

  it('with a dark blue tone on white, keeps the tone', () => {
    const blue = '#1d4ed8';

    const ink = readableInk(blue, [WHITE, SLATE_50], INK);

    expect(ink).toBe(blue);
  });

  it('with a non-hex tone, returns the tone unchanged', () => {
    const tone = 'rgb(56, 189, 248)';

    const ink = readableInk(tone, [WHITE], INK);

    expect(ink).toBe(tone);
  });
});
