import { render, screen } from '@testing-library/react';
import { Text } from 'react-native';

import { ROW_ACTIONS_GAP, ROW_ACTIONS_TEST_ID, RowActions, RowActionsAlign } from './RowActions';

describe('RowActions', () => {
  it('renders every action of the row in order', () => {
    render(<RowActions><Text>Copy</Text><Text>Delete</Text></RowActions>);

    expect(screen.getByTestId(ROW_ACTIONS_TEST_ID).textContent).toBe('CopyDelete');
  });

  it('keeps the row-action gap at 4 px', () => {
    expect(ROW_ACTIONS_GAP).toBe(4);
  });

  it('with end alignment, pushes the actions to the end of the cell', () => {
    render(<RowActions align={RowActionsAlign.End} testID="acts"><Text>Copy</Text></RowActions>);

    expect(getComputedStyle(screen.getByTestId('acts')).justifyContent).toBe('flex-end');
  });
});
