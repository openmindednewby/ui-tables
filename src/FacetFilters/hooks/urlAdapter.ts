/** Where the list state is read from and written to; the browser history by default. */
export interface UrlAdapter {
  read: () => string;
  write: (query: string) => void;
  subscribe: (onChange: () => void) => () => void;
}

const noop = (): void => undefined;

export function createBrowserUrlAdapter(): UrlAdapter {
  const hasWindow = typeof window !== 'undefined' && typeof window.history !== 'undefined';
  if (!hasWindow) return { read: () => '', write: noop, subscribe: () => noop };
  return {
    read: () => window.location.search,
    write: (query) => {
      const { pathname, hash } = window.location;
      const next = `${pathname}${query === '' ? '' : `?${query}`}${hash}`;
      window.history.pushState(window.history.state, '', next);
    },
    subscribe: (onChange) => {
      window.addEventListener('popstate', onChange);
      return () => window.removeEventListener('popstate', onChange);
    },
  };
}
