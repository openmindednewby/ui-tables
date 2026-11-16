import { DurationUnit } from '../DurationUnit';
import { toEpochMs, type TimeInput } from './relativeTime';

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MS_PER_MINUTE = MS_PER_SECOND * SECONDS_PER_MINUTE;
const MS_PER_HOUR = MS_PER_MINUTE * MINUTES_PER_HOUR;
const MS_PER_DAY = MS_PER_HOUR * HOURS_PER_DAY;
const TOKEN = /\{\{(\w+)\}\}/g;

/** Caller-translated templates; `{{n}}` is replaced by the count, e.g. "{{n}} h". */
export interface DurationStrings {
  unknown: string;
  lessThanMinute: string;
  minutes: string;
  hours: string;
  days: string;
}

/** Replaces every `{{key}}` in the template with its value; unknown keys stay as written. */
export function fillTemplate(template: string, values: Readonly<Record<string, string | undefined>>): string {
  return template.replace(TOKEN, (whole: string, key: string) => values[key] ?? whole);
}

const fillCount = (template: string, count: number): string => fillTemplate(template, { n: String(count) });

/** Milliseconds from `start` to `nowMs`, never negative; `null` when the start is missing. */
export function elapsedMs(start: TimeInput, nowMs: number): number | null {
  const ms = toEpochMs(start);
  return ms === null ? null : Math.max(0, nowMs - ms);
}

/** One duration format for ages and waiting times: minutes, then hours, then days, capped at `largestUnit`. */
export function formatDuration(durationMs: number | null, strings: DurationStrings, largestUnit: DurationUnit = DurationUnit.Day): string {
  if (durationMs === null) return strings.unknown;
  if (durationMs < MS_PER_MINUTE) return strings.lessThanMinute;
  const inMinutes = largestUnit === DurationUnit.Minute || durationMs < MS_PER_HOUR;
  if (inMinutes) return fillCount(strings.minutes, Math.floor(durationMs / MS_PER_MINUTE));
  const inHours = largestUnit === DurationUnit.Hour || durationMs < MS_PER_DAY;
  if (inHours) return fillCount(strings.hours, Math.floor(durationMs / MS_PER_HOUR));
  return fillCount(strings.days, Math.floor(durationMs / MS_PER_DAY));
}

/** Share of `limitMs` an age has used, clamped to 0..1; a missing age is 0, a non-positive limit is 1. */
export function ageFraction(ageMs: number | null, limitMs: number): number {
  if (ageMs === null) return 0;
  if (limitMs <= 0) return 1;
  return Math.min(1, Math.max(0, ageMs / limitMs));
}
