import { PillVariant } from '../PillVariant';
import { pillBox } from './StatusPill';

const TONE = '#16a34a';

describe('pillBox', () => {
  it('with the Outline variant, returns a border in the tone colour and no fill', () => {
    const variant = PillVariant.Outline;

    const box = pillBox(TONE, variant);

    expect(box).toEqual({ borderColor: TONE });
  });

  it('with the Filled variant, returns a borderless soft tint of the tone colour', () => {
    const variant = PillVariant.Filled;

    const box = pillBox(TONE, variant);

    expect(box).toMatchObject({ borderWidth: 0, backgroundColor: `${TONE}1f` });
  });

  it('with the Filled variant and a non-hex colour, falls back to the outline', () => {
    const color = 'rgb(22, 163, 74)';

    const box = pillBox(color, PillVariant.Filled);

    expect(box).toEqual({ borderColor: color });
  });
});
