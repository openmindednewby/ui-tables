/** Work queue look: a table with age first, rows grouped in age bands (default), or an age bar against a limit. */
export const enum WorkQueueVariant {
  Table = 'table',
  Bands = 'bands',
  Bar = 'bar',
}
