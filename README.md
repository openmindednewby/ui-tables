# @dloizides/ui-tables

Themable, brand-agnostic React Native (RN-web) **table/stat** components for the dloizides.com
portfolio. Reads theme + translations from the shared `@dloizides/ui-feedback` UI context (`useUi`).

## Components

| Component | Status |
|-----------|--------|
| `StatCard` | ✅ Available — labelled metric tile (label + locale-formatted value). |
| `DataTable`, `StatGrid` | ⏳ Deferred — currently exist only in kefi-web (n=1). They move in here when a 2nd consumer appears ("extract on the 2nd use, not the first"). |

## Install

```bash
npm install @dloizides/ui-tables @dloizides/ui-feedback
```

Peer dependencies: `@dloizides/ui-feedback >= 1.1.0`, `react >= 18`, `react-native >= 0.74`.

## Usage

```tsx
import { StatCard } from '@dloizides/ui-tables';

<StatCard label="Total responses" value={1234} testID="stat-total" />
```

Mount a `FeedbackUiProvider` / `UiProvider` (from `@dloizides/ui-feedback`) at your app root so the
component picks up your theme + translations. The injected `t` is called with `analytics.statHint` and
`analytics.statCardLabel` (provide these keys in your locale files).

## License

MIT
