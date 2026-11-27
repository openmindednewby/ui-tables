import { TableLook } from './TableLookName';
import { BANDED_HEAD_HEIGHT, BANDED_ROW_HEIGHT, tableColumnStyle, tableLookStyles } from './tableLook';

const COLORS = { background: 'page-token', border: 'border-token', textSecondary: 'muted-token' };

describe('tableLookStyles', () => {
  it('with the default look, returns null so the density look stays', () => {
    const look = TableLook.Default;

    const styles = tableLookStyles(look, COLORS);

    expect(styles).toBeNull();
  });

  it('with no look, returns null', () => {
    const look = undefined;

    const styles = tableLookStyles(look, COLORS);

    expect(styles).toBeNull();
  });

  it('with the banded look, tints the header band with the page background token at 36 px', () => {
    const look = TableLook.Banded;

    const styles = tableLookStyles(look, COLORS);

    expect(styles?.headRow).toMatchObject({ backgroundColor: 'page-token', borderBottomColor: 'border-token', minHeight: BANDED_HEAD_HEIGHT });
  });

  it('with the banded look, gives 52 px rows and muted header text', () => {
    const look = TableLook.Banded;

    const styles = tableLookStyles(look, COLORS);

    expect({ row: styles?.row.minHeight, head: styles?.headCell.color }).toEqual({ row: BANDED_ROW_HEIGHT, head: 'muted-token' });
  });

  it('with the banded look, uses the same padding and gap on header and rows so columns line up', () => {
    const look = TableLook.Banded;

    const styles = tableLookStyles(look, COLORS);

    expect([styles?.headRow.paddingHorizontal, styles?.headRow.columnGap]).toEqual([styles?.row.paddingHorizontal, styles?.row.columnGap]);
  });


  it('with the banded look, gives DataTable a band without padding so its own cell padding keeps the columns', () => {
    const look = TableLook.Banded;

    const styles = tableLookStyles(look, COLORS);

    expect(styles?.band).not.toHaveProperty('paddingHorizontal');
  });
});

describe('tableColumnStyle', () => {
  it('with a weight and min width, grows by the weight from a zero basis', () => {
    const weight = 2.5;

    const style = tableColumnStyle(weight, 120);

    expect(style).toEqual({ flexBasis: 0, flexGrow: 2.5, flexShrink: 1, minWidth: 120 });
  });

  it('with no min width, lets the column shrink to zero', () => {
    const weight = 1;

    const style = tableColumnStyle(weight);

    expect(style.minWidth).toBe(0);
  });
});
