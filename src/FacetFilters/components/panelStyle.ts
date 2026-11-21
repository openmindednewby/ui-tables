import type { StyleProp, ViewStyle } from 'react-native';

import type { UiTheme } from '@dloizides/ui-feedback';

import { facetStyles } from './styles';

/** The bordered surface every filter panel (editor, add menu, date, columns) sits on. */
export function panelStyle(colors: UiTheme['colors']): StyleProp<ViewStyle> {
  return [facetStyles.panel, { borderColor: colors.border, backgroundColor: colors.surface }];
}
