/**
 * Test-only ambient types. `jest.setup.ts` imports `@testing-library/jest-dom`
 * at runtime, but it lives outside the `src/**` include, so ts-jest never sees
 * the matcher augmentation when it type-checks each test file. This reference
 * pulls the jest-dom matcher types (`toBeDisabled`, `toBeInTheDocument`, …) into
 * every compilation under `src/`, keeping the test suites type-clean.
 */
/// <reference types="@testing-library/jest-dom" />

export {};
