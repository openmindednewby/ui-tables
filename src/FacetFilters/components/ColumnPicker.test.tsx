import { fireEvent, render, screen } from '@testing-library/react';

import { columnToggleTestID } from '../constants';
import type { ColumnOption } from '../types';
import { ColumnPicker } from './ColumnPicker';

const COLUMNS: ColumnOption[] = [
  { key: 'name', label: 'Name', locked: true },
  { key: 'status', label: 'Status' },
  { key: 'updated', label: 'Updated' },
];
const LABELS = { title: 'Columns', toggleHint: 'Shows or hides this column', lockedHint: 'Always shown' };

describe('ColumnPicker', () => {
  it('with a visible column pressed, emits the columns without it', () => {
    const onChange = jest.fn();
    render(<ColumnPicker columns={COLUMNS} labels={LABELS} onChange={onChange} visible={['name', 'status', 'updated']} />);

    fireEvent.click(screen.getByTestId(columnToggleTestID('status')));

    expect(onChange).toHaveBeenCalledWith(['name', 'updated']);
  });

  it('with a locked column pressed, emits nothing', () => {
    const onChange = jest.fn();
    render(<ColumnPicker columns={COLUMNS} labels={LABELS} onChange={onChange} visible={['name', 'status']} />);

    fireEvent.click(screen.getByTestId(columnToggleTestID('name')));

    expect(onChange).not.toHaveBeenCalled();
  });
});
