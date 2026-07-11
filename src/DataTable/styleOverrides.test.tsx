/**
 * The kit must never FORCE a look. `styleOverrides` merges LAST into every slot, so a
 * consumer wins over the base StyleSheet AND over the inline colour the component
 * applies from `useUi().theme` — while everyone who does not opt in keeps today's
 * rendering byte-for-byte.
 *
 * Under react-native-web the BASE (StyleSheet.create) styles compile to atomic CSS
 * CLASSES (`r-borderRadius-…`), while inline objects — the theme colours and these
 * overrides — land in the element's `style` attribute. So "the override won" is
 * asserted on `element.style.*`, and "the theme colour lost" on the same property.
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { DataTable } from './DataTable';
import { FilterBar } from './FilterBar';
import { Pager } from './Pager';
import { TABLE_TEST_IDS } from './constants';
import type { DataTableColumn, DataTableStyleOverrides } from './types';

const THEME_BACKGROUND = '#f4f6fb';
/** A cell rendering a custom NODE (not a string) — only `cellWrap` can style its box. */
function BadgeNode(): React.ReactElement {
  return <Text testID="badge-node">badge</Text>;
}

const KEFI_RADIUS = 10;
const DEFAULT_RADIUS = 12; // the kit's `tableStyles.wrap` borderRadius — must not change
const KEFI_SURFACE_MUTED = '#eef1f6';
const KEFI_HEAD_BG = 'rgb(238, 241, 246)'; // KEFI_SURFACE_MUTED as the DOM reports it
const THEME_HEAD_BG = 'rgb(244, 246, 251)'; // THEME_BACKGROUND — what the kit applies by default
const CELL_COLOR = '#0a7d32';
const CELL_COLOR_RGB = 'rgb(10, 125, 50)';
const NARROW_WIDTH = 1;
const HUGE_BREAKPOINT = 100_000;
const NO_STACK = 0;

const theme: UiTheme = {
  colors: { background: THEME_BACKGROUND, surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#4f46e5' } },
  semantic: { error: { '500': '#dc2626' } },
};
const t: UiValue['t'] = (key) => key;

interface Person { id: string; name: string; score: number }
const columns: ReadonlyArray<DataTableColumn<Person>> = [
  { key: 'name', header: 'Name', weight: 2, render: (r) => r.name },
  { key: 'score', header: 'Score', numeric: true, render: (r) => String(r.score) },
];
const rows: Person[] = [
  { id: 'a', name: 'Ada', score: 10 },
  { id: 'b', name: 'Bo', score: 20 },
];

function renderUi(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<UiProvider theme={theme} t={t}>{ui}</UiProvider>);
}

describe('DataTable — styleOverrides is purely additive (backward compatible)', () => {
  it('renders byte-identical markup with styleOverrides omitted vs explicitly undefined', () => {
    const a = renderUi(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} zebra stackBreakpoint={NO_STACK} testID="grid" />);
    const withoutProp = a.container.innerHTML;
    a.unmount();
    const b = renderUi(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} zebra stackBreakpoint={NO_STACK} styleOverrides={undefined} testID="grid" />);
    expect(b.container.innerHTML).toBe(withoutProp);
  });

  it('keeps the shared defaults when no override is passed: theme background on the head, base radius class on the wrap', () => {
    renderUi(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} stackBreakpoint={NO_STACK} testID="grid" />);
    const head = screen.getByTestId(TABLE_TEST_IDS.head);
    const wrap = screen.getByTestId('grid');
    expect(head.style.backgroundColor).toBe(THEME_HEAD_BG); // theme.colors.background — unchanged default
    expect(wrap.style.borderRadius).toBe(''); // radius comes from the base StyleSheet class, not inline
    expect(wrap.className).toMatch(/r-borderRadius-/);
  });
});

/**
 * The radius a slot actually renders with: react-native-web resolves the merged style
 * array per property, so an overridden `borderRadius` either lands inline (a plain
 * object override) or as the override's own atomic class (a StyleSheet.create'd one).
 * Read whichever the resolver chose — both prove the base value lost.
 */
const RADIUS_IN_RULE = /border-top-left-radius:\s*([^;}]+)/;

function resolvedRadius(el: HTMLElement): string {
  const inline = el.style.getPropertyValue('border-top-left-radius');
  if (inline !== '') return inline;
  const rules = Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules));
  for (const cls of Array.from(el.classList)) {
    const rule = rules.find((r) => r.cssText.startsWith(`.${cls} `));
    const match = rule ? RADIUS_IN_RULE.exec(rule.cssText) : null;
    if (match?.[1] !== undefined) return match[1].trim();
  }
  return '';
}

describe('DataTable — cellWrap reaches EVERY cell (incl. custom nodes)', () => {
  const CELL_PAD = 8;
  /** A column whose render returns a NODE, not a string — `cell` (TextStyle) cannot reach it. */
  const nodeColumns: ReadonlyArray<DataTableColumn<Person>> = [
    { key: 'name', header: 'Name', render: (r) => r.name }, // string cell
    { key: 'badge', header: 'Badge', render: () => <BadgeNode /> }, // custom-node cell
  ];

  it('applies to a string cell AND a custom-node cell', () => {
    renderUi(
      <DataTable
        columns={nodeColumns}
        rows={rows}
        keyExtractor={(r) => r.id}
        stackBreakpoint={NO_STACK}
        styleOverrides={{ cellWrap: { paddingHorizontal: CELL_PAD } }}
        testID="grid"
      />,
    );
    // Both cells' wrapping Views carry the override — this is the slot `cell` cannot serve.
    for (const colKey of ['name', 'badge']) {
      const cell = screen.getByTestId(`grid-row-a-${colKey}`);
      expect(cell.style.paddingLeft).toBe(`${CELL_PAD}px`);
      expect(cell.style.paddingRight).toBe(`${CELL_PAD}px`);
    }
  });

  it('adds no cell padding when the override is omitted (default unchanged)', () => {
    renderUi(
      <DataTable columns={nodeColumns} rows={rows} keyExtractor={(r) => r.id} stackBreakpoint={NO_STACK} testID="grid" />,
    );
    expect(screen.getByTestId('grid-row-a-name').style.paddingLeft).toBe('');
  });
});

describe('DataTable — an override beats the BASE style', () => {
  it('wrap: a consumer borderRadius (10) overrides the kit default (12)', () => {
    const styleOverrides: DataTableStyleOverrides = { wrap: { borderRadius: KEFI_RADIUS } };
    renderUi(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} stackBreakpoint={NO_STACK} styleOverrides={styleOverrides} testID="grid" />);
    const wrap = screen.getByTestId('grid');
    expect(resolvedRadius(wrap)).toBe(`${KEFI_RADIUS}px`); // kefi's 10, not the kit's 12
    expect(resolvedRadius(wrap)).not.toBe(`${DEFAULT_RADIUS}px`);
  });

  it('accepts a StyleSheet.create()d override too (same slot contract)', () => {
    const sheet = StyleSheet.create({ wrap: { borderRadius: KEFI_RADIUS } });
    renderUi(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} stackBreakpoint={NO_STACK} styleOverrides={{ wrap: sheet.wrap }} testID="grid" />);
    expect(resolvedRadius(screen.getByTestId('grid'))).toBe(`${KEFI_RADIUS}px`);
  });

  it('keeps the kit default radius when no override is passed', () => {
    renderUi(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} stackBreakpoint={NO_STACK} testID="grid" />);
    expect(resolvedRadius(screen.getByTestId('grid'))).toBe(`${DEFAULT_RADIUS}px`);
  });
});

describe('DataTable — an override beats the INLINE THEME COLOUR (the important one)', () => {
  it('headRow: surfaceMuted overrides the theme `background` the kit applies inline', () => {
    const styleOverrides: DataTableStyleOverrides = { headRow: { backgroundColor: KEFI_SURFACE_MUTED } };
    renderUi(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} stackBreakpoint={NO_STACK} styleOverrides={styleOverrides} testID="grid" />);
    const head = screen.getByTestId(TABLE_TEST_IDS.head);
    expect(head.style.backgroundColor).toBe(KEFI_HEAD_BG);
    expect(head.style.backgroundColor).not.toBe(THEME_HEAD_BG); // the theme colour lost
  });

  it('row + rowDetail: overrides beat the inline theme colours there too', () => {
    const OVERRIDE_ROW_BG = 'rgb(255, 250, 240)';
    const styleOverrides: DataTableStyleOverrides = {
      row: { backgroundColor: OVERRIDE_ROW_BG },
      rowDetail: { backgroundColor: OVERRIDE_ROW_BG },
    };
    renderUi(
      <DataTable
        columns={columns}
        rows={rows}
        keyExtractor={(r) => r.id}
        zebra
        renderRowDetail={(r) => <span>{`detail:${r.name}`}</span>}
        expandedRowKeys={['a']}
        stackBreakpoint={NO_STACK}
        styleOverrides={styleOverrides}
        testID="grid"
      />,
    );
    // row 'b' is the zebra row — its inline theme tint must lose to the override.
    expect(screen.getByTestId('grid-row-b').style.backgroundColor).toBe(OVERRIDE_ROW_BG);
    expect(screen.getByTestId('grid-row-detail-a').style.backgroundColor).toBe(OVERRIDE_ROW_BG);
  });
});

describe('DataTable — every slot is genuinely reachable', () => {
  it('cell + numCell (inside the cellContent helper) reach the desktop cells', () => {
    const NUM_COLOR = 'rgb(1, 2, 3)';
    renderUi(
      <DataTable
        columns={columns}
        rows={rows}
        keyExtractor={(r) => r.id}
        stackBreakpoint={NO_STACK}
        styleOverrides={{ cell: { color: CELL_COLOR }, numCell: { color: NUM_COLOR } }}
        testID="grid"
      />,
    );
    // `cell` beats the inline theme text colour on the string column…
    expect(screen.getByText('Ada').style.color).toBe(CELL_COLOR_RGB);
    // …and `numCell` is layered after `cell` on the numeric column.
    expect(screen.getByText('10').style.color).toBe(NUM_COLOR);
  });

  it('card, cardLine, cardLabel, cardValue + cell reach the card-stack branch', () => {
    const CARD_BG = 'rgb(250, 250, 250)';
    const LABEL_COLOR = 'rgb(9, 9, 9)';
    const { container } = renderUi(
      <DataTable
        columns={columns}
        rows={rows}
        keyExtractor={(r) => r.id}
        stackBreakpoint={HUGE_BREAKPOINT}
        styleOverrides={{
          card: { backgroundColor: CARD_BG },
          cardLine: { opacity: 0.9 },
          cardLabel: { color: LABEL_COLOR },
          cardValue: { opacity: 0.8 },
          cell: { color: CELL_COLOR },
        }}
        testID="grid"
      />,
    );
    expect(screen.queryByTestId(TABLE_TEST_IDS.head)).toBeNull(); // stacked branch
    const card = screen.getByTestId('grid-row-a');
    expect(card.style.backgroundColor).toBe(CARD_BG);
    expect(screen.getAllByText('Name')[0]?.style.color).toBe(LABEL_COLOR); // cardLabel beat textSecondary
    expect(screen.getByText('Ada').style.color).toBe(CELL_COLOR_RGB); // cell reaches the card value
    // cardLine / cardValue are the only opacity-carrying nodes in this render.
    const opacities = Array.from(container.querySelectorAll<HTMLElement>('[style*="opacity"]')).map((el) => el.style.opacity);
    expect(opacities).toContain('0.9');
    expect(opacities).toContain('0.8');
  });

  it('state + stateText reach the loading and empty states', () => {
    const STATE_BG = 'rgb(240, 240, 240)';
    const STATE_COLOR = 'rgb(20, 20, 20)';
    const overrides: DataTableStyleOverrides = { state: { backgroundColor: STATE_BG }, stateText: { color: STATE_COLOR } };
    const { container, unmount } = renderUi(
      <DataTable columns={columns} rows={[]} keyExtractor={(r) => r.id} loading loadingLabel="Loading" styleOverrides={overrides} testID="grid" />,
    );
    expect(container.querySelector<HTMLElement>(`[style*="${STATE_BG}"]`)).not.toBeNull();
    expect(screen.getByText('Loading').style.color).toBe(STATE_COLOR);
    unmount();

    renderUi(<DataTable columns={columns} rows={[]} keyExtractor={(r) => r.id} emptyLabel="Empty" styleOverrides={overrides} testID="grid" />);
    expect(screen.getByText('Empty').style.color).toBe(STATE_COLOR);
  });

  it('headCell reaches the desktop header cells', () => {
    const HEAD_COLOR = 'rgb(7, 7, 7)';
    renderUi(
      <DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} stackBreakpoint={NO_STACK} styleOverrides={{ headCell: { color: HEAD_COLOR } }} testID="grid" />,
    );
    expect(screen.getByText('Name').style.color).toBe(HEAD_COLOR); // beat textSecondary
  });
});

describe('DataTable — the card-stack is opt-out via stackBreakpoint={0}', () => {
  it('renders the desktop grid (no card-stack) even at a tiny width', () => {
    window.innerWidth = NARROW_WIDTH;
    renderUi(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} stackBreakpoint={NO_STACK} testID="grid" />);
    // `width < 0` is never true → the header row (desktop-only) is present and each
    // column header renders exactly once (a card-stack repeats it per row).
    expect(screen.getByTestId(TABLE_TEST_IDS.head)).toBeTruthy();
    expect(screen.getAllByText('Name')).toHaveLength(1);
  });
});

describe('Pager / FilterBar — styleOverrides', () => {
  const noop = (): void => undefined;

  it('Pager: overrides reach pager/pagerInfo/pagerNav/rowsLabel/sizeGroup/control/controlText/sizePill/sizePillText', () => {
    const PAGER_BG = 'rgb(11, 11, 11)';
    const INFO_COLOR = 'rgb(12, 12, 12)';
    const CONTROL_COLOR = 'rgb(13, 13, 13)';
    const PILL_COLOR = 'rgb(14, 14, 14)';
    const NAV_BG = 'rgb(15, 15, 15)';
    const GROUP_BG = 'rgb(16, 16, 16)';
    const PILL_BG = 'rgb(17, 17, 17)';
    const CONTROL_BG = 'rgb(18, 18, 18)';
    const ROWS_LABEL_COLOR = 'rgb(19, 19, 19)';
    const PAGE_SIZE = 25;
    const TOTAL = 100;
    const { container } = renderUi(
      <Pager
        page={1}
        pageSize={PAGE_SIZE}
        total={TOTAL}
        onPageChange={noop}
        onPageSizeChange={noop}
        pageSizeOptions={[PAGE_SIZE]}
        styleOverrides={{
          pager: { backgroundColor: PAGER_BG },
          pagerInfo: { color: INFO_COLOR },
          pagerNav: { backgroundColor: NAV_BG },
          pagerRowsLabel: { color: ROWS_LABEL_COLOR },
          sizeGroup: { backgroundColor: GROUP_BG },
          control: { backgroundColor: CONTROL_BG },
          controlText: { color: CONTROL_COLOR },
          sizePill: { backgroundColor: PILL_BG }, // beats the ACTIVE brand background
          sizePillText: { color: PILL_COLOR },    // beats the ACTIVE surface colour
        }}
        testID="pgr"
      />,
    );
    expect(screen.getByTestId('pgr').style.backgroundColor).toBe(PAGER_BG);
    expect(screen.getByTestId(TABLE_TEST_IDS.pagerInfo).style.color).toBe(INFO_COLOR);
    const next = screen.getByTestId(TABLE_TEST_IDS.pagerNext);
    expect(next.style.backgroundColor).toBe(CONTROL_BG);
    expect(screen.getByTestId(`pgr-size-${PAGE_SIZE}`).style.backgroundColor).toBe(PILL_BG); // brand lost
    const colors = Array.from(container.querySelectorAll<HTMLElement>('[style*="color"]')).map((el) => el.style.color);
    expect(colors).toContain(CONTROL_COLOR);
    expect(colors).toContain(PILL_COLOR);
    expect(colors).toContain(ROWS_LABEL_COLOR);
    const backgrounds = Array.from(container.querySelectorAll<HTMLElement>('[style*="background-color"]')).map((el) => el.style.backgroundColor);
    expect(backgrounds).toContain(NAV_BG);
    expect(backgrounds).toContain(GROUP_BG);
  });

  it('FilterBar: overrides reach filters/filtersSpacer/results/filtersActions and beat the theme surface', () => {
    const FILTERS_BG = 'rgb(21, 21, 21)';
    const RESULTS_COLOR = 'rgb(22, 22, 22)';
    const ACTIONS_BG = 'rgb(23, 23, 23)';
    const SPACER_BG = 'rgb(24, 24, 24)';
    const COUNT = 7;
    const { container } = renderUi(
      <FilterBar
        resultsCount={COUNT}
        resultsLabel="results"
        actions={<span>Apply</span>}
        styleOverrides={{
          filters: { backgroundColor: FILTERS_BG },
          filtersSpacer: { backgroundColor: SPACER_BG },
          results: { color: RESULTS_COLOR },
          filtersActions: { backgroundColor: ACTIONS_BG },
        }}
        testID="bar"
      />,
    );
    expect(screen.getByTestId('bar').style.backgroundColor).toBe(FILTERS_BG); // theme surface lost
    expect(screen.getByTestId(TABLE_TEST_IDS.results).style.color).toBe(RESULTS_COLOR);
    const backgrounds = Array.from(container.querySelectorAll<HTMLElement>('[style*="background-color"]')).map((el) => el.style.backgroundColor);
    expect(backgrounds).toContain(SPACER_BG);
    expect(backgrounds).toContain(ACTIONS_BG);
  });

  it('Pager / FilterBar render identically with the prop omitted vs explicitly undefined', () => {
    const PAGE_SIZE = 25;
    const TOTAL = 100;
    const a = renderUi(<Pager page={1} pageSize={PAGE_SIZE} total={TOTAL} onPageChange={noop} onPageSizeChange={noop} />);
    const pagerHtml = a.container.innerHTML;
    a.unmount();
    const b = renderUi(<Pager page={1} pageSize={PAGE_SIZE} total={TOTAL} onPageChange={noop} onPageSizeChange={noop} styleOverrides={undefined} />);
    expect(b.container.innerHTML).toBe(pagerHtml);
    b.unmount();

    const c = renderUi(<FilterBar resultsCount={TOTAL} />);
    const barHtml = c.container.innerHTML;
    c.unmount();
    const d = renderUi(<FilterBar resultsCount={TOTAL} styleOverrides={undefined} />);
    expect(d.container.innerHTML).toBe(barHtml);
  });
});
