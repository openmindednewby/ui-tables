import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { Pager } from './Pager';
import { TABLE_I18N, TABLE_TEST_IDS } from './constants';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#4f46e5' } },
  semantic: { error: { '500': '#dc2626' } },
};
const T_MAP: Record<string, string> = {
  [TABLE_I18N.pagerInfo]: 'of',
  [TABLE_I18N.pagerFirst]: 'First',
  [TABLE_I18N.pagerPrev]: 'Prev',
  [TABLE_I18N.pagerNext]: 'Next',
  [TABLE_I18N.pagerLast]: 'Last',
  [TABLE_I18N.pagerRows]: 'Rows',
};
const t: UiValue['t'] = (key) => T_MAP[key] ?? key;
const noop = (): void => undefined;

function renderPager(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<UiProvider theme={theme} t={t}>{ui}</UiProvider>);
}

describe('Pager — First / Last jumps', () => {
  it('are hidden by default (byte-identical to prior behaviour)', () => {
    renderPager(<Pager page={2} pageSize={50} total={500} onPageChange={noop} onPageSizeChange={noop} />);
    expect(screen.queryByTestId(TABLE_TEST_IDS.pagerFirst)).toBeNull();
    expect(screen.queryByTestId(TABLE_TEST_IDS.pagerLast)).toBeNull();
  });

  it('render when showFirstLast is set', () => {
    renderPager(<Pager page={2} pageSize={50} total={500} showFirstLast onPageChange={noop} onPageSizeChange={noop} />);
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerFirst).textContent).toContain('First');
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerLast).textContent).toContain('Last');
  });

  it('jump to the first and last page', () => {
    const onPageChange = jest.fn();
    renderPager(<Pager page={5} pageSize={50} total={500} showFirstLast onPageChange={onPageChange} onPageSizeChange={noop} />);
    fireEvent.click(screen.getByTestId(TABLE_TEST_IDS.pagerFirst));
    expect(onPageChange).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByTestId(TABLE_TEST_IDS.pagerLast));
    expect(onPageChange).toHaveBeenCalledWith(10); // ceil(500/50)
  });

  it('disable First on the first page and Last on the last page', () => {
    const { rerender } = renderPager(<Pager page={1} pageSize={50} total={500} showFirstLast onPageChange={noop} onPageSizeChange={noop} />);
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerFirst)).toBeDisabled();
    rerender(<UiProvider theme={theme} t={t}><Pager page={10} pageSize={50} total={500} showFirstLast onPageChange={noop} onPageSizeChange={noop} /></UiProvider>);
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerLast)).toBeDisabled();
  });
});

describe('Pager — singularisation', () => {
  it('uses unitLabelSingular when total === 1', () => {
    renderPager(<Pager page={1} pageSize={50} total={1} unitLabel="results" unitLabelSingular="result" onPageChange={noop} onPageSizeChange={noop} />);
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerInfo).textContent).toBe('1–1 of 1 result');
  });

  it('uses the plural unitLabel when total !== 1', () => {
    renderPager(<Pager page={1} pageSize={50} total={3} unitLabel="results" unitLabelSingular="result" onPageChange={noop} onPageSizeChange={noop} />);
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerInfo).textContent).toBe('1–3 of 3 results');
  });

  it('uses the plural unitLabel at zero results', () => {
    renderPager(<Pager page={1} pageSize={50} total={0} unitLabel="results" unitLabelSingular="result" onPageChange={noop} onPageSizeChange={noop} />);
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerInfo).textContent).toBe('0–0 of 0 results');
  });

  it('falls back to unitLabel when no singular is given (total === 1)', () => {
    renderPager(<Pager page={1} pageSize={50} total={1} unitLabel="results" onPageChange={noop} onPageSizeChange={noop} />);
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerInfo).textContent).toBe('1–1 of 1 results');
  });
});

describe('Pager — responsive compact', () => {
  it('below the breakpoint hides the rows-per-page control and First/Last', () => {
    // A huge breakpoint forces width < breakpoint → compact, without mocking window size.
    renderPager(
      <Pager page={2} pageSize={50} total={500} showFirstLast responsive stackBreakpoint={99999} onPageChange={noop} onPageSizeChange={noop} />,
    );
    expect(screen.queryByTestId(`${TABLE_TEST_IDS.pager}-size-100`)).toBeNull();
    expect(screen.queryByTestId(TABLE_TEST_IDS.pagerFirst)).toBeNull();
    expect(screen.queryByTestId(TABLE_TEST_IDS.pagerLast)).toBeNull();
    // Prev/Next survive the collapse.
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerPrev)).toBeTruthy();
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerNext)).toBeTruthy();
  });

  it('does not collapse when the width is not below the breakpoint (stackBreakpoint 0)', () => {
    // width (0 in jsdom) is not < 0, so the pager stays in full-nav mode even with responsive on.
    renderPager(
      <Pager page={2} pageSize={50} total={500} showFirstLast responsive stackBreakpoint={0} onPageChange={noop} onPageSizeChange={noop} />,
    );
    expect(screen.getByTestId(`${TABLE_TEST_IDS.pager}-size-100`)).toBeTruthy();
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerFirst)).toBeTruthy();
  });

  it('is not compact when responsive is off (default), even on a narrow notional width', () => {
    renderPager(<Pager page={1} pageSize={50} total={500} showFirstLast onPageChange={noop} onPageSizeChange={noop} />);
    expect(screen.getByTestId(`${TABLE_TEST_IDS.pager}-size-100`)).toBeTruthy();
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerFirst)).toBeTruthy();
  });
});
