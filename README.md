# @dloizides/ui-tables

Themable, brand-agnostic React Native (RN-web) **table/stat** components for the dloizides.com
portfolio. Reads theme + translations from the shared `@dloizides/ui-feedback` UI context (`useUi`).

## Components

| Component | Status |
|-----------|--------|
| `StatCard` | ✅ Available — labelled metric tile (label + locale-formatted value). |
| `DataTable` | ✅ Available — the shared, tokenized RN-web grid (the `GRID.md` contract): `columns + rows` API, sticky header, zebra striping, per-row tint, pressable rows, per-row `testID` + a11y, optional **expandable rows**, and a responsive label:value **card-stack** below `stackBreakpoint`. |
| `FilterBar` | ✅ Available — the `.ui-filters` shell: wrapping field row + live results count + actions slot. |
| `Pager` | ✅ Available — the `.ui-pager` control: `from–to of N` page-info + rows-per-page pills + Prev/Next. Pass an optional, already-translated `unitLabel` (e.g. `"leadership terms"`) to render `1–50 of 3,023 leadership terms`. |
| `StatGrid` | ⏳ Deferred — exists only in kefi-web (n=1); moves in when a 2nd consumer appears. |

### DataTable / FilterBar / Pager

```tsx
import { DataTable, FilterBar, Pager, type DataTableColumn } from '@dloizides/ui-tables';

const columns: DataTableColumn<Row>[] = [
  { key: 'name', header: 'Name', weight: 2, render: (r) => r.name },
  { key: 'score', header: 'Score', numeric: true, render: (r) => String(r.score) },
];

<FilterBar resultsCount={rows.length} actions={<ApplyButton />}>{fields}</FilterBar>
<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} zebra stickyHeader testID="grid" />
<Pager page={page} pageSize={size} total={total} onPageChange={setPage} onPageSizeChange={setSize} />
```

#### Expandable rows (optional)

For surfaces that open a full-width detail panel under a row (e.g. an audit log's
before/after JSON snapshots), pass `renderRowDetail` + `expandedRowKeys`. The panel renders
between that row and the next — spanning all columns on desktop, and full-width beneath the
card in the card-stack mode. **Expansion is controlled by you**: the table keeps no internal
expand state and renders no chevron; toggle from the existing `onRowPress`.

```tsx
const [expanded, setExpanded] = useState<readonly string[]>([]);
const toggle = (r: Row) =>
  setExpanded((keys) => (keys.includes(r.id) ? keys.filter((k) => k !== r.id) : [...keys, r.id]));

<DataTable
  columns={columns}
  rows={rows}
  keyExtractor={(r) => r.id}       // the SAME key is matched against expandedRowKeys
  onRowPress={toggle}
  expandedRowKeys={expanded}
  renderRowDetail={(r) => <AuditDetail entry={r} />}
  testID="audit"
/>
```

The panel's test id is `` `${testID}-row-detail-${key}` `` (e.g. `audit-row-detail-42`) — build it
with the exported `rowDetailTestID(tableTestID, key)` (rows: `rowTestID(tableTestID, key)`). It is
exposed to assistive tech as a labelled region (provide the `uiTables.rowDetail` key), and the row
reports `aria-expanded`. Omit both props and nothing about the table changes.

#### Pixel-perfect overrides (optional)

**The defaults are opinionated but never mandatory.** When a surface must match an existing
look exactly, pass `styleOverrides` — a per-slot map that is merged **LAST** into each slot's
style array, so it beats both the base StyleSheet **and** the inline theme colours (this kit
keeps colours out of the StyleSheet and applies them from `useUi().theme` at render time, so
an override that only beat the base would still lose to the theme).

```tsx
import type { DataTableStyleOverrides } from '@dloizides/ui-tables';

const overrides: DataTableStyleOverrides = {
  wrap: { borderRadius: 10 },                       // beats the kit's 12 (base StyleSheet)
  headRow: { backgroundColor: theme.surfaceMuted }, // beats theme.colors.background (INLINE colour)
};

<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id}
  stackBreakpoint={0}          // ← keeps the desktop grid at EVERY width (no card-stack)
  styleOverrides={overrides} />
```

| Component | Type | Slots |
|-----------|------|-------|
| `DataTable` | `DataTableStyleOverrides` | `wrap`, `headRow`, `headCell`, `row`, `cell`, `numCell`, `state`, `stateText`, `rowDetail`, `card`, `cardLine`, `cardLabel`, `cardValue` |
| `Pager` | `PagerStyleOverrides` | `pager`, `pagerInfo`, `pagerNav`, `pagerRowsLabel`, `sizeGroup`, `control`, `controlText`, `sizePill`, `sizePillText` |
| `FilterBar` | `FilterBarStyleOverrides` | `filters`, `filtersSpacer`, `results`, `filtersActions` |

**Disabling the card-stack**: the label:value card-stack renders when `width < stackBreakpoint`,
so `stackBreakpoint={0}` (never true) keeps the desktop grid at every width — the opt-out for a
consumer whose table never had a card-stack. Omit `styleOverrides` entirely and every component
renders exactly as it always has.

Colours come entirely from `useUi().theme` (drive it with `@dloizides/design-tokens` via `tokensToUiTheme`), so the grid re-themes per tenant. Every component-authored string is routed through the UiProvider `t` — provide the `uiTables.*` keys (see `TABLE_I18N`) in your locale files; a caller may also pass already-translated `loadingLabel` / `emptyLabel` / `resultsLabel` directly.

## Install

```bash
npm install @dloizides/ui-tables @dloizides/ui-feedback
```

Peer dependencies: `@dloizides/ui-feedback >= 1.1.0`, `react >= 18`, `react-native >= 0.74`.

## Usage

```tsx
import { StatCard } from '@dloizides/ui-tables';

<StatCard label="Total responses" value={1234} testID="stat-total" />
```

Mount a `FeedbackUiProvider` / `UiProvider` (from `@dloizides/ui-feedback`) at your app root so the
component picks up your theme + translations. The injected `t` is called with `analytics.statHint` and
`analytics.statCardLabel` (provide these keys in your locale files).

## License

MIT
