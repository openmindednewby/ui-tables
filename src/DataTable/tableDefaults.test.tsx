import { render, screen } from '@testing-library/react';
import React, { useContext } from 'react';
import { Text } from 'react-native';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { DataTable } from './DataTable';
import { Pager } from './Pager';
import { TableDensityContext } from './density';
import { TableDefaultsProvider } from './TableDefaults';
import { TableDensity } from './TableDensity';
import type { DataTableColumn } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#0e5a7e' } },
  semantic: { error: { '500': '#b3261e' } },
};
const t: UiValue['t'] = (key) => key;
const NO_STACK = 0;

interface Row { id: string }
const ROWS: readonly Row[] = [{ id: 'r1' }];

function DensityProbe(): React.ReactElement {
  return <Text testID="density-probe">{useContext(TableDensityContext)}</Text>;
}

const COLUMNS: ReadonlyArray<DataTableColumn<Row>> = [{ key: 'probe', header: 'Probe', render: () => <DensityProbe /> }];

function table(density?: TableDensity): React.ReactElement {
  return <DataTable columns={COLUMNS} density={density} keyExtractor={(r) => r.id} rowAction={{ none: 'static' }} rows={ROWS} stackBreakpoint={NO_STACK} />;
}

function renderUi(ui: React.ReactElement): void {
  render(<UiProvider theme={theme} t={t}>{ui}</UiProvider>);
}

describe('TableDefaultsProvider', () => {
  it('without a provider or prop, keeps the comfortable density', () => {
    renderUi(table());

    expect(screen.getByTestId('density-probe').textContent).toBe(TableDensity.Comfortable);
  });

  it('with a compact provider, gives a table without its own density the compact look', () => {
    renderUi(<TableDefaultsProvider density={TableDensity.Compact}>{table()}</TableDefaultsProvider>);

    expect(screen.getByTestId('density-probe').textContent).toBe(TableDensity.Compact);
  });

  it('with a compact provider, lets a table that passes dense keep dense', () => {
    renderUi(<TableDefaultsProvider density={TableDensity.Compact}>{table(TableDensity.Dense)}</TableDefaultsProvider>);

    expect(screen.getByTestId('density-probe').textContent).toBe(TableDensity.Dense);
  });
});

describe('Pager rows variant default', () => {
  it('with a dropdown provider and no prop, renders the dropdown rows control', () => {
    const pager = <Pager page={1} pageSize={25} total={100} onPageChange={() => undefined} onPageSizeChange={() => undefined} />;

    renderUi(<TableDefaultsProvider density={TableDensity.Compact} pagerRowsVariant="dropdown">{pager}</TableDefaultsProvider>);

    expect(screen.queryByTestId('ui-pager-size-25')).toBeNull();
  });
});
