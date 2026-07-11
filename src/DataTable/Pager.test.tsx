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

  it('leaves the count line generic when no unitLabel is supplied', () => {
    renderPager(<Pager page={1} pageSize={50} total={3023} onPageChange={noop} onPageSizeChange={noop} />);
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerInfo).textContent).toBe('1–50 of 3,023');
  });

  it('appends the unitLabel suffix to the count line when supplied', () => {
    renderPager(<Pager page={1} pageSize={50} total={3023} unitLabel="leadership terms" onPageChange={noop} onPageSizeChange={noop} />);
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerInfo).textContent).toBe('1–50 of 3,023 leadership terms');
  });

  it('ignores an empty unitLabel (stays byte-identical to the generic line)', () => {
    renderPager(<Pager page={1} pageSize={50} total={3023} unitLabel="" onPageChange={noop} onPageSizeChange={noop} />);
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerInfo).textContent).toBe('1–50 of 3,023');
  });

  it('prepends the infoPrefix word to the count line when supplied', () => {
    renderPager(<Pager page={1} pageSize={50} total={3023} infoPrefix="Showing" unitLabel="leadership terms" onPageChange={noop} onPageSizeChange={noop} />);
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerInfo).textContent).toBe('Showing 1–50 of 3,023 leadership terms');
  });

  it('keeps the same concatenated text when boldNumbers is on (bold is styling only)', () => {
    renderPager(<Pager page={1} pageSize={50} total={3023} infoPrefix="Showing" boldNumbers unitLabel="PEPs" onPageChange={noop} onPageSizeChange={noop} />);
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerInfo).textContent).toBe('Showing 1–50 of 3,023 PEPs');
  });

  it('ignores an empty infoPrefix (stays byte-identical to the generic line)', () => {
    renderPager(<Pager page={1} pageSize={50} total={3023} infoPrefix="" onPageChange={noop} onPageSizeChange={noop} />);
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerInfo).textContent).toBe('1–50 of 3,023');
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

  it('defaults to the pills variant (no dropdown trigger, options rendered inline)', () => {
    renderPager(<Pager page={1} pageSize={50} total={128} onPageChange={noop} onPageSizeChange={noop} />);
    expect(screen.queryByTestId(`${TABLE_TEST_IDS.pager}-size-trigger`)).toBeNull();
    expect(screen.getByTestId(`${TABLE_TEST_IDS.pager}-size-100`)).not.toBeNull();
  });

  it('rowsVariant="dropdown" renders a compact trigger and hides options until opened', () => {
    renderPager(<Pager page={1} pageSize={50} total={128} rowsVariant="dropdown" onPageChange={noop} onPageSizeChange={noop} />);
    const trigger = screen.getByTestId(`${TABLE_TEST_IDS.pager}-size-trigger`);
    expect(trigger.textContent).toContain('50');
    expect(screen.queryByTestId(`${TABLE_TEST_IDS.pager}-size-menu`)).toBeNull();
    expect(screen.queryByTestId(`${TABLE_TEST_IDS.pager}-size-100`)).toBeNull();
  });

  it('rowsVariant="dropdown" opens the menu with the size options on trigger press', () => {
    renderPager(<Pager page={1} pageSize={50} total={128} rowsVariant="dropdown" onPageChange={noop} onPageSizeChange={noop} />);
    fireEvent.click(screen.getByTestId(`${TABLE_TEST_IDS.pager}-size-trigger`));
    expect(screen.getByTestId(`${TABLE_TEST_IDS.pager}-size-menu`)).not.toBeNull();
    for (const size of [25, 50, 100, 200]) {
      expect(screen.getByTestId(`${TABLE_TEST_IDS.pager}-size-${size}`)).not.toBeNull();
    }
  });

  it('rowsVariant="dropdown" emits the chosen size and closes the menu on select', () => {
    const onPageSizeChange = jest.fn();
    renderPager(<Pager page={1} pageSize={50} total={128} rowsVariant="dropdown" onPageChange={noop} onPageSizeChange={onPageSizeChange} />);
    fireEvent.click(screen.getByTestId(`${TABLE_TEST_IDS.pager}-size-trigger`));
    fireEvent.click(screen.getByTestId(`${TABLE_TEST_IDS.pager}-size-100`));
    expect(onPageSizeChange).toHaveBeenCalledWith(100);
    expect(screen.queryByTestId(`${TABLE_TEST_IDS.pager}-size-menu`)).toBeNull();
  });
});
