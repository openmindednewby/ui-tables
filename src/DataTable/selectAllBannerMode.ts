/**
 * What the select-all-matching banner is currently saying.
 *
 * The banner is the ONLY place the table admits that rows exist beyond the current page,
 * and it never enumerates them: `Offer`/`Active` trade in a COUNT and a FLAG. See
 * `resolveSelectAllBannerMode`.
 *
 * INTERNAL — not re-exported from `src/index.ts` (see `headerCheckboxState.ts`).
 */
export const enum SelectAllBannerMode {
  /** Nothing to offer — the page is not fully selected, or the filter fits on one page. */
  Hidden = 'hidden',
  /** The whole page is selected and MORE rows match the filter → offer the flag. */
  Offer = 'offer',
  /** The flag is set: every row matching the filter is selected, on every page. */
  Active = 'active',
}
