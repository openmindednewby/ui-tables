# Changelog

## 1.1.0 (unreleased)

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
