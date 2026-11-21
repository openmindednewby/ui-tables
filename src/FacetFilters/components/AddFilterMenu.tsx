import React from 'react';
import { View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { ToggleRole } from '../ToggleRole';
import type { FacetTestIds } from '../testIds';
import type { FacetDefinition } from '../types';
import { panelStyle } from './panelStyle';
import { ToggleOption } from './ToggleOption';

export interface AddFilterMenuProps {
  facets: readonly FacetDefinition[];
  hint: string;
  ids: FacetTestIds;
  onPick: (key: string) => void;
}

/** The Add filter list: one row per facet not yet shown in the bar. */
export function AddFilterMenu({ facets, hint, ids, onPick }: AddFilterMenuProps): React.ReactElement {
  const { theme } = useUi();
  return (
    <View style={panelStyle(theme.colors)} testID={ids.addMenu}>
      {facets.map((f) => (
        <ToggleOption hint={hint} key={f.key} label={f.label} onPress={() => onPick(f.key)} role={ToggleRole.Checkbox} selected={false} testID={ids.addFacet(f.key)} />
      ))}
    </View>
  );
}
