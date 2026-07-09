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
  [TABLE_I18N.pagerPrev]: 'Prev',
  [TABLE_I18N.pagerNext]: 'Next',
  [TABLE_I18N.pagerRows]: 'Rows',
};
const t: UiValue['t'] = (key) => T_MAP[key] ?? key;

function renderPager(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<UiProvider theme={theme} t={t}>{ui}</UiProvider>);
}

describe('Pager', () => {
  const noop = (): void => undefined;

  it('renders the "from–to of N" page-info', () => {
    renderPager(<Pager page={1} pageSize={50} total={128} onPageChange={noop} onPageSizeChange={noop} />);
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerInfo).textContent).toContain('1–50 of 128');
  });

  it('disables Prev on the first page and Next on the last', () => {
    const { rerender } = renderPager(<Pager page={1} pageSize={50} total={128} onPageChange={noop} onPageSizeChange={noop} />);
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerPrev)).toBeDisabled();
    rerender(<UiProvider theme={theme} t={t}><Pager page={3} pageSize={50} total={128} onPageChange={noop} onPageSizeChange={noop} /></UiProvider>);
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerNext)).toBeDisabled();
  });

  it('advances the page on Next', () => {
    const onPageChange = jest.fn();
    renderPager(<Pager page={1} pageSize={50} total={128} onPageChange={onPageChange} onPageSizeChange={noop} />);
    fireEvent.click(screen.getByTestId(TABLE_TEST_IDS.pagerNext));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('emits the chosen rows-per-page', () => {
    const onPageSizeChange = jest.fn();
    renderPager(<Pager page={1} pageSize={50} total={128} onPageChange={noop} onPageSizeChange={onPageSizeChange} />);
    fireEvent.click(screen.getByTestId(`${TABLE_TEST_IDS.pager}-size-100`));
    expect(onPageSizeChange).toHaveBeenCalledWith(100);
  });
});
