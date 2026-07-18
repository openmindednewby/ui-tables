import { render, screen, fireEvent } from '@testing-library/react';

import { SizeDropdown } from './SizeDropdown';

const OPTIONS = [25, 50, 100, 200] as const;

function renderDropdown(overrides?: { pageSize?: number; onPageSizeChange?: (n: number) => void }): {
  onPageSizeChange: (n: number) => void;
} {
  const onPageSizeChange = overrides?.onPageSizeChange ?? jest.fn();
  render(
    <SizeDropdown
      pageSize={overrides?.pageSize ?? 50}
      pageSizeOptions={OPTIONS}
      onPageSizeChange={onPageSizeChange}
      testID="pager"
      triggerLabel={`Rows per page, currently ${String(overrides?.pageSize ?? 50)}`}
      getOptionLabel={(size) => `Show ${String(size)} rows per page`}
      triggerHint="Change rows per page"
      optionHint="Set rows per page"
      textColor="#111"
      mutedColor="#666"
      borderColor="#ddd"
      surfaceColor="#fff"
      brandColor="#4f46e5"
    />,
  );
  return { onPageSizeChange };
}

describe('SizeDropdown', () => {
  it('hides the menu until the trigger is pressed', () => {
    renderDropdown();
    expect(screen.queryByTestId('pager-size-menu')).toBeNull();
    fireEvent.click(screen.getByTestId('pager-size-trigger'));
    expect(screen.getByTestId('pager-size-menu')).toBeTruthy();
  });

  it('portals the open menu to document.body so it escapes ancestor stacking/overflow', () => {
    // The bug this fixes: an in-tree absolute menu is trapped in the anchor's rn-web stacking
    // context and paints UNDER the table. A portal renders it as a direct child of <body>.
    renderDropdown();
    fireEvent.click(screen.getByTestId('pager-size-trigger'));
    const menu = screen.getByTestId('pager-size-menu');
    expect(menu.parentElement).toBe(document.body);
  });

  it('positions the portalled menu with position:fixed (escapes the trapped z-index)', () => {
    renderDropdown();
    fireEvent.click(screen.getByTestId('pager-size-trigger'));
    const menu = screen.getByTestId('pager-size-menu');
    // rn-web flattens the merged style array onto the DOM node; the fixed override must win.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- test asserts the rendered DOM node
    expect((menu as HTMLElement).style.position).toBe('fixed');
  });

  it('emits the chosen size and closes on select', () => {
    const { onPageSizeChange } = renderDropdown();
    fireEvent.click(screen.getByTestId('pager-size-trigger'));
    fireEvent.click(screen.getByTestId('pager-size-100'));
    expect(onPageSizeChange).toHaveBeenCalledWith(100);
    expect(screen.queryByTestId('pager-size-menu')).toBeNull();
  });

  it('closes on Escape', () => {
    renderDropdown();
    fireEvent.click(screen.getByTestId('pager-size-trigger'));
    expect(screen.getByTestId('pager-size-menu')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('pager-size-menu')).toBeNull();
  });

  it('closes on an outside mousedown', () => {
    renderDropdown();
    fireEvent.click(screen.getByTestId('pager-size-trigger'));
    expect(screen.getByTestId('pager-size-menu')).toBeTruthy();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId('pager-size-menu')).toBeNull();
  });

  it('does not close when the mousedown lands inside the portalled menu', () => {
    renderDropdown();
    fireEvent.click(screen.getByTestId('pager-size-trigger'));
    fireEvent.mouseDown(screen.getByTestId('pager-size-menu'));
    expect(screen.getByTestId('pager-size-menu')).toBeTruthy();
  });
});
