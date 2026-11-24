/**
 * Where the ledger draws its filters: `Inline` as the bar above the table, `Card` as a separate card of their own,
 * `CardGrid` as a tighter card whose fields share one even row with the actions and count on the line below.
 */
export const enum LedgerFiltersPlacement {
  Inline = 'inline',
  Card = 'card',
  CardGrid = 'card-grid',
}
