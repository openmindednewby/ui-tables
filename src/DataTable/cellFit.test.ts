import { cellMinWidth, titleRef } from './cellFit';

describe('cellMinWidth', () => {
  it('with keepWords on web, returns auto so a word never breaks', () => {
    const minWidth = cellMinWidth(undefined, false, true);

    expect(minWidth).toBe('auto');
  });

  it('with a column minWidth, returns that width', () => {
    const minWidth = cellMinWidth(120, false, true);

    expect(minWidth).toBe(120);
  });

  it('with a truncated column, returns undefined so the ellipsis can cut', () => {
    const minWidth = cellMinWidth(undefined, true, true);

    expect(minWidth).toBeUndefined();
  });

  it('without keepWords, returns undefined', () => {
    const minWidth = cellMinWidth(undefined, false, undefined);

    expect(minWidth).toBeUndefined();
  });
});

describe('cellMinWidth with noWrap', () => {
  it('with noWrap on web and no keepWords, returns auto so the column grows to its text', () => {
    const minWidth = cellMinWidth(undefined, false, undefined, true);

    expect(minWidth).toBe('auto');
  });

  it('with noWrap and a truncated column, returns undefined so the ellipsis can cut', () => {
    const minWidth = cellMinWidth(undefined, true, true, true);

    expect(minWidth).toBeUndefined();
  });
});

describe('titleRef', () => {
  it('with a DOM node, sets the full text as its title', () => {
    const node = document.createElement('div');

    titleRef('ana@example.com')(node);

    expect(node.getAttribute('title')).toBe('ana@example.com');
  });
});
