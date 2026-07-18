import { accessibleName } from './accessibleName';

describe('accessibleName', () => {
  it('uses the translation when the host has defined the key', () => {
    expect(accessibleName('Rows per page, currently 50', 'uiTables.pager.rowsTriggerLabel', '50'))
      .toBe('Rows per page, currently 50');
  });

  it('falls back when `t` echoed the key back (the host has not defined it)', () => {
    const key = 'uiTables.pager.rowsTriggerLabel';
    expect(accessibleName(key, key, '50')).toBe('50');
  });

  it('falls back on an empty translation', () => {
    expect(accessibleName('', 'uiTables.pager.rowsTriggerLabel', '50')).toBe('50');
  });

  it('keeps a translation that merely CONTAINS the key', () => {
    // Only an exact echo means "undefined"; a real string mentioning the key is still a name.
    const key = 'uiTables.pager.rowsTriggerLabel';
    expect(accessibleName(`prefix ${key}`, key, '50')).toBe(`prefix ${key}`);
  });
});
