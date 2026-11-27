import { fireEvent, render, screen } from '@testing-library/react';

import { SearchFieldLook } from '../SearchFieldLook';
import { ListSearchField, type ListSearchFieldProps } from './ListSearchField';

const noop = (): void => undefined;

function renderField(overrides: Partial<ListSearchFieldProps> = {}): void {
  render(<ListSearchField hint="Filters the list" label="Search" placeholder="Name or ID" testID="list-search" value="" onChangeText={noop} onSubmit={noop} {...overrides} />);
}

describe('ListSearchField', () => {
  it('with no look, renders the plain bordered input with no frame', () => {
    renderField();

    expect(screen.queryByTestId('list-search-frame')).toBeNull();
    expect(screen.getByTestId('list-search')).toHaveStyle({ borderTopWidth: '1px', minHeight: '44px' });
  });

  it('with the Framed look, draws the frame at the 44 px target with a filled background', () => {
    renderField({ look: SearchFieldLook.Framed });

    const frame = screen.getByTestId('list-search-frame');
    expect(frame).toHaveStyle({ minHeight: '44px', borderTopWidth: '1px' });
    expect(frame.style.backgroundColor).not.toBe('');
  });

  it('with the Framed look and a shortcut key, shows the key badge while empty', () => {
    renderField({ look: SearchFieldLook.Framed, shortcutKey: '/' });

    expect(screen.getByTestId('list-search-shortcut').textContent).toBe('/');
  });

  it('with the Framed look and typed text, hides the key badge', () => {
    renderField({ look: SearchFieldLook.Framed, shortcutKey: '/', value: 'anna' });

    expect(screen.queryByTestId('list-search-shortcut')).toBeNull();
  });

  it('with the Framed look and no shortcut key, shows no badge', () => {
    renderField({ look: SearchFieldLook.Framed });

    expect(screen.queryByTestId('list-search-shortcut')).toBeNull();
  });

  it('with the shortcut key pressed on the page, focuses the input', () => {
    renderField({ look: SearchFieldLook.Framed, shortcutKey: '/' });

    fireEvent.keyDown(document.body, { key: '/' });

    expect(document.activeElement).toBe(screen.getByTestId('list-search'));
  });

  it('with the shortcut key typed inside another input, leaves focus there', () => {
    renderField({ look: SearchFieldLook.Framed, shortcutKey: '/' });
    const other = document.createElement('input');
    document.body.appendChild(other);
    other.focus();

    fireEvent.keyDown(other, { key: '/' });

    expect(document.activeElement).toBe(other);
  });

  it('with Enter pressed in the input, calls onSubmit', () => {
    const onSubmit = jest.fn();
    renderField({ look: SearchFieldLook.Framed, onSubmit });

    fireEvent.keyDown(screen.getByTestId('list-search'), { key: 'Enter' });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
