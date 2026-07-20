import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { DataTable } from './DataTable';
import { TABLE_I18N, TABLE_TEST_IDS, rowDetailTestID, rowTestID } from './constants';
import type { DataTableColumn } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#4f46e5' } },
  semantic: { error: { '500': '#dc2626' } },
};

// A translate that returns readable English for the kit keys — mirrors what an app
// wires into its UiProvider. Proves the component routes chrome text through `t`.
const T_MAP: Record<string, string> = {
  [TABLE_I18N.loading]: 'Loading',
  [TABLE_I18N.empty]: 'No rows',
  [TABLE_I18N.rowLabel]: 'Row',
  [TABLE_I18N.rowHint]: 'Row hint',
  [TABLE_I18N.rowDetail]: 'Row detail',
};
const t: UiValue['t'] = (key) => T_MAP[key] ?? key;

interface Person {
  id: string;
  name: string;
  score: number;
}
const columns: ReadonlyArray<DataTableColumn<Person>> = [
  { key: 'name', header: 'Name', weight: 2, render: (r) => r.name },
  { key: 'score', header: 'Score', numeric: true, render: (r) => String(r.score) },
];
const rows: Person[] = [
  { id: 'a', name: 'Ada', score: 10 },
  { id: 'b', name: 'Bo', score: 20 },
];

function renderTable(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<UiProvider theme={theme} t={t}>{ui}</UiProvider>);
}

describe('DataTable', () => {
  it('renders headers and one row per datum with a stable per-row testID', () => {
    // stackBreakpoint=0 forces the desktop path (width is always >= 0), so the
    // header appears once rather than once-per-card (jsdom reports a narrow width).
    renderTable(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} stackBreakpoint={0} testID="grid" />);
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByTestId('grid-row-a')).toBeTruthy();
    expect(screen.getByTestId('grid-row-b')).toBeTruthy();
    expect(screen.getByText('Ada')).toBeTruthy();
  });

  it('calls each column render EXACTLY once per row (no POC double-render)', () => {
    const renderName = jest.fn((r: Person) => r.name);
    const spyColumns: ReadonlyArray<DataTableColumn<Person>> = [{ key: 'name', header: 'Name', render: renderName }];
    renderTable(<DataTable columns={spyColumns} rows={rows} keyExtractor={(r) => r.id} testID="grid" />);
    expect(renderName).toHaveBeenCalledTimes(rows.length);
  });

  it('shows the translated loading state via `t`', () => {
    renderTable(<DataTable columns={columns} rows={[]} keyExtractor={(r) => r.id} loading testID="grid" />);
    expect(screen.getByText('Loading')).toBeTruthy();
  });

  // A server-paged grid re-fetches on every page change. Blanking the table for the duration
  // turns "Next" into "the grid emptied" — the rows the user is reading disappear and only come
  // back when the next page lands. These three lock the rule: the state view is for when there is
  // nothing to show; rows that already exist survive the re-fetch.
  it('KEEPS the current rows visible while a re-fetch is in flight', () => {
    renderTable(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} loading testID="grid" />);

    expect(screen.getByText('Ada')).toBeTruthy();
    expect(screen.getByText('Bo')).toBeTruthy();
    expect(screen.queryByText('Loading')).toBeNull();
  });

  it('marks the table busy while a re-fetch is in flight, since the rows no longer vanish', () => {
    renderTable(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} loading testID="grid" />);
    expect(screen.getByTestId('grid').getAttribute('aria-busy')).toBe('true');
  });

  it('swaps to the NEXT page rows once the re-fetch resolves', () => {
    const { rerender } = renderTable(
      <DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} loading testID="grid" />,
    );
    const page2: Person[] = [{ id: 'c', name: 'Cy', score: 30 }];

    rerender(
      <UiProvider theme={theme} t={t}>
        <DataTable columns={columns} rows={page2} keyExtractor={(r) => r.id} testID="grid" />
      </UiProvider>,
    );

    expect(screen.getByText('Cy')).toBeTruthy();
    expect(screen.queryByText('Ada')).toBeNull();
  });

  it('shows the translated empty state via `t` when there are no rows', () => {
    renderTable(<DataTable columns={columns} rows={[]} keyExtractor={(r) => r.id} testID="grid" />);
    expect(screen.getByText('No rows')).toBeTruthy();
  });

  it('prefers a caller-supplied (already-translated) empty label over the key', () => {
    renderTable(<DataTable columns={columns} rows={[]} keyExtractor={(r) => r.id} emptyLabel="Nothing here" testID="grid" />);
    expect(screen.getByText('Nothing here')).toBeTruthy();
  });

  it('fires onRowPress with the pressed row', () => {
    const onRowPress = jest.fn();
    renderTable(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} onRowPress={onRowPress} testID="grid" />);
    fireEvent.click(screen.getByTestId('grid-row-b'));
    expect(onRowPress).toHaveBeenCalledWith(rows[1]);
  });

  it('collapses to the label:value card-stack below the breakpoint', () => {
    // jsdom width is 1024; a huge breakpoint forces the stacked branch.
    const HUGE = 5000;
    renderTable(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} stackBreakpoint={HUGE} testID="grid" />);
    // header row (desktop-only) is absent; the row cards + labels render.
    expect(screen.queryByTestId(TABLE_TEST_IDS.head)).toBeNull();
    expect(screen.getAllByText('Name').length).toBe(rows.length); // one label per card
  });

  it('renders the desktop sticky header region when stickyHeader is set', () => {
    renderTable(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} stickyHeader stackBreakpoint={0} testID="grid" />);
    expect(screen.getByTestId(TABLE_TEST_IDS.head)).toBeTruthy();
  });
});

describe('DataTable — row-hover highlight (v1 `.clickable:hover`)', () => {
  it('tints an interactive row on hover-in and reverts on hover-out', () => {
    renderTable(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} onRowPress={jest.fn()} stackBreakpoint={0} testID="grid" />);
    const row = screen.getByTestId('grid-row-a');
    const before = row.getAttribute('style');
    fireEvent.mouseEnter(row);
    const hovered = row.getAttribute('style');
    expect(hovered).not.toBe(before);
    fireEvent.mouseLeave(row);
    expect(row.getAttribute('style')).toBe(before);
  });

  it('does NOT tint a static (non-interactive) row on hover — only clickable rows highlight', () => {
    renderTable(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} stackBreakpoint={0} testID="grid" />);
    const row = screen.getByTestId('grid-row-a');
    const before = row.getAttribute('style');
    fireEvent.mouseEnter(row);
    expect(row.getAttribute('style')).toBe(before);
  });

  it('highlights only the hovered row, not its siblings', () => {
    renderTable(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} onRowPress={jest.fn()} zebra stackBreakpoint={0} testID="grid" />);
    const rowA = screen.getByTestId('grid-row-a');
    const rowB = screen.getByTestId('grid-row-b');
    const beforeB = rowB.getAttribute('style');
    fireEvent.mouseEnter(rowA);
    expect(rowB.getAttribute('style')).toBe(beforeB);
  });
});

describe('DataTable — raw text is always wrapped (native-safe)', () => {
  /**
   * A bare string/number child of a `<View>` warns on RN-web and THROWS on real
   * React Native. The card-stack branch used to render `col.render(row)` unwrapped.
   * These apps ship as native, so guard both branches — including a column whose
   * `render` returns a NUMBER (the desktop cell previously only guarded strings).
   */
  const HUGE_WIDTH = 100_000;
  const rawColumns: ReadonlyArray<DataTableColumn<Person>> = [
    { key: 'name', header: 'Name', render: (r) => r.name }, // string
    { key: 'score', header: 'Score', numeric: true, render: (r) => r.score }, // number
  ];

  it.each([
    ['card-stack', HUGE_WIDTH],
    ['desktop grid', 0],
  ])('emits no unexpected-text-node error in %s mode', (_mode, stackBreakpoint) => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    renderTable(
      <DataTable
        columns={rawColumns}
        rows={rows}
        keyExtractor={(r) => r.id}
        stackBreakpoint={stackBreakpoint}
        testID="grid"
      />,
    );
    const complaints = spy.mock.calls
      .map((c) => String(c[0]))
      .filter((m) => /unexpected text node/i.test(m));
    expect(complaints).toEqual([]);
    spy.mockRestore();
  });

  it('still renders the string and numeric values in card-stack mode', () => {
    renderTable(
      <DataTable
        columns={rawColumns}
        rows={rows}
        keyExtractor={(r) => r.id}
        stackBreakpoint={HUGE_WIDTH}
        testID="grid"
      />,
    );
    expect(screen.getByText('Ada')).toBeTruthy();
    expect(screen.getByText('10')).toBeTruthy();
  });
});

describe('DataTable — expandable rows (renderRowDetail + expandedRowKeys)', () => {
  const renderDetail = (r: Person): React.ReactElement => <span>{`detail:${r.name}`}</span>;

  it('renders NO detail panel when renderRowDetail is omitted (backward compatible)', () => {
    // Even with expandedRowKeys set, no renderRowDetail means a plain table.
    renderTable(
      <DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} expandedRowKeys={['a']} stackBreakpoint={0} testID="grid" />,
    );
    expect(screen.queryByTestId('grid-row-detail-a')).toBeNull();
    expect(screen.getByTestId('grid-row-a')).toBeTruthy();
  });

  it('adds no expanded accessibilityState to rows of a plain (non-expandable) table', () => {
    renderTable(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} stackBreakpoint={0} testID="grid" />);
    expect(screen.getByTestId('grid-row-a').getAttribute('aria-expanded')).toBeNull();
  });

  it('renders NO detail panel for rows whose key is not in expandedRowKeys', () => {
    renderTable(
      <DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} renderRowDetail={renderDetail} expandedRowKeys={['a']} stackBreakpoint={0} testID="grid" />,
    );
    expect(screen.queryByTestId('grid-row-detail-b')).toBeNull();
    expect(screen.queryByText('detail:Bo')).toBeNull();
  });

  it('renders NO detail panel when expandedRowKeys is empty or omitted', () => {
    renderTable(
      <DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} renderRowDetail={renderDetail} stackBreakpoint={0} testID="grid" />,
    );
    expect(screen.queryByTestId('grid-row-detail-a')).toBeNull();
    expect(screen.queryByTestId('grid-row-detail-b')).toBeNull();
  });

  it('renders the detail panel for an expanded row, with the derived testID and the a11y label', () => {
    renderTable(
      <DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} renderRowDetail={renderDetail} expandedRowKeys={['a']} stackBreakpoint={0} testID="grid" />,
    );
    const panel = screen.getByTestId('grid-row-detail-a');
    expect(panel).toBeTruthy();
    expect(screen.getByText('detail:Ada')).toBeTruthy();
    expect(panel.getAttribute('aria-label')).toBe('Row detail');
    expect(screen.getByTestId('grid-row-a').getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByTestId('grid-row-b').getAttribute('aria-expanded')).toBe('false');
  });

  it('renders the panel DIRECTLY beneath its own row (between it and the next row)', () => {
    renderTable(
      <DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} renderRowDetail={renderDetail} expandedRowKeys={['a']} stackBreakpoint={0} testID="grid" />,
    );
    const rowA = screen.getByTestId('grid-row-a');
    const panel = screen.getByTestId('grid-row-detail-a');
    const rowB = screen.getByTestId('grid-row-b');
    expect(rowA.nextElementSibling).toBe(panel);
    expect(panel.nextElementSibling).toBe(rowB);
    expect(rowA.parentElement).toBe(panel.parentElement); // same table body, i.e. full-width sibling
  });

  it('supports multiple expanded rows at once, each panel under its own row', () => {
    renderTable(
      <DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} renderRowDetail={renderDetail} expandedRowKeys={['a', 'b']} stackBreakpoint={0} testID="grid" />,
    );
    expect(screen.getByTestId('grid-row-a').nextElementSibling).toBe(screen.getByTestId('grid-row-detail-a'));
    expect(screen.getByTestId('grid-row-b').nextElementSibling).toBe(screen.getByTestId('grid-row-detail-b'));
    expect(screen.getByText('detail:Ada')).toBeTruthy();
    expect(screen.getByText('detail:Bo')).toBeTruthy();
  });

  it('renders the panel beneath the card in the responsive card-stack mode too', () => {
    const HUGE = 5000;
    renderTable(
      <DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} renderRowDetail={renderDetail} expandedRowKeys={['b']} stackBreakpoint={HUGE} testID="grid" />,
    );
    expect(screen.queryByTestId(TABLE_TEST_IDS.head)).toBeNull(); // stacked branch
    expect(screen.getByTestId('grid-row-b').nextElementSibling).toBe(screen.getByTestId('grid-row-detail-b'));
    expect(screen.queryByTestId('grid-row-detail-a')).toBeNull();
  });

  it('leaves expansion to the caller — pressing a row does not open a panel by itself', () => {
    const onRowPress = jest.fn();
    renderTable(
      <DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} renderRowDetail={renderDetail} expandedRowKeys={[]} onRowPress={onRowPress} stackBreakpoint={0} testID="grid" />,
    );
    fireEvent.click(screen.getByTestId('grid-row-a'));
    expect(onRowPress).toHaveBeenCalledWith(rows[0]);
    expect(screen.queryByTestId('grid-row-detail-a')).toBeNull(); // no internal expand state
  });

  it('calls renderRowDetail only for expanded rows', () => {
    const spy = jest.fn(renderDetail);
    renderTable(
      <DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} renderRowDetail={spy} expandedRowKeys={['b']} stackBreakpoint={0} testID="grid" />,
    );
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(rows[1]);
  });

  it('exposes the panel test id shape through rowDetailTestID', () => {
    expect(rowDetailTestID('grid', 'a')).toBe('grid-row-detail-a');
    expect(rowTestID('grid', 'a')).toBe('grid-row-a');
  });
});
