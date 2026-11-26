import React, { useContext, useState } from 'react';

import { usePagedRows } from '../Pagination/usePagedRows';
import { autoPageSizeOptions, NO_AUTO_PAGE, resolveAutoPageSize } from './autoPage';
import { TABLE_TEST_IDS } from './constants';
import { DataTable as DataTableGrid } from './DataTable';
import { JoinedFrameContext } from './joinedFrameContext';
import { PagedTableLayout } from './PagedTableLayout';
import { PagedTableLayoutKind } from './PagedTableLayoutKind';
import { Pager } from './Pager';
import { TableDefaultsContext } from './TableDefaults';
import type { DataTableProps } from './types';

const FIRST_PAGE_INDEX = 0;
const PAGE_NUMBER_OFFSET = 1;

/** The DataTable as apps get it: with a `TableDefaults` `autoPageSize`, a table longer than one page pages itself under a shared Pager. */
export function AutoPagedDataTable<T>(props: DataTableProps<T>): React.ReactElement {
  const defaults = useContext(TableDefaultsContext);
  const inPagedLayout = useContext(JoinedFrameContext) !== null;
  const firstSize = resolveAutoPageSize(props.autoPage, defaults.autoPageSize, inPagedLayout);
  const [pageSize, setPageSize] = useState(firstSize);
  const activeSize = pageSize > NO_AUTO_PAGE ? pageSize : firstSize;
  const paged = usePagedRows(props.rows, { pageSize: activeSize > NO_AUTO_PAGE ? activeSize : props.rows.length });

  if (firstSize === NO_AUTO_PAGE || props.rows.length <= firstSize) return <DataTableGrid {...props} />;

  const testID = props.testID ?? TABLE_TEST_IDS.root;
  const changeSize = (size: number): void => {
    setPageSize(size);
    paged.setPage(FIRST_PAGE_INDEX);
  };
  return (
    <PagedTableLayout
      layout={PagedTableLayoutKind.Footer}
      pager={
        <Pager
          responsive
          page={paged.currentPage + PAGE_NUMBER_OFFSET}
          pageSize={activeSize}
          pageSizeOptions={autoPageSizeOptions(firstSize)}
          testID={`${testID}-${TABLE_TEST_IDS.pager}`}
          total={props.rows.length}
          onPageChange={(page) => paged.setPage(page - PAGE_NUMBER_OFFSET)}
          onPageSizeChange={changeSize}
        />
      }
      table={<DataTableGrid {...props} rows={paged.pageRows} />}
      testID={`${testID}-${TABLE_TEST_IDS.pagedLayout}`}
    />
  );
}
