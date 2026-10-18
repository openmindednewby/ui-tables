import { useCallback, useMemo, useState } from 'react';

import { useUi } from '@dloizides/ui-feedback';

import type { DataTableColumn } from '../../DataTable/types';
import type { FilterField, FilterValues } from '../../Filters/types';
import { StatusPill } from '../components/StatusPill';
import { ACTIONS_COLUMN_KEY, ALL_VALUE, STATUS_COLUMN_KEY } from '../constants';
import { LedgerFilterKey } from '../LedgerFilterKey';
import { SortDirection } from '../SortDirection';
import { StatusTone } from '../StatusTone';
import type { SortValue, StatusLedgerProps } from '../types';
import { distinctValues, filterLedgerRows, isAttentionTone, sortLedgerRows, splitNeedsLook, toneRank } from '../utils/ledgerLogic';

const readText = (values: FilterValues, key: LedgerFilterKey): string => {
  const value = values[key];
  return typeof value === 'string' ? value : ALL_VALUE;
};

function useToneColor(toneColors: StatusLedgerProps<unknown>['toneColors']): (tone: StatusTone) => string {
  const { theme } = useUi();
  return useCallback(
    (tone: StatusTone) => {
      const override = toneColors?.[tone];
      if (override !== undefined) return override;
      if (tone === StatusTone.Bad) return theme.semantic.error['500'];
      if (tone === StatusTone.Active) return theme.palette.primary['500'];
      return tone === StatusTone.Good ? theme.colors.textSecondary : theme.colors.text;
    },
    [toneColors, theme],
  );
}

/** Filter, sort and column state behind `StatusLedger`. */
export function useLedgerView<T>(props: StatusLedgerProps<T>) {
  const { rows, columns, getStatus, statusLabel, statusTone, labels, getGroup, groupLabel, getSearchText, needsLook, renderActions, toneColors } = props;
  const [values, setValues] = useState<FilterValues>({});
  const [direction, setDirection] = useState<SortDirection>(SortDirection.Asc);
  const toneColor = useToneColor(toneColors);
  const toneOf = useCallback((row: T) => statusTone(getStatus(row)), [statusTone, getStatus]);

  const allColumns = useMemo(() => {
    const status = {
      key: STATUS_COLUMN_KEY,
      header: labels.status,
      sortValue: (row: T): SortValue => toneRank(toneOf(row)),
      render: (row: T) => <StatusPill color={toneColor(toneOf(row))} label={statusLabel(getStatus(row))} tone={toneOf(row)} />,
    };
    const actions = renderActions === undefined ? [] : [{ key: ACTIONS_COLUMN_KEY, header: labels.actions, render: renderActions }];
    return [columns[0], status, ...columns.slice(1), ...actions].filter((c) => c !== undefined);
  }, [columns, labels, toneOf, toneColor, statusLabel, getStatus, renderActions]);

  const fields = useMemo<FilterField[]>(() => {
    const all = { value: ALL_VALUE, label: labels.all };
    const statuses = distinctValues(rows, getStatus).map((s) => ({ value: s, label: statusLabel(s) }));
    const groups = getGroup === undefined ? [] : distinctValues(rows, getGroup).map((g) => ({ value: g, label: groupLabel?.(g) ?? g }));
    const sortable = allColumns.filter((c) => 'sortValue' in c && c.sortValue !== undefined).map((c) => ({ value: c.key, label: c.header }));
    const groupField: FilterField[] = groups.length === 0 ? [] : [{ kind: 'select', key: LedgerFilterKey.Group, label: labels.group, options: [all, ...groups] }];
    return [
      { kind: 'text', key: LedgerFilterKey.Search, label: labels.search, grow: true },
      { kind: 'select', key: LedgerFilterKey.Status, label: labels.status, options: [all, ...statuses] },
      ...groupField,
      { kind: 'select', key: LedgerFilterKey.Sort, label: labels.sortBy, options: sortable },
    ];
  }, [rows, getStatus, statusLabel, getGroup, groupLabel, labels, allColumns]);

  const visible = useMemo(() => {
    const filter = { status: readText(values, LedgerFilterKey.Status), group: readText(values, LedgerFilterKey.Group), text: readText(values, LedgerFilterKey.Search) };
    const filtered = filterLedgerRows(rows, filter, { getStatus, getGroup, getSearchText });
    const sortColumn = allColumns.find((c) => c.key === readText(values, LedgerFilterKey.Sort)) as { sortValue?: (row: T) => SortValue } | undefined;
    return sortColumn?.sortValue === undefined ? filtered : sortLedgerRows(filtered, sortColumn.sortValue, direction);
  }, [rows, values, getStatus, getGroup, getSearchText, allColumns, direction]);

  const split = useMemo(() => splitNeedsLook(visible, needsLook ?? ((row: T) => isAttentionTone(toneOf(row))), toneOf), [visible, needsLook, toneOf]);
  const toggleDirection = useCallback(() => setDirection((d) => (d === SortDirection.Asc ? SortDirection.Desc : SortDirection.Asc)), []);
  const clear = useCallback(() => setValues({}), []);
  const tableColumns: ReadonlyArray<DataTableColumn<T>> = allColumns;

  return { values, setValues, direction, toggleDirection, clear, fields, visible, split, tableColumns };
}
