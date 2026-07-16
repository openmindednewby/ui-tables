/**
 * Bulk-select + keyboard navigation, wired into the DataTable.
 *
 * Still LOGIC-first: these assert what the component EMITS (callbacks, payload shapes,
 * a11y state) rather than how it looks. The two claims that matter most and cannot be
 * tested in `selection.ts` alone are:
 *  - omitting the new props changes NOTHING (the backward-compatibility contract), and
 *  - select-all-matching emits a FLAG, never an id list.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { DataTable } from './DataTable';
import { TABLE_I18N } from './constants';
import type { DataTableColumn } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#4f46e5' } },
  semantic: { error: { '500': '#dc2626' } },
};

/** Mirrors an app's FM: `(key, p1?)`. Proves the chrome routes every string through `t`. */
const T_MAP: Record<string, string> = {
  [TABLE_I18N.rowLabel]: 'Row',
  [TABLE_I18N.rowHint]: 'Row hint',
  [TABLE_I18N.selectRow]: 'Select row',
  [TABLE_I18N.selectRowHint]: 'Selects this row',
  [TABLE_I18N.selectAll]: 'Select all on page',
  [TABLE_I18N.selectAllHint]: 'Selects every row on this page',
  [TABLE_I18N.selectClear]: 'Clear selection',
  [TABLE_I18N.selectClearHint]: 'Clears the selection',
  [TABLE_I18N.selectAllMatchingHint]: 'Selects every matching row',
};
const t: UiValue['t'] = (key, p1) => {
  if (key === TABLE_I18N.selectAllMatching) return `Select all ${p1} matching this filter`;
  if (key === TABLE_I18N.selectPageSelected) return `All ${p1} rows on this page are selected`;
  if (key === TABLE_I18N.selectMatchingSelected) return `All ${p1} matching rows are selected`;
  return T_MAP[key] ?? key;
};

interface Person {
  id: string;
  name: string;
}
const columns: ReadonlyArray<DataTableColumn<Person>> = [{ key: 'name', header: 'Name', render: (r) => r.name }];
const rows: Person[] = [
  { id: 'a', name: 'Ada' },
  { id: 'b', name: 'Bo' },
  { id: 'c', name: 'Cy' },
];
const ALL_KEYS = ['a', 'b', 'c'];
const MATCHING_TOTAL = 3_023;

function renderTable(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<UiProvider t={t} theme={theme}>{ui}</UiProvider>);
}

/** The table under test, with the selection props supplied by each case. */
type Overrides = Partial<React.ComponentProps<typeof DataTable<Person>>>;
function renderSelectable(overrides: Overrides = {}): void {
  renderTable(
    <DataTable
      columns={columns}
      keyExtractor={(r) => r.id}
      rows={rows}
      stackBreakpoint={0}
      testID="grid"
      {...overrides}
    />,
  );
}

describe('DataTable — omitting the new props changes NOTHING (the compatibility contract)', () => {
  /**
   * 🔴 The whole reason this is a MINOR bump. erevna / katalogos / kefi / agora pass none
   * of these props and must render exactly as they did on 1.9.2.
   */
  it('renders no checkbox and no banner when the selection props are omitted', () => {
    renderSelectable();
    expect(screen.queryByTestId('grid-select-all')).toBeNull();
    expect(screen.queryByTestId('grid-select-a')).toBeNull();
    expect(screen.queryByTestId('grid-select-banner')).toBeNull();
  });

  it('adds no aria-selected to rows of a non-selectable table', () => {
    renderSelectable();
    expect(screen.getByTestId('grid-row-a').getAttribute('aria-selected')).toBeNull();
  });

  it('adds no tabIndex and no grid role when keyboardNavigation is omitted', () => {
    renderSelectable();
    expect(screen.getByTestId('grid-row-a').getAttribute('tabindex')).toBeNull();
    expect(screen.getByTestId('grid').getAttribute('role')).toBeNull();
  });

  /** `selectedRowKeys` alone is inert: `onSelectionChange` is the enabler (cf. renderRowDetail). */
  it('renders no checkbox when selectedRowKeys is passed WITHOUT onSelectionChange', () => {
    renderSelectable({ selectedRowKeys: ['a'] });
    expect(screen.queryByTestId('grid-select-a')).toBeNull();
  });
});

describe('DataTable — row selection', () => {
  it('emits the row key ADDED when an unselected row is ticked', () => {
    const onSelectionChange = jest.fn();
    renderSelectable({ selectedRowKeys: [], onSelectionChange });
    fireEvent.click(screen.getByTestId('grid-select-b'));
    expect(onSelectionChange).toHaveBeenCalledWith(['b']);
  });

  it('emits the row key REMOVED when a selected row is unticked', () => {
    const onSelectionChange = jest.fn();
    renderSelectable({ selectedRowKeys: ['a', 'b'], onSelectionChange });
    fireEvent.click(screen.getByTestId('grid-select-a'));
    expect(onSelectionChange).toHaveBeenCalledWith(['b']);
  });

  it('announces the selected state on the row via aria-selected', () => {
    renderSelectable({ selectedRowKeys: ['a'], onSelectionChange: jest.fn() });
    expect(screen.getByTestId('grid-row-a').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByTestId('grid-row-b').getAttribute('aria-selected')).toBe('false');
  });

  it('keeps selection CONTROLLED — ticking a box does not select it by itself', () => {
    renderSelectable({ selectedRowKeys: [], onSelectionChange: jest.fn() });
    fireEvent.click(screen.getByTestId('grid-select-a'));
    // The caller did not update the prop, so nothing changed: no internal state.
    expect(screen.getByTestId('grid-row-a').getAttribute('aria-selected')).toBe('false');
  });

  it('labels a row checkbox with the row label so it is announced, not "checkbox"', () => {
    renderSelectable({
      selectedRowKeys: [],
      onSelectionChange: jest.fn(),
      getRowAccessibilityLabel: (r) => `Instruction ${r.name}`,
    });
    expect(screen.getByTestId('grid-select-a').getAttribute('aria-label')).toBe('Instruction Ada');
  });
});

describe('DataTable — the header checkbox and its indeterminate state', () => {
  it.each([
    [[], 'false'],
    [['a'], 'mixed'],
    [ALL_KEYS, 'true'],
  ])('announces aria-checked=%s for selection %j', (selectedRowKeys, expected) => {
    renderSelectable({ selectedRowKeys: selectedRowKeys as string[], onSelectionChange: jest.fn() });
    expect(screen.getByTestId('grid-select-all').getAttribute('aria-checked')).toBe(expected);
  });

  it('selects the whole page when clicked from empty', () => {
    const onSelectionChange = jest.fn();
    renderSelectable({ selectedRowKeys: [], onSelectionChange });
    fireEvent.click(screen.getByTestId('grid-select-all'));
    expect(onSelectionChange).toHaveBeenCalledWith(ALL_KEYS);
  });

  it('clears the page when clicked while fully selected', () => {
    const onSelectionChange = jest.fn();
    renderSelectable({ selectedRowKeys: ALL_KEYS, onSelectionChange });
    fireEvent.click(screen.getByTestId('grid-select-all'));
    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });
});

describe('DataTable — select all matching: a FLAG, never an id list', () => {
  const selectAllProps: Overrides = {
    selectedRowKeys: ALL_KEYS,
    onSelectionChange: jest.fn(),
    matchingCount: MATCHING_TOTAL,
  };

  it('offers the flag once the page is full and more rows match', () => {
    renderSelectable({ ...selectAllProps, onSelectAllMatchingChange: jest.fn() });
    expect(screen.getByTestId('grid-select-banner')).toBeTruthy();
    expect(screen.getByText(`Select all ${MATCHING_TOTAL.toLocaleString()} matching this filter`)).toBeTruthy();
  });

  it('renders no banner without onSelectAllMatchingChange (the enabler)', () => {
    renderSelectable(selectAllProps);
    expect(screen.queryByTestId('grid-select-banner')).toBeNull();
  });

  it('renders no banner while the page is only partly selected', () => {
    renderSelectable({ ...selectAllProps, selectedRowKeys: ['a'], onSelectAllMatchingChange: jest.fn() });
    expect(screen.queryByTestId('grid-select-banner')).toBeNull();
  });

  /**
   * 🔴 THE test. The payload is `true` — a flag. Not 3,023 ids, not the page's 3 ids, not
   * an array of any kind. The table cannot enumerate rows it never fetched, and the ZY-02
   * spike says it must not try.
   */
  it('emits the boolean FLAG — and no ids whatsoever', () => {
    const onSelectAllMatchingChange = jest.fn();
    renderSelectable({ ...selectAllProps, onSelectAllMatchingChange });
    fireEvent.click(screen.getByTestId('grid-select-banner-action'));

    expect(onSelectAllMatchingChange).toHaveBeenCalledWith(true);
    const [payload] = onSelectAllMatchingChange.mock.calls[0] as unknown[];
    expect(typeof payload).toBe('boolean');
    expect(Array.isArray(payload)).toBe(false);
  });

  it('reports EVERY row selected under the flag, with an empty id list', () => {
    renderSelectable({
      selectedRowKeys: [],
      onSelectionChange: jest.fn(),
      allMatchingSelected: true,
      matchingCount: MATCHING_TOTAL,
      onSelectAllMatchingChange: jest.fn(),
    });
    ALL_KEYS.forEach((key) => {
      expect(screen.getByTestId(`grid-row-${key}`).getAttribute('aria-selected')).toBe('true');
    });
    expect(screen.getByTestId('grid-select-all').getAttribute('aria-checked')).toBe('true');
  });

  it('offers to CLEAR while the flag is set, and emits false', () => {
    const onSelectAllMatchingChange = jest.fn();
    renderSelectable({
      selectedRowKeys: [],
      onSelectionChange: jest.fn(),
      allMatchingSelected: true,
      matchingCount: MATCHING_TOTAL,
      onSelectAllMatchingChange,
    });
    expect(screen.getByText(`All ${MATCHING_TOTAL.toLocaleString()} matching rows are selected`)).toBeTruthy();
    fireEvent.click(screen.getByTestId('grid-select-banner-action'));
    expect(onSelectAllMatchingChange).toHaveBeenCalledWith(false);
  });

  /**
   * Un-ticking one row while "all matching" is set means the operator is no longer acting
   * on *the filter*. Leaving the flag set would act on rows they had just excluded.
   */
  it('drops the flag when a single row is toggled under it', () => {
    const onSelectAllMatchingChange = jest.fn();
    const onSelectionChange = jest.fn();
    renderSelectable({
      selectedRowKeys: [],
      onSelectionChange,
      allMatchingSelected: true,
      matchingCount: MATCHING_TOTAL,
      onSelectAllMatchingChange,
    });
    fireEvent.click(screen.getByTestId('grid-select-b'));
    expect(onSelectAllMatchingChange).toHaveBeenCalledWith(false);
    // Falls back to the honest set: this page, minus the row just unticked.
    expect(onSelectionChange).toHaveBeenCalledWith(['a', 'c']);
  });
});

describe('DataTable — selection across a filter change', () => {
  /**
   * A filter change is a new `rows` array and a caller-reset `selectedRowKeys`. The table
   * must not resurrect the old selection from any internal state — it holds none.
   */
  it('shows nothing selected once the caller clears the selection', () => {
    const { rerender } = renderTable(
      <DataTable columns={columns} keyExtractor={(r) => r.id} rows={rows} selectedRowKeys={ALL_KEYS} stackBreakpoint={0} testID="grid" onSelectionChange={jest.fn()} />,
    );
    expect(screen.getByTestId('grid-select-all').getAttribute('aria-checked')).toBe('true');

    const filtered = [rows[0]] as Person[];
    rerender(
      <UiProvider t={t} theme={theme}>
        <DataTable columns={columns} keyExtractor={(r) => r.id} rows={filtered} selectedRowKeys={[]} stackBreakpoint={0} testID="grid" onSelectionChange={jest.fn()} />
      </UiProvider>,
    );
    expect(screen.getByTestId('grid-select-all').getAttribute('aria-checked')).toBe('false');
    expect(screen.getByTestId('grid-row-a').getAttribute('aria-selected')).toBe('false');
  });

  /**
   * 🔴 The stale-selection trap. The caller KEEPS `['a','b','c']` while the filter narrows
   * to one row. The header must read All (that page IS fully selected) — not Some, and not
   * a count-based "3 of 1". `resolveHeaderCheckboxState` intersects, which is why.
   */
  it('intersects a kept selection with the NEW page rather than counting it', () => {
    renderTable(
      <DataTable columns={columns} keyExtractor={(r) => r.id} rows={[rows[1]] as Person[]} selectedRowKeys={ALL_KEYS} stackBreakpoint={0} testID="grid" onSelectionChange={jest.fn()} />,
    );
    expect(screen.getByTestId('grid-select-all').getAttribute('aria-checked')).toBe('true');
  });

  it('reads None when the kept selection has nothing in common with the new page', () => {
    renderTable(
      <DataTable columns={columns} keyExtractor={(r) => r.id} rows={rows} selectedRowKeys={['x', 'y', 'z']} stackBreakpoint={0} testID="grid" onSelectionChange={jest.fn()} />,
    );
    expect(screen.getByTestId('grid-select-all').getAttribute('aria-checked')).toBe('false');
  });
});
