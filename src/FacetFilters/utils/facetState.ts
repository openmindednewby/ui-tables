import { MAX_SUMMARY_LABELS, SUMMARY_JOINER } from '../constants';
import type { FacetDefinition, FacetValues, FilterChipBarLabels } from '../types';

export function removeFacet(values: FacetValues, key: string): FacetValues {
  return Object.fromEntries(Object.entries(values).filter(([k]) => k !== key));
}

/** Adds the value when absent and drops it when present; an emptied facet is removed. */
export function toggleFacetValue(values: FacetValues, key: string, value: string): FacetValues {
  const current = values[key] ?? [];
  const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  return next.length === 0 ? removeFacet(values, key) : { ...values, [key]: next };
}

/** Facet keys that hold at least one value, in definition order. */
export function activeFacetKeys(facets: readonly FacetDefinition[], values: FacetValues): string[] {
  return facets.filter((f) => (values[f.key]?.length ?? 0) > 0).map((f) => f.key);
}

export function isSameFacets(a: FacetValues, b: FacetValues): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((k) => {
    const left = [...(a[k] ?? [])].sort();
    const right = [...(b[k] ?? [])].sort();
    return left.length === right.length && left.every((v, i) => v === right[i]);
  });
}

/** The chip's value text: the picked labels when few, else a count; every option picked reads as "all". */
export function facetSummary(facet: FacetDefinition, picked: readonly string[], labels: FilterChipBarLabels): string {
  if (picked.length === facet.options.length) return labels.allSelected;
  if (picked.length > MAX_SUMMARY_LABELS) return labels.countSelected(picked.length);
  return facet.options.filter((o) => picked.includes(o.value)).map((o) => o.label).join(SUMMARY_JOINER);
}
