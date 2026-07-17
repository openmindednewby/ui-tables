/**
 * Shared StyleSheet for the declarative Filters bar. Colours are applied inline from
 * `useUi().theme` at render — nothing here carries a colour literal. The field/label/input
 * metrics reconcile the per-field styles that were copy-pasted across aml-v2's filter files
 * (`field`, `fieldGrow`, `label`, `input`) into one shared source.
 */
import { StyleSheet } from 'react-native';

const FIELD_GAP = 4;
const LABEL_FONT = 11;
const LABEL_LETTER_SPACING = 0.4;
const INPUT_RADIUS = 8;
const INPUT_PAD_H = 12;
const INPUT_PAD_V = 10;
const INPUT_FONT = 14;
const INPUT_BORDER = 1;
const DATE_ROW_GAP = 8;
const CHEVRON_FONT = 10;
const MENU_TOP_GAP = 4;
const MENU_RADIUS = 8;
const MENU_PAD_V = 4;
const MENU_OPT_PAD_H = 12;
const MENU_OPT_PAD_V = 8;
const MENU_MIN_WIDTH = 160;
const MENU_MAX_HEIGHT = 260;
const MENU_Z = 1000;
const MENU_ELEVATION = 8;
const MENU_BOX_SHADOW = '0px 2px 8px rgba(0, 0, 0, 0.15)';
const OPTION_FONT = 14;
const ERROR_FONT = 12;
const ERROR_GAP = 3;
const SWITCH_ROW_GAP = 8;
const ACTION_PAD_H = 14;
const ACTION_PAD_V = 8;
const ACTION_RADIUS = 8;
const ACTION_FONT = 13;

export const filterStyles = StyleSheet.create({
  field: { gap: FIELD_GAP },
  label: { fontSize: LABEL_FONT, fontWeight: '700', letterSpacing: LABEL_LETTER_SPACING, textTransform: 'uppercase' },
  input: {
    borderWidth: INPUT_BORDER,
    borderRadius: INPUT_RADIUS,
    paddingHorizontal: INPUT_PAD_H,
    paddingVertical: INPUT_PAD_V,
    fontSize: INPUT_FONT,
  },
  /** The select trigger: a bordered field box matching the text inputs + a chevron. */
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: DATE_ROW_GAP,
    borderWidth: INPUT_BORDER,
    borderRadius: INPUT_RADIUS,
    paddingHorizontal: INPUT_PAD_H,
    paddingVertical: INPUT_PAD_V,
  },
  selectTriggerText: { fontSize: INPUT_FONT, flexShrink: 1 },
  chevron: { fontSize: CHEVRON_FONT },
  dateRow: { flexDirection: 'row', gap: DATE_ROW_GAP },
  dateCol: { gap: FIELD_GAP, flex: 1 },
  subLabel: { fontSize: LABEL_FONT, letterSpacing: LABEL_LETTER_SPACING },
  anchor: { position: 'relative' },
  menu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: MENU_TOP_GAP,
    minWidth: MENU_MIN_WIDTH,
    maxHeight: MENU_MAX_HEIGHT,
    borderWidth: INPUT_BORDER,
    borderRadius: MENU_RADIUS,
    paddingVertical: MENU_PAD_V,
    zIndex: MENU_Z,
    boxShadow: MENU_BOX_SHADOW,
    elevation: MENU_ELEVATION,
    overflow: 'hidden',
  },
  option: { paddingHorizontal: MENU_OPT_PAD_H, paddingVertical: MENU_OPT_PAD_V },
  optionText: { fontSize: OPTION_FONT },
  error: { fontSize: ERROR_FONT, marginTop: ERROR_GAP },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: SWITCH_ROW_GAP, paddingVertical: FIELD_GAP },
  action: { paddingHorizontal: ACTION_PAD_H, paddingVertical: ACTION_PAD_V, borderRadius: ACTION_RADIUS, borderWidth: INPUT_BORDER },
  actionText: { fontSize: ACTION_FONT, fontWeight: '600' },
});

/** Touch-target growth toward WCAG ≥44px without changing rendered size (vertical only). */
export const FILTER_HIT_SLOP = { top: 8, bottom: 8 } as const;
