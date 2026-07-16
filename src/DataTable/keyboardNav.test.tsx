/**
 * Keyboard navigation, wired into the DataTable.
 *
 * The rules themselves live in `rowNav.test.ts` (pure). These cover what only appears once
 * the hook drives real nodes: the roving tabindex invariant across a PAGE CHANGE, that the
 * table leaves keys it does not own alone, and that none of it exists unless opted in.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { DataTable } from './DataTable';
import type { DataTableColumn } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#4f46e5' } },
  semantic: { error: { '500': '#dc2626' } },
};
const t: UiValue['t'] = (key) => key;

interface Person {
  id: string;
  name: string;
}
const columns: ReadonlyArray<DataTableColumn<Person>> = [{ key: 'name', header: 'Name', render: (r) => r.name }];
const pageOne: Person[] = [
  { id: 'a', name: 'Ada' },
  { id: 'b', name: 'Bo' },
  { id: 'c', name: 'Cy' },
];
const pageTwo: Person[] = [
  { id: 'x', name: 'Xu' },
  { id: 'y', name: 'Yi' },
];
const TABBABLE = '0';
const NOT_TABBABLE = '-1';

type Overrides = Partial<React.ComponentProps<typeof DataTable<Person>>>;

function table(overrides: Overrides = {}): React.ReactElement {
  return (
    <UiProvider t={t} theme={theme}>
      <DataTable
        columns={columns}
        keyExtractor={(r) => r.id}
        keyboardNavigation
        rows={pageOne}
        stackBreakpoint={0}
        testID="grid"
        {...overrides}
      />
    </UiProvider>
  );
}

const row = (key: string): HTMLElement => screen.getByTestId(`grid-row-${key}`);
const tabIndexOf = (key: string): string | null => row(key).getAttribute('tabindex');

/** The rows currently carrying `tabIndex=0`. The invariant: always exactly one. */
function tabbableRows(keys: readonly string[]): readonly string[] {
  return keys.filter((key) => tabIndexOf(key) === TABBABLE);
}

describe('DataTable — keyboard navigation is opt-in', () => {
  it('adds no tabIndex, no keydown wiring and no grid role when omitted', () => {
    render(table({ keyboardNavigation: false }));
    expect(tabIndexOf('a')).toBeNull();
    expect(screen.getByTestId('grid').getAttribute('role')).toBeNull();
  });

  it('marks the table as a grid, with rows and cells, when enabled', () => {
    render(table());
    expect(screen.getByTestId('grid').getAttribute('role')).toBe('grid');
    expect(row('a').getAttribute('role')).toBe('row');
    expect(screen.getByTestId('grid-row-a-name').getAttribute('role')).toBe('cell');
  });
});

describe('DataTable — the roving tabindex', () => {
  /**
   * 🔴 The invariant: ONE tab stop for the whole grid. 100 rows must not mean 100 presses
   * of Tab to get past the table — that is the entire reason for the pattern.
   */
  it('starts with exactly ONE tabbable row — the first', () => {
    render(table());
    expect(tabbableRows(['a', 'b', 'c'])).toEqual(['a']);
    expect(tabIndexOf('b')).toBe(NOT_TABBABLE);
    expect(tabIndexOf('c')).toBe(NOT_TABBABLE);
  });

  it('moves the tab stop with ArrowDown, keeping exactly one', () => {
    render(table());
    fireEvent.keyDown(row('a'), { key: 'ArrowDown' });
    expect(tabbableRows(['a', 'b', 'c'])).toEqual(['b']);
  });

  it('moves back with ArrowUp', () => {
    render(table());
    fireEvent.keyDown(row('a'), { key: 'ArrowDown' });
    fireEvent.keyDown(row('b'), { key: 'ArrowDown' });
    fireEvent.keyDown(row('c'), { key: 'ArrowUp' });
    expect(tabbableRows(['a', 'b', 'c'])).toEqual(['b']);
  });

  it('jumps to the last row with End and back with Home', () => {
    render(table());
    fireEvent.keyDown(row('a'), { key: 'End' });
    expect(tabbableRows(['a', 'b', 'c'])).toEqual(['c']);
    fireEvent.keyDown(row('c'), { key: 'Home' });
    expect(tabbableRows(['a', 'b', 'c'])).toEqual(['a']);
  });

  it('CLAMPS at the last row rather than wrapping', () => {
    render(table());
    fireEvent.keyDown(row('a'), { key: 'End' });
    fireEvent.keyDown(row('c'), { key: 'ArrowDown' });
    expect(tabbableRows(['a', 'b', 'c'])).toEqual(['c']);
  });

  it('moves DOM focus, not just the attribute', () => {
    render(table());
    fireEvent.keyDown(row('a'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(row('b'));
  });

  it('follows focus that arrives by click or Tab', () => {
    render(table());
    fireEvent.focus(row('c'));
    expect(tabbableRows(['a', 'b', 'c'])).toEqual(['c']);
  });
});

describe('DataTable — keyboard navigation across a page boundary', () => {
  /**
   * 🔴 THE page-boundary test. The operator arrows to row `c`, then pages. Every row key is
   * replaced, so the remembered focus key no longer exists. Without the `resolveTabbableKey`
   * fallback NO row would carry `tabIndex=0` and Tab would skip the entire grid — the table
   * would be keyboard-unreachable from the moment they turned a page.
   */
  it('re-homes the tab stop onto the new page rather than losing it', () => {
    const { rerender } = render(table());
    fireEvent.keyDown(row('a'), { key: 'End' });
    expect(tabbableRows(['a', 'b', 'c'])).toEqual(['c']);

    rerender(table({ rows: pageTwo }));

    expect(tabbableRows(['x', 'y'])).toEqual(['x']);
  });

  it('still navigates normally on the new page', () => {
    const { rerender } = render(table());
    fireEvent.keyDown(row('a'), { key: 'End' });
    rerender(table({ rows: pageTwo }));
    fireEvent.keyDown(row('x'), { key: 'ArrowDown' });
    expect(tabbableRows(['x', 'y'])).toEqual(['y']);
  });

  it('clamps to the new, SHORTER page rather than a stale index', () => {
    const { rerender } = render(table());
    fireEvent.keyDown(row('a'), { key: 'End' }); // index 2 — beyond page two
    rerender(table({ rows: pageTwo }));
    fireEvent.keyDown(row('x'), { key: 'End' });
    expect(tabbableRows(['x', 'y'])).toEqual(['y']);
  });
});

describe('DataTable — Space and Enter', () => {
  it('toggles the focused row with Space', () => {
    const onSelectionChange = jest.fn();
    render(table({ selectedRowKeys: [], onSelectionChange }));
    fireEvent.keyDown(row('b'), { key: ' ' });
    expect(onSelectionChange).toHaveBeenCalledWith(['b']);
  });

  it('does nothing on Space when the table is not selectable', () => {
    const onRowPress = jest.fn();
    render(table({ onRowPress }));
    fireEvent.keyDown(row('b'), { key: ' ' });
    expect(onRowPress).not.toHaveBeenCalled();
  });

  it('activates the focused row with Enter, via the existing onRowPress', () => {
    const onRowPress = jest.fn();
    render(table({ onRowPress }));
    fireEvent.keyDown(row('c'), { key: 'Enter' });
    expect(onRowPress).toHaveBeenCalledWith(pageOne[2]);
  });

  it('does not select on Enter, nor activate on Space', () => {
    const onRowPress = jest.fn();
    const onSelectionChange = jest.fn();
    render(table({ onRowPress, selectedRowKeys: [], onSelectionChange }));
    fireEvent.keyDown(row('a'), { key: 'Enter' });
    expect(onSelectionChange).not.toHaveBeenCalled();
    fireEvent.keyDown(row('a'), { key: ' ' });
    expect(onRowPress).toHaveBeenCalledTimes(1); // still only the Enter
  });
});

describe('DataTable — keys the table does not own', () => {
  // `fireEvent` returns FALSE when the handler called preventDefault, so `notPrevented`
  // reads the same fact as `event.defaultPrevented` — but stays wrapped in `act`.
  const pressKey = (key: string): boolean => fireEvent.keyDown(row('a'), { key });

  /**
   * 🔴 `preventDefault` on a key we do not handle would break Tab, browser shortcuts and
   * screen-reader keys — "keyboard support" that breaks the keyboard.
   */
  it.each(['Tab', 'Escape', 'ArrowLeft', 'PageDown'])('leaves %s alone (no preventDefault)', (key) => {
    render(table({ onRowPress: jest.fn() }));
    expect(pressKey(key)).toBe(true);
  });

  it.each(['ArrowDown', 'ArrowUp', ' ', 'Enter', 'Home', 'End'])(
    'DOES claim %s, so the page never scrolls under the operator',
    (key) => {
      render(table({ onRowPress: jest.fn(), selectedRowKeys: [], onSelectionChange: jest.fn() }));
      expect(pressKey(key)).toBe(false);
    },
  );
});
