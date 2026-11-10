import { fireEvent, render, screen } from '@testing-library/react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { rowTestID } from './constants';
import { DataTable } from './DataTable';
import type { DataTableColumn, DataTableProps } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#0f766e' } },
  semantic: { error: { '500': '#dc2626' } },
};
const t: UiValue['t'] = (key) => key;

interface Person {
  id: string;
  name: string;
}
const columns: ReadonlyArray<DataTableColumn<Person>> = [{ key: 'name', header: 'Name', render: (r) => r.name }];
const rows: Person[] = [{ id: 'a', name: 'Ada' }];
const ROW_ID = rowTestID('grid', 'a');

const bareProps = { columns, rows, keyExtractor: (r: Person) => r.id };
type BareIsAccepted = typeof bareProps extends DataTableProps<Person> ? true : false;
type FailsToCompileIfAccepted = BareIsAccepted extends false ? 'rejected' : never;

function pressEnterLikeABrowser(element: HTMLElement): void {
  element.focus();
  fireEvent.keyDown(element, { key: 'Enter', code: 'Enter' });
  fireEvent.click(element);
  fireEvent.keyUp(element, { key: 'Enter', code: 'Enter' });
}

function renderPressable(onRowPress: (row: Person) => void): void {
  render(
    <UiProvider theme={theme} t={t}>
      <DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} animateRows={false} stackBreakpoint={0} testID="grid" onRowPress={onRowPress} />
    </UiProvider>,
  );
}

describe('DataTable row action', () => {
  it('without onRowPress or rowAction, is rejected by the props type', () => {
    const verdict: FailsToCompileIfAccepted = 'rejected';

    expect(verdict).toBe('rejected');
  });

  it('with onRowPress, an Enter press on the focused row (keydown, native button activation, keyup) opens it once', () => {
    const onRowPress = jest.fn();
    renderPressable(onRowPress);
    const row = screen.getByTestId(ROW_ID);

    pressEnterLikeABrowser(row);

    expect(row.tagName).toBe('BUTTON');
    expect(onRowPress).toHaveBeenCalledTimes(1);
    expect(onRowPress).toHaveBeenCalledWith(rows[0]);
  });

  it('with selection and keyboard navigation, focusing the row frame draws the focus ring on the frame', () => {
    render(
      <UiProvider theme={theme} t={t}>
        <DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} animateRows={false} stackBreakpoint={0} testID="grid" keyboardNavigation onRowPress={jest.fn()} onSelectionChange={jest.fn()} selectedRowKeys={[]} />
      </UiProvider>,
    );
    const frame = screen.getByTestId(ROW_ID);

    fireEvent.focus(frame);

    expect(frame).toHaveStyle({ outlineStyle: 'solid' });
  });

  it('with onRowPress, opens the row on click', () => {
    const onRowPress = jest.fn();
    renderPressable(onRowPress);

    fireEvent.click(screen.getByTestId(ROW_ID));

    expect(onRowPress).toHaveBeenCalledWith(rows[0]);
  });

  it('with onRowPress, gives the row a pointer cursor', () => {
    renderPressable(jest.fn());

    const row = screen.getByTestId(ROW_ID);

    expect(row).toHaveStyle({ cursor: 'pointer' });
  });

  it('with rowAction none, renders a static row that is not a button', () => {
    render(
      <UiProvider theme={theme} t={t}>
        <DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} animateRows={false} stackBreakpoint={0} testID="grid" rowAction={{ none: 'read-only audit log' }} />
      </UiProvider>,
    );

    const row = screen.getByTestId(ROW_ID);

    expect(row.getAttribute('role')).not.toBe('button');
  });
});
