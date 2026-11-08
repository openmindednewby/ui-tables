import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { TABLE_TEST_IDS } from './constants';
import { JOINED_FRAME_STYLES, JoinedFrameContext, type PagedTableLayoutKind } from './joinedFrameContext';
import { BORDER_RADIUS, BORDER_WIDTH, ROW_PAD_H } from './styles';

export type { PagedTableLayoutKind } from './joinedFrameContext';

const LAYOUT_GAP = 12;
const PAGER_SLOT_PAD_V = 8;

const PAGER_IN_FRAME: ViewStyle = { paddingHorizontal: ROW_PAD_H, paddingVertical: PAGER_SLOT_PAD_V };
const FRAME: ViewStyle = { borderWidth: BORDER_WIDTH, borderRadius: BORDER_RADIUS };

const SLOT_STYLES: Record<PagedTableLayoutKind, { filters: ViewStyle; pager: ViewStyle }> = {
  toolbar: { filters: { marginBottom: LAYOUT_GAP }, pager: { ...PAGER_IN_FRAME, borderBottomWidth: BORDER_WIDTH } },
  spaced: { filters: {}, pager: { marginTop: LAYOUT_GAP, marginBottom: LAYOUT_GAP } },
  footer: { filters: { marginBottom: LAYOUT_GAP }, pager: { ...PAGER_IN_FRAME, borderTopWidth: BORDER_WIDTH } },
  panel: { filters: { borderBottomWidth: BORDER_WIDTH }, pager: { ...PAGER_IN_FRAME, borderBottomWidth: BORDER_WIDTH } },
};

export interface PagedTableLayoutProps {
  /** Filter bar, shown above the pager and table. Omit for none. */
  filters?: React.ReactNode;
  pager: React.ReactNode;
  table: React.ReactNode;
  /** How the pager joins the table. Default `toolbar`. */
  layout?: PagedTableLayoutKind;
  testID?: string;
}

/** Places a filter bar, a Pager and a DataTable as one unit with one spacing rule. */
export function PagedTableLayout({
  filters,
  pager,
  table,
  layout = 'toolbar',
  testID = TABLE_TEST_IDS.pagedLayout,
}: PagedTableLayoutProps): React.ReactElement {
  const { colors } = useUi().theme;
  const slots = SLOT_STYLES[layout];
  const line = { borderColor: colors.border };
  const hasFilters = filters !== undefined && filters !== null && filters !== false;
  const filtersInFrame = layout === 'panel';
  const isJoined = layout !== 'spaced';

  const filtersSlot = hasFilters ? (
    <View style={[slots.filters, line]} testID={`${testID}-filters`}>{filters}</View>
  ) : null;
  const pagerSlot = <View style={[slots.pager, line]} testID={`${testID}-pager`}>{pager}</View>;
  const tableSlot = <View testID={`${testID}-table`}>{table}</View>;
  const pagerAndTable = layout === 'footer' ? <>{tableSlot}{pagerSlot}</> : <>{pagerSlot}{tableSlot}</>;

  return (
    <JoinedFrameContext.Provider value={JOINED_FRAME_STYLES[layout]}>
      <View testID={testID}>
        {filtersInFrame ? null : filtersSlot}
        {isJoined ? (
          <View style={[FRAME, line, { backgroundColor: colors.surface }]} testID={`${testID}-frame`}>
            {filtersInFrame ? filtersSlot : null}
            {pagerAndTable}
          </View>
        ) : pagerAndTable}
      </View>
    </JoinedFrameContext.Provider>
  );
}

export default PagedTableLayout;
