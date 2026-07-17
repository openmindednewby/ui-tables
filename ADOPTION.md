# Adopting the shared `Filters` + `Pager` (migration wave)

`@dloizides/ui-tables@1.11.0` ships the declarative **`Filters`** bar, the **`useFilterDraft`**
state engine, and additive **`Pager`** props (`showFirstLast`, `unitLabelSingular`, `responsive`).
This doc maps each portal's CURRENT hand-rolled filters + pagination onto the shared API so a
follow-up wave can migrate them one screen at a time. **Nothing here is done yet** — this release
delivers the package + tests only; adoption is deliberately separate to avoid colliding with other
agents' in-flight work.

Everything is additive and backward compatible: existing `FilterBar` / `Pager` / `DataTable`
usage is unchanged. Adopt `Filters` screen-by-screen; there is no big-bang cutover.

---

## The shared API in one screen

```tsx
import { Filters, useFilterDraft, Pager, type FilterField, type FilterValues } from '@dloizides/ui-tables';
```

- **`Filters`** renders a `fields: FilterField[]` schema into the `FilterBar` shell.
- **Field kinds**: `select`, `text`, `number`, `dateRange`, `typeahead`, `boolean`.
- **Value map** `FilterValues = Record<string, string | boolean | { from; to }>`, keyed by `field.key`.
- **Value model** is chosen by whether you pass `onApply`:
  - no `onApply` → **LIVE** (each edit calls `onChange`).
  - `onApply` set → **DRAFT/APPLY** (Apply button + Enter-in-a-field commit; pass `onClear` for Reset).
- **`useFilterDraft({ initial, onApply, onReset })`** is the draft engine — wire `onApply`/`onReset` to `setPage(1)`.
- Every user-facing string is a **pre-localized** value you pass in (labels, option labels, placeholders, errors).

---

## aml-v2 — cases / leaders / peps  (DRAFT/APPLY; the richest filter set)

Today: `CasesFilters` / `LeadersFilters` / `PepsFilters` render `<Text label>` + a per-field
control (ModalDropdown / ThemedTextInput / DateField / CountryPicker / FormSwitch); each host
holds `draft` + `committed` + `page` + `pageSize`, commits on Apply, resets page to 1.

Map onto the shared API:

| aml field | current control | → `FilterField` kind |
|---|---|---|
| `decision` / `reviewStatus` / `source` / `riskBand` / `isMatch` / `role` / `status` / `category` | `ModalDropdown` (leading "Any", value `''`) | `select` (options with a leading `{ label: FM('..any'), value: '' }`) |
| `q` | `ThemedTextInput`, submit → apply | `text` (`grow: true`) |
| `yearFrom` / `yearTo` | `ThemedTextInput keyboardType="numeric"` | `number` |
| `from` / `to` | `DateField` (native `<input type=date>`) | one `dateRange` field `{ key: 'dates' }` |
| `country` | `CountryPicker` (bespoke typeahead) | `typeahead` (`options: countryOptions, minChars: 1`) |
| `includeRelatives` / `prioritize` | `FormSwitch` | `boolean` |

- Replace the twin `draft`/`committed` `useState`s with `useFilterDraft({ initial: EMPTY, onApply: () => setPage(1), onReset: () => { setPage(1); clearCountryError(); } })`.
- `values={draft.draft}`, `onChange={draft.setDraft}`, `onApply={draft.apply}`, `onClear={draft.reset}` (leaders/peps have Reset; cases did not — omit `onClear` there).
- `applyDisabled={busy}` (aml disables Apply while loading).
- Export CSV/PDF buttons → the `actions` slot; keep operating on `draft.committed`.
- Country validation → set the field's `error` (pre-localized `FM('leaders.error.unrecognisedCountry')`); the `typeahead` renders the persistent `role="alert"` banner. Use the exported `isUnmatched(countryOptions, text)` to detect an unrecognised entry, or keep aml's `codeOf`.
- Results count: keep passing `resultsCount` + `resultsLabel` (aml already singularises the noun caller-side — `resultOne`/`resultMany`).
- **Select rendering**: to keep aml's exact ModalDropdown UX (responsive modal on mobile), pass `renderSelect={({ field, value, onChange, testID }) => <ModalDropdown … />}`. Otherwise use the built-in in-tree dropdown.
- Pager is already the shared `Pager` (rowsVariant="dropdown"); no change needed. Optionally add `unitLabelSingular` now that it exists.

---

## kefi-web — audit log  (DRAFT/APPLY; the prime migration candidate)

Today: bespoke `AuditFilters` (local `draft`, Apply/Clear, date-validity gate) + bespoke
`AuditPager` (two lines: "showing X–Y of N" + "page X of N", Prev/Next only). Uses `DataTable`
already (via `KefiDataTable`) but NOT the shared `FilterBar`/`Pager`.

Map:

| audit field | current | → kind |
|---|---|---|
| `action` / `entityType` | exact-match text | `text` |
| `from` / `to` (`YYYY-MM-DD`) | two date text inputs | one `dateRange` field |

- `useFilterDraft({ initial: { action:'', entityType:'', dates:{from:'',to:''} }, onApply: () => setPage(1) })`.
- `onApply={draft.apply}` (Apply), `onClear={draft.reset}` (Clear resets draft AND committed — matches today).
- `applyDisabled={!datesValid}` — keep the `isValidDateInput` gate; keep the inline `FeedbackBanner` above (or move the message onto a field `error`).
- Convert `toQuery` to read `dates.from` / `dates.to` (was `from` / `to`).
- Replace `AuditPager` with `Pager` (`page`, `pageSize`, `total={totalCount}`, `unitLabel`, `infoPrefix={FM('common.showing')}`). The "page X of N" line is not encoded in `Pager` — either drop it (the `from–to of N` covers it) or keep a small caption alongside.

---

## zygos-web — instructions / approvals  (LIVE; the canonical model)

Today: `InstructionsFilters` renders text search + three `ModalDropdown`s; `useInstructionsQuery`
patch-merges edits (`patchFilter`) and resets to page 1 on any change. Already uses shared
`FilterBar` + `Pager` + `DataTable`.

Map (LIVE — no `onApply`):

| field | current | → kind |
|---|---|---|
| `search` | `ThemedTextInput` | `text` (`grow: true`) |
| `statuses` | `ModalDropdown` (single control emitting a 1-element list) | `select` — keep the control single; map `value` ↔ `statuses[0]` in `onChange` |
| `direction` / `currency` | `ModalDropdown` | `select` |
| `valueDateFrom`/`To`, `minAmount`/`maxAmount`, `sortBy` | latent in types, not yet rendered | add as `dateRange` / two `number` / a `select` when you surface them |

- `values` = the current filter; `onChange` = replace-then-`patchFilter` (or adapt `patchFilter` to accept the full map).
- The pinned/locked-key pattern (approvals' `APPROVALS_FILTER` + `LOCKED_KEYS`) → simply **omit** the locked field from the `fields` array for that screen (the shared bar renders exactly the fields you pass).
- `BulkApproveBar` → the `actions` slot (it already goes into `FilterBar.actions`).
- Pager already shared with `pageSizeOptions={[25,50,100]}` (API cap) + `boldNumbers` — unchanged.

---

## agora-web — products / orders  (LIVE)

Today: `ProductsFilters` (text search + category `ModalDropdown`), `OrdersFilters` (status
`ModalDropdown`); `useProductsQuery`/`useOrdersQuery` set values live and reset page to 1. Already
uses shared `FilterBar` + `Pager` + `DataTable`.

Map (LIVE):

| field | → kind |
|---|---|
| products `search` | `text` (`grow: true`) |
| products `categoryId` (sentinel `''`) | `select` |
| orders `status` (`OrderStatus \| ''`) | `select` (map `'' → undefined` in `onChange`) |

- Trivial migration: build the two/one field(s), pass `values` + `onChange`, keep `resultsCount`.
- Pager unchanged (kit defaults, pills variant).

---

## erevna-web / katalogos-web — menus / users / public menu  (LIVE)

Today: hand-rolled, using ui-tables **only for `StatCard`** — no `FilterBar`/`Pager`. Several
distinct surfaces:

- **Public-menu filter** (`useMenuFilter`): text-search-with-clear + dietary-tag multi-select
  chips. Map the search to a `text` field; the tag chips are a **multi-select** — not one of the
  six first-class kinds yet. Options for now: keep the bespoke chip row in the `actions`/children,
  OR model each tag as a `boolean` field, OR wait for a `multiSelect` kind (candidate for a
  future minor). The `hasActiveFilters` + `clearAllFilters` contract maps to `onClear`.
- **Menus admin list** (`MenuTabBar`, `MenuTabFilter` enum All/Active): a single `select`
  (`{All, Active}`) — or keep the tab bar (it is a segmented control, a different UI affordance).
- **Users list** (`TenantSelector` pills): a `select` of tenants (+ "All Users" = value `''`).
- **Generic `PaginationControls`** (first/prev/next/last, "Showing a-b of N", "p / total",
  0-based) + `PaginatedList`: replace with `Pager` using `showFirstLast`. Note `Pager` is
  **1-based** — add 1 when mapping from the 0-based `currentPage`. `unitLabelSingular` covers the
  singular the current templates lack.
- **`VersionHistoryPanel`** "Load More": `Pager` does not do load-more; keep it bespoke, or
  switch that panel to page-based `Pager`.
- **`BillingHistoryTable`** (server prev/next-only + mobile horizontal-scroll): `Pager` without
  `showFirstLast`; the DataTable card-stack replaces the manual `minWidth:500` scroll wrapper.

---

## Not yet first-class (candidates for a future minor)

Surfaced by the harvest but intentionally out of the initial six kinds — add on real second use:

- **`multiSelect`** — zygos `statuses` (list-shaped), erevna dietary-tag chips, katalogos tags.
- **`sort`** control — zygos `sortBy` + `sortDescending` (in types, no UI yet).
- **Load-more / infinite pager** — erevna `VersionHistoryPanel` (only one consumer).
- **"page X of N" position line** — kefi audit's second pager line (the `from–to of N` covers it).

---

## Pager prop cheatsheet (new in 1.11.0)

| Prop | Effect | Adopt where |
|---|---|---|
| `showFirstLast` | First/Last jump buttons (disabled at bounds) | erevna `PaginationControls`, any large dataset |
| `unitLabelSingular` | `1 result` when `total === 1` | anywhere a unit noun is shown |
| `responsive` + `stackBreakpoint` | compact Prev/Next-only nav below the breakpoint | mobile / narrow surfaces |
