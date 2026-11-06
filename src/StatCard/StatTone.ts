import type { UiTheme } from '@dloizides/ui-feedback';

export const enum StatTone {
  Neutral = 'neutral',
  Error = 'error',
  Success = 'success',
}

const TONE_STEP = '700';
const FALLBACK_STEP = '500';

/** The label colour for a tone: the semantic 700 step, then 500, then textSecondary. */
export function resolveStatToneColor(theme: UiTheme, tone: StatTone): string {
  if (tone === StatTone.Neutral) return theme.colors.textSecondary;
  const scale = theme.semantic[tone] as UiTheme['semantic'][string] | undefined;
  return scale?.[TONE_STEP] ?? scale?.[FALLBACK_STEP] ?? theme.colors.textSecondary;
}
