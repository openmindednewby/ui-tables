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

interface BareProps {
  columns: ReadonlyArray<DataTableColumn<Person>>;
  rows: readonly Person[];
  keyExtractor: (row: Person) => string;
}
const bareTableIsAccepted: BareProps extends DataTableProps<Person> ? true : false = false;

function renderPressable(onRowPress: (row: Person) => void): void {
  render(
    <UiProvider theme={theme} t={t}>
      <DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} animateRows={false} stackBreakpoint={0} testID="grid" onRowPress={onRowPress} />
    </UiProvider>,
  );
}

describe('DataTable row action', () => {
  it('without onRowPress or rowAction, is rejected by the props type', () => {
    const accepted = bareTableIsAccepted;

    expect(accepted).toBe(false);
  });

  it('with onRowPress, renders the row as a native button so Enter and Space open it', () => {
    renderPressable(jest.fn());

    const row = screen.getByTestId(ROW_ID);

    expect(row.tagName).toBe('BUTTON');
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
