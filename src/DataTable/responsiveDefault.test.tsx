/**
 * Responsive DEFAULT-breakpoint coverage.
 *
 * Every OTHER responsive test in this suite pins the layout by FORCING `stackBreakpoint`
 * to `0` (always desktop) or a huge number (always stacked). That proves the two branches
 * render, but it never exercises the real-world path that the FINREG mobile UX-QA bug hit:
 * a consumer that passes NO `stackBreakpoint` at all (so the default `CARD_STACK_BREAKPOINT`
 * of 768 applies) at an actual phone-width window. The reported symptom — a multi-column
 * grid compressed into a 390px viewport, cells overprinting each other — is exactly what a
 * table renders when it FAILS to take the stacked branch at phone width.
 *
 * These tests lock that path by controlling the window width the component reads. Width is
 * detected via `useWindowDimensions` — the same react-native `Dimensions` API the rest of
 * the `@dloizides/*` kit uses to decide "mobile" (e.g. ui-nav's AppShell/MobileDrawer at its
 * 768 `MOBILE_BREAKPOINT`) — so we mock that hook rather than invent a new mechanism.
 */
import { render, screen } from '@testing-library/react';
import React from 'react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

// react-native is mapped to react-native-web by jest (moduleNameMapper). We replace only
// `useWindowDimensions` with a controllable stub, keeping every other RN-web export intact,
// so the component's width detection is deterministic instead of tied to the ambient jsdom
// window. `mockWidth` is read live on each render, letting one test drive both widths.
let mockWidth = 1024;
jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native-web');
  return {
    ...actual,
    useWindowDimensions: (): { width: number; height: number; scale: number; fontScale: number } => ({
      width: mockWidth,
      height: 800,
      scale: 1,
      fontScale: 1,
    }),
  };
});

// Imported AFTER the mock is registered so the component picks up the stubbed hook.
// eslint-disable-next-line import/first
import { DataTable } from './DataTable';
// eslint-disable-next-line import/first
import { CARD_STACK_BREAKPOINT, TABLE_I18N, TABLE_TEST_IDS } from './constants';
// eslint-disable-next-line import/first
import type { DataTableColumn } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#4f46e5' } },
  semantic: { error: { '500': '#dc2626' } },
};
const T_MAP: Record<string, string> = {
  [TABLE_I18N.rowLabel]: 'Row',
  [TABLE_I18N.rowHint]: 'Row hint',
};
const t: UiValue['t'] = (key) => T_MAP[key] ?? key;

interface Txn {
  id: string;
  provider: string;
  amount: string;
}
// Two multi-column rows, mirroring the FINREG transaction grid that collided on mobile
// (a value column + a right-aligned numeric amount + a status/provider column).
const columns: ReadonlyArray<DataTableColumn<Txn>> = [
  { key: 'provider', header: 'Provider', render: (r) => r.provider },
  { key: 'amount', header: 'Amount', numeric: true, render: (r) => r.amount },
];
const rows: Txn[] = [
  { id: 'a', provider: 'Returnpraxis', amount: '€8,386.99' },
  { id: 'b', provider: 'Acme', amount: '€12.00' },
];

const PHONE_WIDTH = 390; // the exact viewport the live UX-QA review measured
const DESKTOP_WIDTH = 1280;

function renderTable(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<UiProvider theme={theme} t={t}>{ui}</UiProvider>);
}

describe('DataTable — DEFAULT breakpoint responsive behaviour (no stackBreakpoint prop)', () => {
  afterEach(() => {
    mockWidth = 1024;
  });

  it('sanity: the default breakpoint is the kit-wide 768 phone threshold', () => {
    // 390 (phone) is below it; 1280 (desktop) is above it. Guards the premise of the two
    // behavioural tests below and documents WHY those widths were chosen.
    expect(PHONE_WIDTH).toBeLessThan(CARD_STACK_BREAKPOINT);
    expect(DESKTOP_WIDTH).toBeGreaterThanOrEqual(CARD_STACK_BREAKPOINT);
    expect(CARD_STACK_BREAKPOINT).toBe(768);
  });

  it('STACKS to label:value cards at phone width when the consumer passes NO stackBreakpoint', () => {
    // The regression the FINREG bug represents: at 390px with the default breakpoint the grid
    // must collapse to cards, NOT compress its columns into the viewport.
    mockWidth = PHONE_WIDTH;
    renderTable(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} testID="grid" />);

    // One column header PER CARD (2 cards ⇒ 2 "Provider" labels) proves the stacked branch;
    // the desktop layout renders each header exactly once.
    expect(screen.getAllByText('Provider').length).toBe(rows.length);
    expect(screen.getAllByText('Amount').length).toBe(rows.length);
    // The card-stack's head carrier is present (E2E hook) but a11y-inert — a stacked-only trait.
    expect(screen.getByTestId(TABLE_TEST_IDS.head).getAttribute('aria-hidden')).toBe('true');
    // Every value still renders and is reachable, one field per line.
    expect(screen.getByText('Returnpraxis')).toBeTruthy();
    expect(screen.getByText('€8,386.99')).toBeTruthy();
  });

  it('keeps the DESKTOP grid at wide width with the same default (headers render once)', () => {
    mockWidth = DESKTOP_WIDTH;
    renderTable(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} testID="grid" />);

    // Desktop header row ⇒ each column header appears exactly once (not once-per-row).
    expect(screen.getAllByText('Provider').length).toBe(1);
    expect(screen.getAllByText('Amount').length).toBe(1);
    // Desktop keeps a REAL (non-inert) header region, unlike the stacked sentinel.
    expect(screen.getByTestId(TABLE_TEST_IDS.head).getAttribute('aria-hidden')).toBeNull();
    // Per-row / per-cell test ids remain stable across the width change.
    expect(screen.getByTestId('grid-row-a-provider')).toBeTruthy();
    expect(screen.getByTestId('grid-row-a-amount')).toBeTruthy();
  });

  it('re-evaluates the layout when the window width crosses the breakpoint (no stackBreakpoint)', () => {
    mockWidth = DESKTOP_WIDTH;
    const { rerender } = renderTable(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} testID="grid" />);
    expect(screen.getAllByText('Provider').length).toBe(1); // desktop: single header

    mockWidth = PHONE_WIDTH;
    rerender(
      <UiProvider theme={theme} t={t}>
        <DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} testID="grid" />
      </UiProvider>,
    );
    expect(screen.getAllByText('Provider').length).toBe(rows.length); // phone: one header per card
  });

  it('still honours an explicit stackBreakpoint={0} opt-out even at phone width', () => {
    // The documented escape hatch: a consumer that deliberately never wants the card-stack.
    // This guards that the default-path work above did not remove the opt-out.
    mockWidth = PHONE_WIDTH;
    renderTable(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} stackBreakpoint={0} testID="grid" />);
    expect(screen.getAllByText('Provider').length).toBe(1); // desktop grid despite phone width
  });
});
