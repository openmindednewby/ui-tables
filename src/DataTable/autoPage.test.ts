import { autoPageSizeOptions, resolveAutoPageSize } from './autoPage';

describe('resolveAutoPageSize', () => {
  it('with a default and no opt-out, returns the default', () => {
    const size = resolveAutoPageSize(undefined, 10, false);

    expect(size).toBe(10);
  });

  it('with autoPage false, returns 0', () => {
    const size = resolveAutoPageSize(false, 10, false);

    expect(size).toBe(0);
  });

  it('inside a caller paged layout, returns 0', () => {
    const size = resolveAutoPageSize(undefined, 10, true);

    expect(size).toBe(0);
  });
});

describe('autoPageSizeOptions', () => {
  it('with 10, returns 10 then the shared choices', () => {
    const options = autoPageSizeOptions(10);

    expect(options).toEqual([10, 25, 50, 100, 200]);
  });
});
