/**
 * `suggestOptions` / `isUnmatched` moved to `@dloizides/ui-forms` in F2, alongside the
 * `TypeaheadControl` they serve.
 *
 * This module stays as a RE-EXPORT, not a copy. Two reasons, both deliberate:
 *
 *  1. `ui-tables` has exported both functions publicly for several releases. Deleting the module
 *     would break every consumer importing them, for no benefit.
 *  2. This package's existing `suggest.test.ts` therefore keeps running, UNMODIFIED, against the
 *     moved implementation — the cleanest available proof that the move preserved behaviour
 *     rather than merely relocating it.
 */
export { isUnmatched, suggestOptions } from '@dloizides/ui-forms';
