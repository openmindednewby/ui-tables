/**
 * The smallest hit box any pressable in this package may render: 44x44 CSS px
 * (BaseClient/docs/code-standards/mobile-first.md, WCAG 2.5.5).
 *
 * The RENDERED box is the target. `hitSlop` is inert on react-native-web's `Pressable`, so it
 * cannot stand in for this — measured on ui.dloizides.com/tables, the switches rendered 40x20
 * and the pager buttons 31px tall with hitSlop set. Mirrors `@dloizides/ui-layout`'s
 * `MIN_TARGET_PX`; ui-tables does not depend on ui-layout, so the value is restated here.
 */
export const MIN_TARGET_PX = 44;
