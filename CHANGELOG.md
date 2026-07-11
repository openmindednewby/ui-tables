# Changelog

## 1.5.0

- `Pager` gains two additive, **default-off** props so a paged grid can read exactly like the
  v1 AML console's `.ui-pager__info` line:
  - `infoPrefix?: string` — an already-translated word prefixed to the count
    (e.g. `"Showing"` → `Showing 1–50 of 3,023 leadership terms`).
  - `boldNumbers?: boolean` — renders the three counts (from / to / total) in bold
    `colors.text`, matching v1's `.ui-pager__info b`.
- **Backward-compatible**: with both props omitted the count line is byte-identical to before
  (the concatenated text is unchanged even with `boldNumbers` on — bold is styling only), so
  existing consumers (`/coverage`, aml-v2) are unaffected.

## Unreleased

- **Pixel-perfect overrides** (additive, backward-compatible). The kit's defaults are
  opinionated but never mandatory — a consumer that must match an existing look can now
  do so without forking:
  - `DataTable` gains `styleOverrides?: DataTableStyleOverrides` (slots: `wrap`, `headRow`,
    `headCell`, `row`, `cell`, `numCell`, `state`, `stateText`, `rowDetail`, `card`,
    `cardLine`, `cardLabel`, `cardValue`).
  - `Pager` gains `styleOverrides?: PagerStyleOverrides` (slots: `pager`, `pagerInfo`,
    `pagerNav`, `pagerRowsLabel`, `sizeGroup`, `control`, `controlText`, `sizePill`,
    `sizePillText`).
  - `FilterBar` gains `styleOverrides?: FilterBarStyleOverrides` (slots: `filters`,
    `filtersSpacer`, `results`, `filtersActions`).
  - Each slot is merged **LAST** into its style array, so an override beats the base
    StyleSheet **and** the inline colour the component applies from `useUi().theme`
    (colours are never in the StyleSheet in this kit).
  - Documented: `stackBreakpoint={0}` disables the responsive card-stack (`width < 0` is
    never true), for surfaces that never had one.
  - Omit `styleOverrides` and every render is byte-identical to before (verified by test).

- `DataTable` — **expandable rows** (additive, backward-compatible). Two new optional props:
  - `renderRowDetail?: (row: T) => React.ReactNode` — renders a full-width detail panel
    (spanning every column) directly beneath a row, between it and the next row. Works in
    the desktop grid *and* in the responsive card-stack.
  - `expandedRowKeys?: readonly string[]` — the `keyExtractor` keys of the rows currently
    expanded. Expansion is **controlled by the caller** (own the state, toggle from
    `onRowPress`); the table keeps no internal expand state and adds no chevron.
  - The panel gets a stable test id `${testID}-row-detail-${key}` (new helpers
    `rowDetailTestID(tableTestID, key)` / `rowTestID(tableTestID, key)`), is exposed to
    assistive tech as a labelled region (`accessibilityRole="summary"` +
    the new `uiTables.rowDetail` translation key), and the row it belongs to reports
    `aria-expanded` / `accessibilityState.expanded`.
  - Omit both props and the table renders exactly as before: no extra DOM node, no extra
    row props, no behaviour change for existing consumers.
  - Unblocks kefi-web's audit log (before/after JSON snapshot panel) adopting `DataTable`.

## 1.2.0

- `Pager` — new optional `unitLabel?: string` prop. When supplied it appends an
  already-translated unit noun to the count line, e.g. `unitLabel="leadership terms"`
  renders `1–50 of 3,023 leadership terms` (v1 parity). Backward-compatible: when the
  prop is omitted (or empty) the count line stays the generic `from–to of N`,
  byte-identical to prior behaviour.
- Test tooling — added `src/jest-dom.d.ts` so ts-jest picks up the
  `@testing-library/jest-dom` matcher types (`toBeDisabled`, …) when type-checking each
  test file (`jest.setup.ts` sits outside the `src/**` include). Fixes the `Pager` suite
  failing to compile under the isolated ts-jest type-check.

## 1.1.0

- `DataTable` — promoted from the `/coverage` RN-web POC and hardened into the shared,
  tokenized grid (the `wwwroot/shared/GRID.md` contract):
  - per-row `testID` + `accessibilityLabel`/`accessibilityHint`, pressable rows (`onRowPress`);
  - all user-facing chrome routed through the UiProvider `t` (no literals) — falls back to
    caller-supplied `loadingLabel`/`emptyLabel`;
  - fixed the POC's double `col.render()` call in the desktop path (now rendered once per cell);
  - added the rest of the GRID.md contract: `FilterBar`, `Pager` (page-info + Prev/Next +
    rows-per-page), an optional `zebra` modifier, and a `stickyHeader`;
  - responsive label:value card-stack via `useWindowDimensions` below `stackBreakpoint`;
  - every colour from `@dloizides/design-tokens` via the `useUi()` theme — no hardcoded colours.
- Component tests (`DataTable`, `FilterBar`, `Pager`) added.

## 1.0.0

Initial release (Capability Wave C1, batch 3).

- `StatCard` — extracted from the proven erevna ↔ katalogos duplication; shares the
  `@dloizides/ui-feedback` UI context (`useUi`).
- `DataTable` / `StatGrid` intentionally NOT included yet — they exist only in kefi-web (n=1);
  they'll be added when a 2nd consumer appears.
