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
