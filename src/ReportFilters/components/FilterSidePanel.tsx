import React, { useCallback } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { MODAL_OVERLAY_COLOR, useUi } from '@dloizides/ui-feedback';

import { ActionButton } from '../../Filters/components/ActionButton';
import { PANEL_MAX_WIDTH, PANEL_SCREEN_SHARE } from '../constants';

const PANEL_PAD = 16;
const HEADER_GAP = 8;
const HEADER_BOTTOM = 12;
const TITLE_FONT = 16;
const PANEL_BORDER = 1;

export interface FilterSidePanelProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  closeHint: string;
  children: React.ReactNode;
  testID: string;
}

export function FilterSidePanel({ visible, onClose, title, closeLabel, closeHint, children, testID }: FilterSidePanelProps): React.ReactElement {
  const { theme } = useUi();
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(PANEL_MAX_WIDTH, Math.round(width * PANEL_SCREEN_SHARE));
  const focusTitleOnOpen = useCallback((node: View | null) => node?.focus(), []);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
          accessibilityHint={closeHint}
          onPress={onClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: MODAL_OVERLAY_COLOR }]}
          testID={`${testID}-backdrop`}
        />
        <View
          accessibilityViewIsModal
          style={[styles.panel, { width: panelWidth, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          testID={testID}
        >
          <View style={styles.header}>
            <View ref={focusTitleOnOpen} focusable style={styles.titleBox} testID={`${testID}-title`}>
              <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.text }]}>
                {title}
              </Text>
            </View>
            <ActionButton label={closeLabel} hint={closeHint} tone="primary" onPress={onClose} testID={`${testID}-close`} />
          </View>
          <ScrollView>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  panel: { height: '100%', padding: PANEL_PAD, borderLeftWidth: PANEL_BORDER },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: HEADER_GAP, marginBottom: HEADER_BOTTOM },
  titleBox: { flexShrink: 1 },
  title: { flexShrink: 1, fontSize: TITLE_FONT, fontWeight: '700' },
});

export default FilterSidePanel;
