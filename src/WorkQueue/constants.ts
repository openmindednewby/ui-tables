export const WORK_QUEUE_TEST_ID = 'ui-work-queue';
export const AGE_COLUMN_KEY = 'age';
export const AGE_MIN_WIDTH = 88;
export const AGE_BAR_MIN_WIDTH = 200;
export const EMPTY_QUEUE_NO_ROW_ACTION = 'empty or loading work queue: there is no row to open';

export const workQueueBandTestID = (testID: string, bandKey: string): string => `${testID}-band-${bandKey}`;
export const workQueueLedgerTestID = (testID: string): string => `${testID}-ledger`;
