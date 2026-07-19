# Changelog

## 1.14.0

**Campaign F2 — the private filter fields are now public, in `@dloizides/ui-forms`.**

This package contained a complete, themed, a11y-wired set of form controls inside its `Filters`
bar and exported NONE of them. Six portals could see them working and none could import them, so
the fleet reimplemented them: **6 select implementations, 5 date fields, 2 typeaheads**. Same
shape as `MultiTenancy.EntityFrameworkCore` shipping no EF Core. They now live in
`@dloizides/ui-forms` 1.8.0 as `SelectControl` / `TypeaheadControl` / `DateRangeControl` /
`AnchoredMenu` / `controlStyles`, and this package consumes them.

**No behaviour changed. All 258 pre-existing tests pass UNMODIFIED** — including
`Filters.test.tsx` (which drives every field kind through the bar), `selectAccessibleName.test.tsx`
(the i18n path) and `suggest.test.ts` (now running against the moved implementation). That is the
proof the move preserved behaviour rather than merely relocating it.

### What moved, and what deliberately did not

The controls moved; the **schema** stayed. Each field was bound to this bar's `FilterField` types
(`field: SelectFilterField`, `barTestID`, `fieldTestID`), so moving them verbatim would have
dragged `FilterField`, `FilterFieldKind`, `FilterValues` and `FIELD_MIN_WIDTH` into `ui-forms` —
i.e. `ui-forms` would have come to own "what a filter bar's field schema is". Wrong direction.
The field files are now thin ADAPTERS mapping schema → plain props.

`TextField` and `BooleanField` stayed. `ui-forms` already ships two text inputs (`ThemedTextInput`,
`FormField`) and a switch row (`FormSwitch`); promoting a third of each would ADD duplicates to the
package this campaign is de-duplicating. Converging onto the existing ones is right but VISIBLE
(focus ring, hover border, `surfaceElevated` background, different switch-row metrics), so it
belongs in the visual-QA-gated wave. Both now use the shared `controlStyles` boxes, so no metric
is forked in the meantime.

### `FieldShell` is deleted

The private label-wrapper fork existed only because `Field` hard-coded the 13/600 `field` label
voice. `Field` 1.7.0 named both contract voices, so the bar now asks for `labelVariant="control"`
— the 11/700/uppercase metrics `FieldShell` carried, verbatim. This ends the label-metric split
between `Field` and `FieldShell` that caused several defects this campaign.

The swap replaces the label implementation under six live portals, so it is guarded by a dedicated
test (`fieldShellRetirement.test.tsx`) asserting the voice, the absence of `Field`'s 16px form
rhythm, the per-kind reflow rules and the caller-override precedence. Removing `labelVariant`
fails two of its five assertions — verified, not assumed.

### i18n manifests are untouched

`FILTERS_I18N` and `TABLE_I18N` are unchanged, and every portal guard that binds to them keeps
working. `ui-forms` never calls `t`, so the one field that resolved an i18n key —
`SelectField`'s `FILTERS_I18N.selectTriggerLabel` accessible name — composes that string HERE, in
the adapter, and passes the finished value down as `accessibilityLabel`. The i18n stayed with the
package that owns the keys.

### Notes

- New peer dependency: `@dloizides/ui-forms >= 1.8.0`, plus `@dloizides/ui-buttons >= 1.4.0`
  inherited through it (`ui-forms` bundles `FormActions`). All five portals consuming `ui-tables`
  already declare `ui-buttons ^1.4.0`, so this is a declaration of existing reality, not a new
  requirement.
- `FilterOption` and `DateRangeValue` are now ALIASES of `ui-forms`' `ControlOption` /
  `DateRangeValue`. Public names unchanged; one definition instead of two structurally-identical
  twins free to drift.
- `DEFAULT_TYPEAHEAD_MIN_CHARS` / `DEFAULT_TYPEAHEAD_MAX_SUGGESTIONS` and `suggestOptions` /
  `isUnmatched` are re-exported from `ui-forms`. Public API unchanged.
- Inherits the `AnchoredMenu` WCAG fix from `ui-forms` 1.8.0: the selected option now carries
  `aria-selected`. `accessibilityState` is native-only and react-native-web ignores it, so on web
  the current option had been conveyed by colour and font-weight alone (WCAG 1.4.1).
- `AnchoredMenu` remains one of three near-identical anchored-menu implementations, with
  `ui-layout`'s `InlineMenu` and this package's `SizeDropdown`. Collapsing them was out of scope.
  The move makes it EASIER: two of the three now sit in packages that may depend on `ui-forms`, so
  a future collapse has an obvious home rather than needing a new shared package first.

## 1.13.0

De-fork wave W1.1: pagination logic promoted from the byte-identical `PaginatedList`
twins in erevna-web and katalogos-web.

### Added

- `usePagedRows(rows, { pageSize })` — client-side pagination state for an already
  in-memory array. Returns `pageRows`, `currentPage`, `totalPages`, `setPage`,
  `hasPages`, `pageSize`. No new translation keys; no action required.

Promoted as a **hook, not a component**, deliberately: the app-side `PaginatedList`
hard-bound a `FlatList` plus app-specific empty and loading states. Only the paging
maths is genuinely shared, so only that moved — callers keep their own list renderer.
For server-side paging keep using `DataTable`'s pager.

### Fixed (behaviour differs from the app-side original)

- The original only clamped the page index when `totalPages > 0`, so emptying the list
  left a stale non-zero page behind and the next non-empty render started on the wrong
  page. `usePagedRows` clamps to 0 in that case.
- A `pageSize` of 0 divided by zero (`Math.ceil(n / 0)` → `Infinity` pages). Now floored
  to 1.
- `setPage` clamps out-of-range input; the original trusted the caller.

## 1.12.0

Accessibility fix: controls that announced a **bare number** now say what they are. Confirmed in
a real browser, the rows-per-page trigger rendered `aria-label="50"` — a screen-reader user heard
the value and nothing about the control. Fixed across the whole package, plus two more instances
of the same defect class found while auditing.

### ⚠️ ACTION REQUIRED — add three translation keys

The new accessible names are user-facing strings, so they come from the host app's locale files.
**Every consuming app must add these three keys:**

| Key | Params | Suggested English |
|---|---|---|
| `uiTables.pager.rowsTriggerLabel` | `{{p1}}` = current page size | `Rows per page, currently {{p1}}` |
| `uiTables.pager.rowsOptionLabel` | `{{p1}}` = that option's size | `Show {{p1}} rows per page` |
| `uiTables.filters.selectTriggerLabel` | `{{p1}}` = field label, `{{p2}}` = selection | `{{p1}}: {{p2}}` |

They are exported as `TABLE_I18N.pagerRowsTriggerLabel`, `TABLE_I18N.pagerRowsOptionLabel` and
`FILTERS_I18N.selectTriggerLabel`, so an app that derives its required-key list from those maps
(as zygos' guard test does) picks them up automatically.

**Upgrading without adding them is safe.** Unlike the usual kit contract — where an undefined key
renders as its literal dotted name, the failure that put 44 raw keys on screen in zygos — a
newly-introduced ACCESSIBLE-NAME key degrades to the value it replaced (the bare number, the field
label). An aria-label is invisible to sighted reviewers, so a raw key there would ship silently and
hurt only screen-reader users. Until you add the keys you simply keep the old, worse names.

### Fixed

- **`Pager` rows-per-page trigger** (`dropdown` variant) — was `aria-label="50"`, now
  "Rows per page, currently 50".
- **`Pager` rows-per-page options** (`dropdown` variant) — was `aria-label="100"`, now
  "Show 100 rows per page".
- **`Pager` rows-per-page pills** (the **DEFAULT** `pills` variant) — carried the identical
  bare-number defect and was NOT in the original report, so it affected more consumers than the
  dropdown did. Same fix, same key.
- **`Filters` select trigger** — `accessibilityLabel` replaces the trigger's visible text for a
  screen reader, so labelling it `field.label` alone silently hid the current selection: sighted
  users saw "Closed", screen-reader users heard only "Status". Now "Status: Closed".
- **`StatCard`** — its two translation keys were string literals inlined in the component rather
  than members of an exported map, so an app deriving its required-key list from `TABLE_I18N`
  could not see them and would render them raw. Now exported as `TABLE_I18N.statCardLabel` /
  `TABLE_I18N.statHint`. **The key strings are unchanged** (`analytics.statCardLabel`,
  `analytics.statHint`) — renaming them would have broken every app that already defines them.

### Added

- **`accessibleName(translated, key, fallback)`** — the internal degradation guard described
  above. Not exported; the kit's fallback-free i18n contract is unchanged for visible copy.

Additive and backward compatible for consumers — no public prop changed, so a MINOR bump.
`SizeDropdown`'s props gained `triggerLabel` / `getOptionLabel`, but that component is internal
(never exported from the package root).

## 1.11.0

Additive: a **declarative `Filters` bar** + **Pager** enhancements. Every change is additive and
backward compatible — existing `FilterBar` / `Pager` / `DataTable` consumers (aml-v2, agora,
zygos, kefi, erevna, katalogos) are untouched and every new prop is optional, so a MINOR bump.
No app is migrated by this release; adoption is a later wave (see `ADOPTION.md`).

- **`Filters`** — the declarative, configurable filter bar built ON the existing `FilterBar`
  shell (reusing its live results count + WCAG live region + actions slot). A caller passes a
  `fields` schema — the SUPERSET harvested from every portal's hand-rolled filters — of kinds
  `select` / `text` / `number` / `dateRange` / `typeahead` / `boolean`, plus a value map and
  `onChange`. Two value models: **LIVE** (edits apply immediately — agora, zygos) and
  **DRAFT/APPLY** (edits accumulate in a draft, an Apply button + Enter-in-a-field commit it —
  aml, kefi audit), the latter driven by the new `useFilterDraft` hook. Customisation is style
  (theme) + slots only: every label/option/placeholder/error is a pre-localized string; no
  FM/router/store. Apps can inject `@dloizides/ui-layout`'s `ModalDropdown` for the `select`
  field via `renderSelect` (the in-tree dropdown is the dependency-free default).
- **`useFilterDraft`** — the draft-vs-applied state engine (draft + committed + `apply` / `reset`
  / `setField` / `dirty`), with `onApply` / `onReset` callbacks the caller wires to `setPage(1)`
  (the universal reset-to-page-1-on-narrowing invariant, kept free of pagination coupling).
- **`suggestOptions` / `isUnmatched`** — the ranked substring matcher behind the `typeahead`
  field (generalized from aml's `suggestCountries`), exported for reuse.
- **`Pager`** — three additive props reconciling the variants across apps: `showFirstLast`
  (First/Last jump buttons, disabled at bounds — erevna's `PaginationControls`),
  `unitLabelSingular` (renders `1 result` when `total === 1` — the singularisation apps did in
  the FilterBar noun), and `responsive` + `stackBreakpoint` (collapse to a compact
  Prev/Next-only nav below the breakpoint — the mobile fallback, mirroring the DataTable
  card-stack). New pager test ids `ui-pager-first` / `ui-pager-last`.

## 1.10.0

Additive: **bulk-select** + **keyboard navigation** on `DataTable` (ZY-08). Every new prop is
optional and CONTROLLED — omit them all and the table renders exactly as it did on 1.9.2, so
erevna / katalogos / kefi / agora are unaffected. Hence a MINOR bump.

- **Bulk-select** — `selectedRowKeys` + `onSelectionChange` add a checkbox gutter to the
  header and every row. Controlled, following the `expandedRowKeys` precedent exactly: the
  table keeps no internal selection state, and `onSelectionChange` is the enabler (as
  `renderRowDetail` is for expansion). The header checkbox is genuinely tri-state
  (`accessibilityState.checked: 'mixed'` + `aria-checked="mixed"`), and only ever adds or
  removes keys belonging to the CURRENT page — off-page keys the caller holds are preserved,
  because the table must not drop a selection it cannot see.
- **Select all matching the filter — a FLAG, never an id list.** `matchingCount` +
  `onSelectAllMatchingChange` add a banner once the page is fully selected and more rows
  match. It emits `true`/`false`; the table never enumerates the matching rows (they are on
  pages it never fetched, and the ZY-02 spike measured ~2–3 ms and ~16 DOM nodes per row, so
  materialising thousands of them is indistinguishable from an outage). Toggling a single row
  under the flag drops it — the operator is no longer acting on *the filter*.
- **Keyboard navigation** — `keyboardNavigation` (default **off**, because giving rows a
  `tabIndex` changes a page's tab order) implements the ARIA grid **roving tabindex**: one tab
  stop for the whole grid, ↑/↓ to move (clamped, never wrapping), Home/End, Space to toggle
  selection, Enter to activate via the existing `onRowPress`. Keys the table does not handle
  are never `preventDefault`ed, so Tab and browser shortcuts keep working. When the page
  changes underneath it the tab stop re-homes onto the new first row rather than vanishing —
  without that guard the grid would become keyboard-unreachable the moment an operator paged.
  Web-only in effect (focus movement and key events are DOM concerns); inert on native, via
  the same deliberate split as the `position: 'sticky'` header.
- **a11y** — `role="grid"` / `row` / `columnheader` / `cell` when navigable; `aria-selected`
  on rows when selectable; row checkboxes are labelled with the ROW's name, so they announce
  as "Instruction ABC, checkbox" rather than an anonymous "checkbox" repeated down the page.
- **🔴 A selectable row's checkbox sits OUTSIDE its pressable area** — a sibling, never a
  descendant. A checkbox nested inside an interactive row's `Pressable` is precisely the shape
  the 1.9.2 fix identified as broken: the row's pointer responders CAPTURE the gesture and
  cancel the child's press, so the checkbox would pass a synthetic `element.click()` test and
  silently do nothing under a real mouse, touch or Playwright click. A selectable row is now a
  plain `<View>` frame holding the checkbox and a separate pressable content area.
- New exports: `rowSelectTestID(tableTestID, key)`, `selectAllTestID(tableTestID)`, the
  `uiTables.select.*` keys on `TABLE_I18N`, and the `selectCell` / `selectBanner`
  `styleOverrides` slots. No existing export changed.
- Internals split for clarity as the row grew three shapes: `DataTableRow`, `TableRow`,
  `TableHeader`, `RowCells`, plus pure `selection.ts` / `rowNav.ts` rule modules and the
  `useTableSelection` / `useRovingFocus` hooks. No behaviour change for existing consumers
  (the full 1.9.2 suite passes untouched).

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
