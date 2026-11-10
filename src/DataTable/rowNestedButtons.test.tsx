import { fireEvent, render, screen } from '@testing-library/react';
import { Pressable, Text } from 'react-native';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { rowTestID } from './constants';
import { DataTable } from './DataTable';
import type { DataTableColumn } from './types';

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
const rows: Person[] = [{ id: 'a', name: 'Ada' }];
const EDIT_ID = 'edit-a';

function columnsWithEdit(onEdit: () => void): ReadonlyArray<DataTableColumn<Person>> {
  return [
    { key: 'name', header: 'Name', render: (r) => r.name },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <Pressable accessibilityHint="edit hint" accessibilityLabel="Edit" accessibilityRole="button" testID={EDIT_ID} onPress={onEdit}>
          <Text>Edit</Text>
        </Pressable>
      ),
    },
  ];
}

function renderRowWithEdit(onRowPress: (row: Person) => void, onEdit: () => void): HTMLElement {
  const { container } = render(
    <UiProvider theme={theme} t={t}>
      <DataTable columns={columnsWithEdit(onEdit)} rows={rows} keyExtractor={(r) => r.id} animateRows={false} stackBreakpoint={0} testID="grid" onRowPress={onRowPress} />
    </UiProvider>,
  );
  return container;
}

describe('DataTable clickable row with an inner button', () => {
  it('with an Edit button in a cell, pressing Edit calls only Edit, not onRowPress', () => {
    const onRowPress = jest.fn();
    const onEdit = jest.fn();
    renderRowWithEdit(onRowPress, onEdit);

    fireEvent.click(screen.getByTestId(EDIT_ID));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onRowPress).not.toHaveBeenCalled();
  });

  it('with an Edit button in a cell, renders no button inside another button', () => {
    const container = renderRowWithEdit(jest.fn(), jest.fn());

    const nested = container.querySelectorAll('button button, [role="button"] button, button [role="button"], [role="button"] [role="button"]');

    expect(nested).toHaveLength(0);
  });

  it('with an Edit button in a cell, an Enter press on the row still opens it once', () => {
    const onRowPress = jest.fn();
    renderRowWithEdit(onRowPress, jest.fn());
    const row = screen.getByTestId(rowTestID('grid', 'a'));

    row.focus();
    fireEvent.keyDown(row, { key: 'Enter', code: 'Enter' });
    fireEvent.keyUp(row, { key: 'Enter', code: 'Enter' });

    expect(onRowPress).toHaveBeenCalledTimes(1);
  });
});
