export interface ActiveDataSet {
  dataSet: Record<string, string>;
}

export const activeDataSet = (active: boolean): ActiveDataSet => ({ dataSet: { active: String(active) } });
