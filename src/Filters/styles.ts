/**
 * Shared StyleSheet for the declarative Filters bar — the BAR's own chrome only.
 *
 * F2: the field/label/input/menu metrics that used to live here moved to
 * `@dloizides/ui-forms`' `controlStyles`, and this file imports them back rather than keeping a
 * copy. That matters: this file's previous header noted it had "reconcile[d] the per-field styles
 * that were copy-pasted across aml-v2's filter files into one shared source" — and then locked the
 * reconciliation inside one bar. Re-forking them here would recreate exactly the split the move
 * set out to close, this time between two packages instead of two apps.
 *
 * Colours are applied inline from `useUi().theme` at render — nothing here carries a colour literal.
 */
import { StyleSheet } from 'react-native';

import { controlStyles } from '@dloizides/ui-forms';

const FIELD_GAP = 4;
const SWITCH_ROW_GAP = 8;
const ACTION_PAD_H = 14;
const ACTION_PAD_V = 8;
const ACTION_RADIUS = 8;
const ACTION_FONT = 13;
const ACTION_BORDER = 1;
/** `Field` carries the 16px vertical form rhythm; a filter bar spaces via FilterBar's own gap. */
const NO_FORM_RHYTHM = 0;

export const filterStyles = StyleSheet.create({
  /**
   * Merged onto `Field`'s container inside the bar. Zeroes the 16px bottom margin `Field` gives
   * a stacked form row: the bar is a flex ROW whose spacing comes from FilterBar's `gap`, so
   * inheriting the form rhythm would add a phantom gap under every field — a pixel change for
   * six live portals, which this wave must not make.
   */
  fieldInBar: { marginBottom: NO_FORM_RHYTHM },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: SWITCH_ROW_GAP, paddingVertical: FIELD_GAP },
  action: { paddingHorizontal: ACTION_PAD_H, paddingVertical: ACTION_PAD_V, borderRadius: ACTION_RADIUS, borderWidth: ACTION_BORDER },
  actionText: { fontSize: ACTION_FONT, fontWeight: '600' },
});

/**
 * The dense-control metrics, re-exported from `@dloizides/ui-forms` so the bar's remaining
 * in-tree fields (`TextField`, `BooleanField`) use the SAME `input` / `subLabel` boxes as the
 * promoted controls rather than a second copy.
 */
export { controlStyles };

/** Touch-target growth toward WCAG ≥44px without changing rendered size (vertical only). */
export const FILTER_HIT_SLOP = { top: 8, bottom: 8 } as const;
