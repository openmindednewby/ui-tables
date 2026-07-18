/**
 * Accessible NAMES — the defect these lock down: several controls were labelled with a bare
 * number, so a screen reader announced "50" and never said what the control was or did.
 *
 * These are not rendering tests. Each asserts a specific PROPERTY of the accessible name:
 * that it is not the bare value, that it CAME FROM the host's translation map (swap the
 * language, the name changes), and that an untranslated key degrades to the old value rather
 * than leaking a raw dotted key at a screen-reader user.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { Pager } from './Pager';
import { TABLE_I18N, TABLE_TEST_IDS } from './constants';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#4f46e5' } },
  semantic: { error: { '500': '#dc2626' } },
};

/** English map, as a host app's FM would supply it. */
const EN: Record<string, string> = {
  [TABLE_I18N.pagerInfo]: 'of',
  [TABLE_I18N.pagerPrev]: 'Prev',
  [TABLE_I18N.pagerNext]: 'Next',
  [TABLE_I18N.pagerRows]: 'Rows',
  [TABLE_I18N.pagerRowsTriggerLabel]: 'Rows per page, currently {{p1}}',
  [TABLE_I18N.pagerRowsOptionLabel]: 'Show {{p1}} rows per page',
};

/** Greek map — proves the name is TRANSLATED, not an English literal baked into the kit. */
const EL: Record<string, string> = {
  ...EN,
  [TABLE_I18N.pagerRowsTriggerLabel]: 'Γραμμές ανά σελίδα, τώρα {{p1}}',
  [TABLE_I18N.pagerRowsOptionLabel]: 'Εμφάνιση {{p1}} γραμμών ανά σελίδα',
};

/** Mirrors the apps' `FM(key, p1, p2, p3)`: interpolates placeholders, NO fallback. */
function makeT(map: Record<string, string>): UiValue['t'] {
  return (key, p1, p2, p3) => {
    const template = map[key];
    if (template === undefined) return key;
    return template
      .replace('{{p1}}', p1 ?? '')
      .replace('{{p2}}', p2 ?? '')
      .replace('{{p3}}', p3 ?? '');
  };
}

function renderPager(ui: React.ReactElement, map: Record<string, string> = EN): ReturnType<typeof render> {
  return render(<UiProvider theme={theme} t={makeT(map)}>{ui}</UiProvider>);
}

const noop = (): void => undefined;

function pager(props: Partial<React.ComponentProps<typeof Pager>> = {}): React.ReactElement {
  return <Pager page={1} pageSize={50} total={500} onPageChange={noop} onPageSizeChange={noop} {...props} />;
}

function labelOf(testID: string): string {
  return screen.getByTestId(testID).getAttribute('aria-label') ?? '';
}

describe('rows-per-page trigger (dropdown variant) — accessible name', () => {
  it('is not the bare page-size number', () => {
    renderPager(pager({ rowsVariant: 'dropdown' }));
    // The regression: aria-label="50" — a value with no indication of what it controls.
    expect(labelOf(`${TABLE_TEST_IDS.pager}-size-trigger`)).not.toBe('50');
  });

  it('names the control AND reports the current value', () => {
    renderPager(pager({ rowsVariant: 'dropdown' }));
    expect(labelOf(`${TABLE_TEST_IDS.pager}-size-trigger`)).toBe('Rows per page, currently 50');
  });

  it('tracks the current page size', () => {
    renderPager(pager({ rowsVariant: 'dropdown', pageSize: 200 }));
    expect(labelOf(`${TABLE_TEST_IDS.pager}-size-trigger`)).toBe('Rows per page, currently 200');
  });

  it('comes from the host translation map, not a hardcoded English string', () => {
    renderPager(pager({ rowsVariant: 'dropdown' }), EL);
    expect(labelOf(`${TABLE_TEST_IDS.pager}-size-trigger`)).toBe('Γραμμές ανά σελίδα, τώρα 50');
  });
});

describe('rows-per-page options (dropdown variant) — accessible name', () => {
  it('names each option instead of announcing a bare number', () => {
    renderPager(pager({ rowsVariant: 'dropdown' }));
    fireEvent.click(screen.getByTestId(`${TABLE_TEST_IDS.pager}-size-trigger`));
    expect(labelOf(`${TABLE_TEST_IDS.pager}-size-100`)).toBe('Show 100 rows per page');
    expect(labelOf(`${TABLE_TEST_IDS.pager}-size-100`)).not.toBe('100');
  });

  it('localizes every option', () => {
    renderPager(pager({ rowsVariant: 'dropdown' }), EL);
    fireEvent.click(screen.getByTestId(`${TABLE_TEST_IDS.pager}-size-trigger`));
    expect(labelOf(`${TABLE_TEST_IDS.pager}-size-25`)).toBe('Εμφάνιση 25 γραμμών ανά σελίδα');
  });
});

describe('rows-per-page pills (the DEFAULT variant) — accessible name', () => {
  // Not in the original report: the default `pills` variant carried the identical
  // bare-number defect, so it affects MORE consumers than the dropdown does.
  it('names each pill instead of announcing a bare number', () => {
    renderPager(pager());
    expect(labelOf(`${TABLE_TEST_IDS.pager}-size-100`)).toBe('Show 100 rows per page');
    expect(labelOf(`${TABLE_TEST_IDS.pager}-size-100`)).not.toBe('100');
  });

  it('localizes every pill', () => {
    renderPager(pager(), EL);
    expect(labelOf(`${TABLE_TEST_IDS.pager}-size-25`)).toBe('Εμφάνιση 25 γραμμών ανά σελίδα');
  });
});

describe('a host that has not yet defined the new keys', () => {
  // The Zygos failure mode: an undefined key renders as its literal dotted name. For an
  // invisible aria-label that ships silently and only screen-reader users are hurt, so a
  // NEW key must degrade to the value it replaced, not to the key.
  const LEGACY: Record<string, string> = {
    [TABLE_I18N.pagerInfo]: 'of',
    [TABLE_I18N.pagerRows]: 'Rows',
  };

  it('never leaks the raw dotted key into the trigger name', () => {
    renderPager(pager({ rowsVariant: 'dropdown' }), LEGACY);
    expect(labelOf(`${TABLE_TEST_IDS.pager}-size-trigger`)).not.toContain('uiTables.');
  });

  it('degrades the trigger to the prior bare number rather than regressing', () => {
    renderPager(pager({ rowsVariant: 'dropdown' }), LEGACY);
    expect(labelOf(`${TABLE_TEST_IDS.pager}-size-trigger`)).toBe('50');
  });

  it('degrades the pills to the prior bare number rather than regressing', () => {
    renderPager(pager(), LEGACY);
    expect(labelOf(`${TABLE_TEST_IDS.pager}-size-100`)).toBe('100');
    expect(labelOf(`${TABLE_TEST_IDS.pager}-size-100`)).not.toContain('uiTables.');
  });
});
