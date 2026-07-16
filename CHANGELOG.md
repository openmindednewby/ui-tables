# Changelog

## 1.9.2

- **🔴 In-cell action buttons (Edit/Delete/Stop) now fire on a real pointer gesture, not just a bare
  synthetic click.** A NON-interactive row (no `onRowPress`) was still rendered as a `<Pressable>`.
  On react-native-web a `Pressable` installs pointer responders (pointerdown/up/cancel) on the row
  container that CAPTURE a real mouse/touch gesture and cancel the press of any interactive child in
  a cell — so a Delete/Stop/Edit button inside a static row looked clickable, fired on a bare
  `element.click()`, but silently did nothing on an actual click/tap (and on a Playwright `.click()`,
  which is why the AML v2 settings webhook-delete + stop-monitoring E2Es were red). A non-pressable
  row is now a plain `<View>` (new `RowContainer`), so its cell controls receive the full gesture.
  Interactive tables (`onRowPress`) are unchanged. Same class as the earlier `disabled`→
  `pointer-events:none` fix; this closes the remaining pointer-responder-capture path.

## 1.9.0

- **`Pager` dropdown-variant rows menu now escapes ancestor stacking contexts (web).** The
  `rowsVariant="dropdown"` `SizeDropdown` menu opened but painted UNDER the results table on wide
  web: react-native-web renders every `View` as `position: relative; z-index: 0`, so the in-tree
  `position: absolute; zIndex: 1000` menu was trapped inside its anchor's stacking context and lost
  to later-painting siblings (the table / cards below).
  - On **web** the open menu now renders in a PORTAL to `document.body` with `position: fixed` at the
    trigger's measured viewport rect (right-aligned, recomputed on scroll/resize) and a high `zIndex`
    — clipped by nothing, above everything. Mirrors `@dloizides/ui-layout`'s InlineMenu fix.
  - On **native** the menu is unchanged (in-tree `position: absolute` + `elevation`). All web-only code
    (portal, `document`/`window` listeners, `position: fixed`) is guarded behind `Platform.OS === 'web'`.
  - Outside-click dismissal now consults BOTH the anchor and the portalled menu node.
  - `react-dom` is added as an **optional** peer dependency (only touched on web; every RN-web consumer
    already has it). No API change: the `rowsVariant="dropdown"` contract, all test ids, the compact v1
    look and a11y (role/aria/keyboard) are unchanged.

## 1.8.0

- `Pager` gains an additive, **default-off** `rowsVariant?: 'pills' | 'dropdown'` prop.
  - `'pills'` (default) is unchanged — the RN-idiom row of pressable size pills. Every existing
    consumer (erevna / katalogos / kefi / coverage) renders byte-identically.
  - `'dropdown'` swaps the size pills for a compact `<select>`-like anchored dropdown matching
    the v1 console's "Rows" select: a bordered trigger (height-matched to the Prev/Next ghost
    buttons) showing the current size + a chevron, opening a popover of the `pageSizeOptions`
    that fires `onPageSizeChange` and closes on select / outside-click / Escape. The "Rows"
    caption is mixed-case (not uppercase) in this variant, matching v1's muted `.hint` label.
  - Self-contained: the anchored dropdown is implemented inside ui-tables (new `SizeDropdown`),
    reusing ui-layout's InlineMenu click-outside/Escape pattern WITHOUT taking a hard dependency
    on `@dloizides/ui-layout` — its ModalDropdown trigger has fixed chunky padding and no chevron,
    so it cannot match v1's compact select, and a low-level table primitive should not depend on
    a higher-level layout package. New option/trigger test ids: `${testID}-size-trigger`,
    `${testID}-size-menu`, and the existing `${testID}-size-${size}` per option.

## 1.7.0

- **Accessibility (WCAG 2.1 AA) hardening — additive + backward-compatible.**
  - `FilterBar`: the results-count line is now a `role="status"` / `aria-live="polite"` live
    region, so a screen reader announces the new count when filters change the result set
    (WCAG 4.1.3).
  - `Pager`: the Prev/Next controls and the rows-per-page pills gain a vertical `hitSlop` so the
    touch target reaches ~44px WITHOUT changing the rendered size (adjacent pills never overlap).

## 1.6.0

- `DataTable` gains a **web row-hover highlight** on clickable rows, matching the v1 console's
  `.ui-table tr.clickable:hover` rule. Only interactive rows (those with an `onRowPress`) tint
  on hover — static rows never light up. The tint is the theme's soft brand fill
  (`palette.primary['500']` at low alpha via the new `softBrandTint` helper), so it re-themes
  per tenant, falling back to a subtle surface tint when `primary` is not a plain `#rrggbb`.
  The hover tint wins over zebra/`rowTint` while hovered (mirroring v1's `:hover td { background }`).
- **Native-safe + backward-compatible**: hover is driven by `Pressable`'s `onHoverIn`/`onHoverOut`,
  which are no-ops on iOS/Android, and the handlers are wired only for interactive tables — a
  non-interactive table renders byte-identically to before. Benefits every consumer
  (erevna/katalogos/kefi/aml-v2) with clickable rows.

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
