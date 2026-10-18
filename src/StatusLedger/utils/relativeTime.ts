const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MS_PER_MINUTE = MS_PER_SECOND * SECONDS_PER_MINUTE;
const MS_PER_HOUR = MS_PER_MINUTE * MINUTES_PER_HOUR;
const MS_PER_DAY = MS_PER_HOUR * HOURS_PER_DAY;
const COUNT_TOKEN = /\{\{n\}\}/g;

export type TimeInput = string | number | Date | null | undefined;

export interface RelativeUnitStrings {
  minutes: string;
  hours: string;
  days: string;
}

/** Caller-translated templates; `{{n}}` is replaced by the count, e.g. "{{n}} min ago". */
export interface RelativeTimeStrings extends RelativeUnitStrings {
  justNow: string;
  never: string;
  future?: RelativeUnitStrings;
}

/** Parses a time input to epoch ms; `null` when absent or unparseable. */
export function toEpochMs(value: TimeInput): number | null {
  if (value === null || value === undefined || value === '') return null;
  const ms = value instanceof Date ? value.getTime() : typeof value === 'number' ? value : Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

const fill = (template: string, count: number): string => template.replace(COUNT_TOKEN, String(count));

/** One relative-time format for every ledger: just now, then minutes, hours, days. */
export function formatRelativeTime(value: TimeInput, nowMs: number, strings: RelativeTimeStrings): string {
  const ms = toEpochMs(value);
  if (ms === null) return strings.never;
  const delta = nowMs - ms;
  const units: RelativeUnitStrings = delta < 0 && strings.future !== undefined ? strings.future : strings;
  const distance = Math.abs(delta);
  if (distance < MS_PER_MINUTE) return strings.justNow;
  if (distance < MS_PER_HOUR) return fill(units.minutes, Math.floor(distance / MS_PER_MINUTE));
  if (distance < MS_PER_DAY) return fill(units.hours, Math.floor(distance / MS_PER_HOUR));
  return fill(units.days, Math.floor(distance / MS_PER_DAY));
}
