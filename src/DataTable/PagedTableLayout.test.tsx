import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { DataTable } from './DataTable';
import { FilterBar } from './FilterBar';
import { PagedTableLayout, type PagedTableLayoutProps } from './PagedTableLayout';
import { PagedTableLayoutKind } from './PagedTableLayoutKind';
import { Pager } from './Pager';
import { TABLE_TEST_IDS } from './constants';
import type { DataTableColumn } from './types';

let mockWidth = 1280;
jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native-web');
  return {
    ...actual,
    useWindowDimensions: (): { width: number; height: number; scale: number; fontScale: number } => ({
      width: mockWidth,
      height: 800,
      scale: 1,
      fontScale: 1,
    }),
  };
});

const DESKTOP_WIDTH = 1280;
const PHONE_WIDTH = 360;
const NO_STACK = 0;
const ROOT_ID = 'layout';
const FRAME_ID = `${ROOT_ID}-frame`;
const FILTERS_SLOT_ID = `${ROOT_ID}-filters`;
const PAGER_SLOT_ID = `${ROOT_ID}-pager`;
const TABLE_SLOT_ID = `${ROOT_ID}-table`;
const FILTERS_ID = 'filters';
const PAGER_ID = 'pager';
const TABLE_ID = 'grid';
const NESTED_TABLE_ID = 'nested-grid';
const NO_BORDER = '0px';
const DIVIDER = '1px';
const GAP = '12px';
const INNER_RADIUS = '11px';
const JOINED_LAYOUTS: readonly PagedTableLayoutKind[] = [PagedTableLayoutKind.Toolbar, PagedTableLayoutKind.Footer, PagedTableLayoutKind.Panel];
const LAYOUTS: readonly PagedTableLayoutKind[] = [...JOINED_LAYOUTS, PagedTableLayoutKind.Spaced];

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#0f766e' } },
  semantic: { error: { '500': '#dc2626' } },
};
const t: UiValue['t'] = (key) => key;
const noop = (): void => undefined;

interface Person { id: string; name: string }
const columns: ReadonlyArray<DataTableColumn<Person>> = [{ key: 'name', header: 'Name', render: (r) => r.name }];
const rows: Person[] = [{ id: 'a', name: 'Ada' }];

function LocalTable(): React.ReactElement {
  return <DataTable rowAction={{ none: 'test table' }} columns={columns} rows={rows} keyExtractor={(r) => r.id} stackBreakpoint={NO_STACK} testID={TABLE_ID} />;
}

function LocalPager(): React.ReactElement {
  return (
    <Pager
      page={2}
      pageSize={25}
      total={100}
      responsive
      showFirstLast
      rowsVariant="dropdown"
      testID={PAGER_ID}
      onPageChange={noop}
      onPageSizeChange={noop}
    />
  );
}

function renderLayout(layout?: PagedTableLayoutProps['layout'], table: React.ReactNode = <LocalTable />): void {
  render(
    <UiProvider theme={theme} t={t}>
      <PagedTableLayout layout={layout} testID={ROOT_ID} filters={<FilterBar testID={FILTERS_ID} />} pager={<LocalPager />} table={table} />
    </UiProvider>,
  );
}

function frameSlots(): Array<string | null> {
  return Array.from(screen.getByTestId(FRAME_ID).children).map((child) => child.getAttribute('data-testid'));
}

beforeEach(() => {
  mockWidth = DESKTOP_WIDTH;
});

describe('PagedTableLayout', () => {
  it('with no layout, renders the toolbar layout', () => {
    renderLayout();

    const slots = frameSlots();

    expect(slots).toEqual([PAGER_SLOT_ID, TABLE_SLOT_ID]);
    expect(screen.getByTestId(FRAME_ID).contains(screen.getByTestId(FILTERS_ID))).toBe(false);
  });

  it('with toolbar, joins pager and table in one frame with one divider and no gap', () => {
    renderLayout('toolbar');

    const pagerSlot = screen.getByTestId(PAGER_SLOT_ID);

    expect(frameSlots()).toEqual([PAGER_SLOT_ID, TABLE_SLOT_ID]);
    expect(pagerSlot.style.borderBottomWidth).toBe(DIVIDER);
    expect(pagerSlot.style.marginTop).toBe('');
    expect(pagerSlot.style.marginBottom).toBe('');
    expect(screen.getByTestId(TABLE_ID).style.borderTopWidth).toBe(NO_BORDER);
  });

  it('with toolbar, rounds only the bottom corners of the table', () => {
    renderLayout('toolbar');

    const table = screen.getByTestId(TABLE_ID);

    expect(table.style.borderTopLeftRadius).toBe(NO_BORDER);
    expect(table.style.borderBottomLeftRadius).toBe(INNER_RADIUS);
  });

  it('with toolbar, leaves a gap between the filters and the frame', () => {
    renderLayout('toolbar');

    const filtersSlot = screen.getByTestId(FILTERS_SLOT_ID);

    expect(filtersSlot.style.marginBottom).toBe(GAP);
  });

  it('with spaced, puts 12px above and below the pager and keeps separate frames', () => {
    renderLayout('spaced');

    const pagerSlot = screen.getByTestId(PAGER_SLOT_ID);

    expect(screen.queryByTestId(FRAME_ID)).toBeNull();
    expect(pagerSlot.style.marginTop).toBe(GAP);
    expect(pagerSlot.style.marginBottom).toBe(GAP);
    expect(screen.getByTestId(TABLE_ID).style.borderTopWidth).toBe('');
  });

  it('with footer, joins pager and table with the pager below the rows', () => {
    renderLayout('footer');

    const pagerSlot = screen.getByTestId(PAGER_SLOT_ID);

    expect(frameSlots()).toEqual([TABLE_SLOT_ID, PAGER_SLOT_ID]);
    expect(pagerSlot.style.borderTopWidth).toBe(DIVIDER);
    expect(screen.getByTestId(TABLE_ID).style.borderTopWidth).toBe(NO_BORDER);
  });

  it('with panel, puts filters, pager and table in one frame', () => {
    renderLayout('panel');

    const filters = screen.getByTestId(FILTERS_ID);

    expect(frameSlots()).toEqual([FILTERS_SLOT_ID, PAGER_SLOT_ID, TABLE_SLOT_ID]);
    expect(filters.style.borderTopWidth).toBe(NO_BORDER);
    expect(screen.getByTestId(TABLE_ID).style.borderTopWidth).toBe(NO_BORDER);
  });

  it('with the enum member, renders the same layout as its string value', () => {
    renderLayout(PagedTableLayoutKind.Footer);

    const slots = frameSlots();

    expect(slots).toEqual([TABLE_SLOT_ID, PAGER_SLOT_ID]);
  });

  it('with toolbar, leaves the filter bar its own border', () => {
    renderLayout('toolbar');

    const filters = screen.getByTestId(FILTERS_ID);

    expect(filters.style.borderTopWidth).toBe('');
  });

  it('with no filters, renders no filters slot', () => {
    render(
      <UiProvider theme={theme} t={t}>
        <PagedTableLayout testID={ROOT_ID} pager={<LocalPager />} table={<LocalTable />} />
      </UiProvider>,
    );

    const filtersSlot = screen.queryByTestId(FILTERS_SLOT_ID);

    expect(filtersSlot).toBeNull();
  });

  it('with a consumer wrap override, keeps the consumer value last', () => {
    const overridden = (
      <DataTable rowAction={{ none: 'test table' }}
        columns={columns}
        rows={rows}
        keyExtractor={(r) => r.id}
        stackBreakpoint={NO_STACK}
        styleOverrides={{ wrap: { borderTopWidth: 4 } }}
        testID={TABLE_ID}
      />
    );
    renderLayout('toolbar', overridden);

    const table = screen.getByTestId(TABLE_ID);

    expect(table.style.borderTopWidth).toBe('4px');
  });

  it('with an expanded row holding a nested table, keeps the nested table border', () => {
    const nested = (
      <DataTable rowAction={{ none: 'test table' }}
        columns={columns}
        rows={rows}
        keyExtractor={(r) => r.id}
        stackBreakpoint={NO_STACK}
        expandedRowKeys={['a']}
        renderRowDetail={() => (
          <DataTable rowAction={{ none: 'test table' }} columns={columns} rows={rows} keyExtractor={(r) => r.id} stackBreakpoint={NO_STACK} testID={NESTED_TABLE_ID} />
        )}
        testID={TABLE_ID}
      />
    );
    renderLayout('toolbar', nested);

    const nestedTable = screen.getByTestId(NESTED_TABLE_ID);

    expect(nestedTable.style.borderTopWidth).toBe('');
  });

  it.each([DESKTOP_WIDTH, PHONE_WIDTH])('at %dpx with a table inside a column render, keeps the nested table border', (width) => {
    mockWidth = width;
    const nestedColumns: ReadonlyArray<DataTableColumn<Person>> = [
      {
        key: 'name',
        header: 'Name',
        render: () => <DataTable rowAction={{ none: 'test table' }} columns={columns} rows={rows} keyExtractor={(r) => r.id} stackBreakpoint={NO_STACK} testID={NESTED_TABLE_ID} />,
      },
    ];
    renderLayout('toolbar', <DataTable rowAction={{ none: 'test table' }} columns={nestedColumns} rows={rows} keyExtractor={(r) => r.id} testID={TABLE_ID} />);

    const nestedTable = screen.getByTestId(NESTED_TABLE_ID);

    expect(nestedTable.style.borderTopWidth).toBe('');
  });

  it.each(JOINED_LAYOUTS)('with %s, gives the shared frame no overflow clipping', (layout) => {
    renderLayout(layout);

    const frame = screen.getByTestId(FRAME_ID);

    expect(frame.style.overflow).toBe('');
  });

  it.each(LAYOUTS)('with %s, opens the rows menu outside the layout', (layout) => {
    renderLayout(layout);

    fireEvent.click(screen.getByTestId(`${PAGER_ID}-size-trigger`));

    expect(screen.getByTestId(ROOT_ID).contains(screen.getByTestId(`${PAGER_ID}-size-menu`))).toBe(false);
  });

  it.each(LAYOUTS)('with %s at desktop width, keeps every pager control', (layout) => {
    renderLayout(layout);

    const controls = [
      TABLE_TEST_IDS.pagerInfo,
      `${PAGER_ID}-size-trigger`,
      TABLE_TEST_IDS.pagerFirst,
      TABLE_TEST_IDS.pagerPrev,
      TABLE_TEST_IDS.pagerNext,
      TABLE_TEST_IDS.pagerLast,
    ].map((id) => screen.queryByTestId(id));

    expect(controls.every((control) => control !== null)).toBe(true);
  });

  it.each(LAYOUTS)('with %s below 640px, hides rows, First and Last and keeps Prev and Next', (layout) => {
    mockWidth = PHONE_WIDTH;

    renderLayout(layout);

    expect(screen.queryByTestId(`${PAGER_ID}-size-trigger`)).toBeNull();
    expect(screen.queryByTestId(TABLE_TEST_IDS.pagerFirst)).toBeNull();
    expect(screen.queryByTestId(TABLE_TEST_IDS.pagerLast)).toBeNull();
    expect(screen.queryByTestId(TABLE_TEST_IDS.pagerPrev)).not.toBeNull();
    expect(screen.queryByTestId(TABLE_TEST_IDS.pagerNext)).not.toBeNull();
  });
});
