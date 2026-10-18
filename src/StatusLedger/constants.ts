import { StatusTone } from './StatusTone';

export const STATUS_LEDGER_TEST_ID = 'ui-status-ledger';
export const STATUS_COLUMN_KEY = 'status';
export const ACTIONS_COLUMN_KEY = 'actions';
export const ALL_VALUE = '';
export const STATUS_MIN_WIDTH = 120;
export const ACTIONS_MIN_WIDTH = 136;

export const TONE_RANK: Readonly<Record<StatusTone, number>> = {
  [StatusTone.Bad]: 0,
  [StatusTone.Warn]: 1,
  [StatusTone.Active]: 2,
  [StatusTone.Neutral]: 3,
  [StatusTone.Good]: 4,
};

export const TONE_GLYPH: Readonly<Record<StatusTone, string>> = {
  [StatusTone.Bad]: '✕',
  [StatusTone.Warn]: '!',
  [StatusTone.Active]: '▸',
  [StatusTone.Neutral]: '–',
  [StatusTone.Good]: '✓',
};

export const ledgerSectionTestID = (testID: string, section: string): string => `${testID}-section-${section}`;
export const ledgerSortDirectionTestID = (testID: string): string => `${testID}-sort-direction`;
