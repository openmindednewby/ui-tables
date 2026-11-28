import React from 'react';
import { View } from 'react-native';

import { UiProvider, type UiTheme } from '@dloizides/ui-feedback';

import { DataTable } from '../DataTable/DataTable';
import { TableDensity } from '../DataTable/TableDensity';
import { TableSkeletonRows } from '../DataTable/TableSkeletonRows';
import type { DataTableColumn } from '../DataTable/types';

interface ShowcaseRow { id: string }

const COLUMNS: DataTableColumn<ShowcaseRow>[] = [
  { key: 'name', header: 'showcase.tableSkeleton.name', render: (r) => r.id, weight: 2 },
  { key: 'status', header: 'showcase.tableSkeleton.status', render: (r) => r.id },
  { key: 'updated', header: 'showcase.tableSkeleton.updated', render: (r) => r.id },
  { key: 'count', header: 'showcase.tableSkeleton.count', render: (r) => r.id, numeric: true },
];
const SHOWCASE_ROWS = 5;
const NARROW_ROWS = 2;
const SECTION_GAP = 24;

export interface TableSkeletonRowsShowcaseProps {
  theme: UiTheme;
}

/** Showcase story: a DataTable's first load at comfortable and compact density, and the stacked card skeleton. */
export const TableSkeletonRowsShowcase = ({ theme }: TableSkeletonRowsShowcaseProps): React.ReactElement => (
  <UiProvider t={(key) => key} theme={theme}>
    <View style={{ gap: SECTION_GAP }}>
      <DataTable rowAction={{ none: 'showcase' }} columns={COLUMNS} keyExtractor={(r) => r.id} loading loadingSkeletonRows={SHOWCASE_ROWS} rows={[]} stackBreakpoint={0} testID="table-skeleton-comfortable" />
      <DataTable rowAction={{ none: 'showcase' }} columns={COLUMNS} density={TableDensity.Compact} keyExtractor={(r) => r.id} loading loadingSkeletonRows={SHOWCASE_ROWS} rows={[]} stackBreakpoint={0} testID="table-skeleton-compact" />
      <TableSkeletonRows columns={COLUMNS} rows={NARROW_ROWS} stacked testID="table-skeleton-stacked" />
    </View>
  </UiProvider>
);
