# @dloizides/ui-tables

Themable, brand-agnostic React Native (RN-web) **table/stat** components for the dloizides.com
portfolio. Reads theme + translations from the shared `@dloizides/ui-feedback` UI context (`useUi`).

## Components

| Component | Status |
|-----------|--------|
| `StatCard` | ✅ Available — labelled metric tile (label + locale-formatted value). |
| `DataTable` | ✅ Available — the shared, tokenized RN-web grid (the `GRID.md` contract): `columns + rows` API, sticky header, zebra striping, per-row tint, pressable rows, per-row `testID` + a11y, and a responsive label:value **card-stack** below `stackBreakpoint`. |
| `FilterBar` | ✅ Available — the `.ui-filters` shell: wrapping field row + live results count + actions slot. |
| `Pager` | ✅ Available — the `.ui-pager` control: `from–to of N` page-info + rows-per-page pills + Prev/Next. |
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
