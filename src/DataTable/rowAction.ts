export interface RowActionNone {
  none: string;
}

interface OpensRows<T> {
  onRowPress: (row: T) => void;
  rowAction?: RowActionNone;
}

interface DeclaresNoRowAction<T> {
  onRowPress?: (row: T) => void;
  rowAction: RowActionNone;
}

export type DataTableRowAction<T> = OpensRows<T> | DeclaresNoRowAction<T>;

function declaresNoRowAction<T>(action: DataTableRowAction<T>): action is DeclaresNoRowAction<T> {
  return action.rowAction !== undefined;
}

/** Picks only the row-action props off a wider props object, keeping the union intact. */
export function pickRowAction<T>(action: DataTableRowAction<T>): DataTableRowAction<T> {
  return declaresNoRowAction(action) ? { onRowPress: action.onRowPress, rowAction: action.rowAction } : { onRowPress: action.onRowPress };
}
