import type { UiTheme } from '@dloizides/ui-feedback';

import { softBrandTint } from '../../DataTable/styles';

export interface ChipTone {
  borderColor: string;
  backgroundColor: string;
}

/** A chip with a value is brand-bordered on a soft brand tint; an unset chip is neutral on the surface. */
export function chipTone(theme: UiTheme, active: boolean): ChipTone {
  if (!active) return { borderColor: theme.colors.border, backgroundColor: theme.colors.surface };
  const brand = theme.palette.primary['500'];
  return { borderColor: brand, backgroundColor: softBrandTint(brand) ?? theme.colors.surface };
}
