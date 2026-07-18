/**
 * Accessible-name resolution for keys this package introduces AFTER a host app has adopted it.
 *
 * The kit's i18n contract (see TABLE_I18N / FILTERS_I18N) is deliberately fallback-free: the
 * neutral `t` returns the KEY, and a host's `FM` has no fallback either, so a key the host has
 * not defined renders as its literal dotted name. That is the right default for VISIBLE copy —
 * it is loud, and it gets noticed and fixed.
 *
 * It is the WRONG default for an ACCESSIBLE NAME. An aria-label is invisible to sighted
 * reviewers, so an undefined key ships silently and the only people affected are screen-reader
 * users — who then hear "ui tables pager rows trigger label" instead of the bare number they
 * used to hear. That is a REGRESSION, and it is exactly the failure Zygos hit (44 undefined
 * keys rendering raw, e.g. `uiTables.filters.apply` shown literally).
 *
 * So a newly-introduced accessible-name key degrades to the value it REPLACED — the page-size
 * number, the field's own label. Those are locale-neutral data the caller already has, not
 * hardcoded English, so this does not smuggle a translation into the kit: an app that adopts
 * the key gets the good name, and an app that has not yet is no worse off than before.
 *
 * This is a MIGRATION affordance, not a licence to skip translations. Every key is still listed
 * in the exported *_I18N maps and documented in the README as required.
 */

/**
 * The translated accessible name, or `fallback` when the host has not defined `key`.
 *
 * A host that has not mapped `key` gets the key back verbatim from `t` — that, and the empty
 * string, are the two "not translated" signals.
 */
export function accessibleName(translated: string, key: string, fallback: string): string {
  const isUntranslated = translated === key || translated === '';
  return isUntranslated ? fallback : translated;
}
