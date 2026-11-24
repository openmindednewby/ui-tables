import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { BORDER_RADIUS, BORDER_WIDTH } from '../../DataTable/styles';

const CARD_PAD = 16;
const CARD_GAP = 12;
const TITLE_FONT = 14;
const COMPACT_PAD_V = 12;
const COMPACT_PAD_H = 14;
const COMPACT_GAP = 10;

const styles = StyleSheet.create({
  card: { borderWidth: BORDER_WIDTH, borderRadius: BORDER_RADIUS, padding: CARD_PAD, gap: CARD_GAP },
  title: { fontSize: TITLE_FONT, fontWeight: '600' },
  compact: { paddingVertical: COMPACT_PAD_V, paddingHorizontal: COMPACT_PAD_H, gap: COMPACT_GAP },
});

export interface LedgerFiltersCardProps {
  /** Pre-localized card heading; omitted = no heading. */
  title?: string;
  /** The tighter 12 x 14 px padding of the `CardGrid` placement. */
  compact?: boolean;
  children: React.ReactNode;
  testID: string;
}

/** The themed card that holds the ledger's filters when they are placed apart from the table. */
export function LedgerFiltersCard({ title, compact = false, children, testID }: LedgerFiltersCardProps): React.ReactElement {
  const { colors } = useUi().theme;
  return (
    <View style={[styles.card, compact ? styles.compact : null, { backgroundColor: colors.surface, borderColor: colors.border }]} testID={testID}>
      {title === undefined ? null : (
        <Text role="heading" style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}
