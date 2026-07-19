/**
 * F2 regression guard — the bar's label after `FieldShell` was deleted.
 *
 * `FieldShell` was a PRIVATE fork of the label row that existed only because `@dloizides/ui-forms`'
 * `Field` hard-coded the 13/600 `field` voice. `Field` now names both contract voices, so the fork
 * is gone and the bar asks for `labelVariant="control"`.
 *
 * That swap is the riskiest part of the move: it replaces the label implementation under six live
 * portals. These assert the two things that would silently change if it were done wrong — the
 * label VOICE (11/700/uppercase, the fork's exact metrics) and the absence of `Field`'s 16px form
 * rhythm, which `FieldShell` never had and which would add a phantom gap under every filter.
 */
import { render, screen } from '@testing-library/react';

import { UiProvider, type UiTheme } from '@dloizides/ui-feedback';

import { Filters } from './Filters';
import { FILTERS_TEST_ID, fieldTestID } from './constants';
import type { FilterField, FilterValues } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#4f46e5' } },
  semantic: { error: { '500': '#dc2626' } },
};

const FIELDS: readonly FilterField[] = [
  { key: 'q', kind: 'text', label: 'Search', grow: true },
  { key: 'status', kind: 'select', label: 'Status', options: [{ label: 'Open', value: 'open' }] },
];
const EMPTY: FilterValues = { q: '', status: '' };

function renderBar(fields: readonly FilterField[] = FIELDS): void {
  render(
    <UiProvider theme={theme} t={(key) => key}>
      <Filters fields={fields} values={EMPTY} onChange={() => undefined} />
    </UiProvider>,
  );
}

/** The rendered style of the label element inside a field wrapper. */
function labelStyleOf(key: string): CSSStyleDeclaration {
  const wrapper = screen.getByTestId(fieldTestID(FILTERS_TEST_ID, key));
  const label = wrapper.firstElementChild;
  if (label === null) throw new Error(`no label rendered for field ${key}`);
  return window.getComputedStyle(label);
}

describe('F2 — the label still speaks the CONTROL voice after FieldShell was deleted', () => {
  it('renders the label uppercase at 11px / 700, the fork metrics verbatim', () => {
    renderBar();
    const style = labelStyleOf('q');
    expect(style.fontSize).toBe('11px');
    expect(style.fontWeight).toBe('700');
    expect(style.textTransform).toBe('uppercase');
  });

  it('does NOT fall back to the 13/600 `field` voice', () => {
    // The failure mode if `labelVariant` were dropped: `Field` silently defaults to `field`,
    // and every filter label across six portals grows two points and loses its uppercase —
    // a change no type error and no snapshot-free test would catch.
    renderBar();
    const style = labelStyleOf('status');
    expect(style.fontSize).not.toBe('13px');
    expect(style.fontWeight).not.toBe('600');
  });

  it('carries NO 16px form rhythm — the bar spaces via FilterBar, not per-field margins', () => {
    renderBar();
    const wrapper = screen.getByTestId(fieldTestID(FILTERS_TEST_ID, 'q'));
    expect(window.getComputedStyle(wrapper).marginBottom).toBe('0px');
  });

  it('still applies the per-field grow and minWidth reflow rules FieldShell owned', () => {
    renderBar();
    const grown = window.getComputedStyle(screen.getByTestId(fieldTestID(FILTERS_TEST_ID, 'q')));
    const plain = window.getComputedStyle(screen.getByTestId(fieldTestID(FILTERS_TEST_ID, 'status')));
    expect(grown.flexGrow).toBe('1');
    expect(grown.minWidth).toBe('200px');
    // select's default min-width differs from text's — proof the per-kind table is still read.
    expect(plain.minWidth).toBe('150px');
  });

  it('lets a caller style override win, applied LAST', () => {
    renderBar([{ key: 'q', kind: 'text', label: 'Search', minWidth: 999, style: { minWidth: 42 } }]);
    expect(window.getComputedStyle(screen.getByTestId(fieldTestID(FILTERS_TEST_ID, 'q'))).minWidth).toBe('42px');
  });
});
