import { MIN_TARGET_PX } from '../minTarget';
import { selectionStyles } from './styles';

describe('selectionStyles.headSelectCell', () => {
  it('with the 44px hit box, adds zero height to the header band', () => {
    const cell = selectionStyles.headSelectCell;

    const outer = Number(cell.height) + 2 * Number(cell.marginVertical);

    expect({ hit: cell.height, outer }).toEqual({ hit: MIN_TARGET_PX, outer: 0 });
  });
});
