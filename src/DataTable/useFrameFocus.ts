import { useCallback, useState } from 'react';

interface FocusTargetEvent {
  target: unknown;
  currentTarget: unknown;
}

export interface FrameFocus {
  focused: boolean;
  onFocus: (event: FocusTargetEvent) => void;
  onBlur: () => void;
}

/** Tracks whether the row frame itself, not a control inside it, holds keyboard focus. */
export function useFrameFocus(): FrameFocus {
  const [focused, setFocused] = useState(false);
  const onFocus = useCallback((event: FocusTargetEvent) => setFocused(event.target === event.currentTarget), []);
  const onBlur = useCallback(() => setFocused(false), []);
  return { focused, onFocus, onBlur };
}
