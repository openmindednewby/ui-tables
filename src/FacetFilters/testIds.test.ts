import { FACET_TEST_IDS, facetOptionTestID } from './constants';
import { facetTestIds } from './testIds';

describe('facetTestIds', () => {
  it('with a prefix, builds the prefixed chip, option, date, column and footer ids', () => {
    const prefix = 'list';

    const ids = facetTestIds(prefix);

    expect([ids.chip('risk'), ids.addFilter, ids.addFacet('mon'), ids.option('risk', 'high'), ids.reset, ids.dateTrigger, ids.dateField('created'), ids.dateRange('7d'), ids.columnToggle('risk'), ids.columns, ids.found, ids.pageSize, ids.next, ids.prev, ids.bar]).toEqual([
      'list-chip-risk',
      'list-add-filter',
      'list-add-filter-mon',
      'list-filter-option-high',
      'list-reset',
      'list-chip-date',
      'list-date-mode-created',
      'list-date-range-7d',
      'list-column-toggle-risk',
      'list-columns',
      'list-found',
      'list-page-size',
      'list-next',
      'list-prev',
      'list-filterbar',
    ]);
  });

  it('with no prefix, keeps the 3.8.0 ids', () => {
    const prefix = undefined;

    const ids = facetTestIds(prefix);

    expect([ids.bar, ids.reset, ids.option('vs', 'review')]).toEqual([FACET_TEST_IDS.bar, FACET_TEST_IDS.reset, facetOptionTestID('vs', 'review')]);
  });
});
