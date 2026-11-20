import { fireEvent, render, screen } from '@testing-library/react';

import { facetTestIds } from '../testIds';
import type { CursorFooterLabels } from '../types';
import { CursorFooter, type CursorFooterProps } from './CursorFooter';

const ids = facetTestIds('list');
const LABELS: CursorFooterLabels = {
  found: (n) => `Found ${String(n)}`,
  pageSize: (n) => `${String(n)} per page`,
  prev: 'Previous',
  prevHint: 'Shows the previous page',
  next: 'Next',
  nextHint: 'Shows the next page',
};

function renderFooter(extra: Partial<CursorFooterProps> = {}): { onNext: jest.Mock; onPrev: jest.Mock } {
  const onNext = jest.fn();
  const onPrev = jest.fn();
  render(<CursorFooter hasNext hasPrev={false} labels={LABELS} onNext={onNext} onPrev={onPrev} size={25} testIDPrefix="list" total={57} {...extra} />);
  return { onNext, onPrev };
}

describe('CursorFooter', () => {
  it('with a total and size, shows the found count and page size', () => {
    renderFooter();

    const texts = [screen.getByTestId(ids.found).textContent, screen.getByTestId(ids.pageSize).textContent];

    expect(texts).toEqual(['Found 57', '25 per page']);
  });

  it('with a next page, Next calls onNext', () => {
    const { onNext } = renderFooter();

    fireEvent.click(screen.getByTestId(ids.next));

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('with no previous page, Prev is disabled and does not call onPrev', () => {
    const { onPrev } = renderFooter();

    fireEvent.click(screen.getByTestId(ids.prev));

    expect(onPrev).not.toHaveBeenCalled();
  });

  it('with no total, leaves the found count out', () => {
    renderFooter({ total: null });

    const found = screen.queryByTestId(ids.found);

    expect(found).toBeNull();
  });
});
