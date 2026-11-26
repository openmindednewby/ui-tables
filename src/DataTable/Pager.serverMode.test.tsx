import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { TABLE_I18N, TABLE_TEST_IDS } from './constants';
import { Pager } from './Pager';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#1f6feb' } },
  semantic: { error: { '500': '#dc2626' } },
};
const T_MAP: Record<string, string | undefined> = { [TABLE_I18N.pagerInfo]: 'of', [TABLE_I18N.pagerRows]: 'Rows' };
const t: UiValue['t'] = (key) => T_MAP[key] ?? key;
const noop = (): void => undefined;
const PREV_SPINNER = `${TABLE_TEST_IDS.pagerPrev}-spinner`;
const NEXT_SPINNER = `${TABLE_TEST_IDS.pagerNext}-spinner`;

function renderPager(ui: React.ReactElement): void {
  render(<UiProvider t={t} theme={theme}>{ui}</UiProvider>);
}

describe('Pager server mode', () => {
  it('with an unknown total, shows the range without "of N"', () => {
    renderPager(<Pager page={2} pageSize={25} serverPage={{ itemCount: 25, hasNext: true }} onPageChange={noop} />);

    const info = screen.getByTestId(TABLE_TEST_IDS.pagerInfo).textContent;

    expect(info).toBe('26–50');
  });

  it('with an unknown total and no next page, disables Next', () => {
    renderPager(<Pager page={3} pageSize={25} serverPage={{ itemCount: 4, hasNext: false }} onPageChange={noop} />);

    const next = screen.getByTestId(TABLE_TEST_IDS.pagerNext);

    expect(next.getAttribute('aria-disabled')).toBe('true');
  });

  it('with an unknown total and a next page, moves to the following page', () => {
    const onPageChange = jest.fn();
    renderPager(<Pager page={1} pageSize={25} serverPage={{ itemCount: 25, hasNext: true }} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByTestId(TABLE_TEST_IDS.pagerNext));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('without onPageSizeChange, hides the rows-per-page control', () => {
    renderPager(<Pager page={1} pageSize={25} total={80} onPageChange={noop} />);

    const pill = screen.queryByTestId(`${TABLE_TEST_IDS.pager}-size-25`);

    expect(pill).toBeNull();
  });
});

describe('Pager loading', () => {
  it('with a Promise from onPageChange, spins the pressed button until it settles', async () => {
    let resolve: () => void = noop;
    const onPageChange = (): Promise<void> => new Promise<void>((r) => { resolve = r; });
    renderPager(<Pager page={2} pageSize={25} total={80} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByTestId(TABLE_TEST_IDS.pagerPrev));

    expect(screen.getByTestId(PREV_SPINNER)).toBeTruthy();
    expect(screen.queryByTestId(NEXT_SPINNER)).toBeNull();
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerNext).getAttribute('aria-disabled')).toBe('true');
    await act(async () => { resolve(); await Promise.resolve(); });
    expect(screen.queryByTestId(PREV_SPINNER)).toBeNull();
  });

  it('with loading set and nothing pressed, spins Next and disables Prev', () => {
    renderPager(<Pager loading page={2} pageSize={25} total={80} onPageChange={noop} />);

    const prev = screen.getByTestId(TABLE_TEST_IDS.pagerPrev);

    expect(screen.getByTestId(NEXT_SPINNER)).toBeTruthy();
    expect(prev.getAttribute('aria-disabled')).toBe('true');
  });

  it('with loading unset and a void handler, shows no spinner', () => {
    renderPager(<Pager page={2} pageSize={25} total={80} onPageChange={noop} />);

    fireEvent.click(screen.getByTestId(TABLE_TEST_IDS.pagerNext));

    expect(screen.queryByTestId(NEXT_SPINNER)).toBeNull();
  });
});
