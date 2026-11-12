import { toggleValue } from './toggleValue';

describe('toggleValue', () => {
  it('with a value not in the list, appends it', () => {
    const list = ['Settled'];

    const next = toggleValue(list, 'Failed');

    expect(next).toEqual(['Settled', 'Failed']);
  });

  it('with a value already in the list, removes it', () => {
    const list = ['Settled', 'Failed'];

    const next = toggleValue(list, 'Settled');

    expect(next).toEqual(['Failed']);
  });
});
