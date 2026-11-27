import { useEffect, type RefObject } from 'react';
import { Platform, type TextInput } from 'react-native';

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return TYPING_TAGS.has(target.tagName) || target.isContentEditable;
}

/** On web, focuses the input when the shortcut key is pressed outside any text field. */
export function useShortcutFocus(inputRef: RefObject<TextInput | null>, shortcutKey: string | undefined): void {
  useEffect(() => {
    if (Platform.OS !== 'web' || shortcutKey === undefined || shortcutKey === '') return undefined;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== shortcutKey || event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [inputRef, shortcutKey]);
}
