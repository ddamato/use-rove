import { useEffect, useMemo, useRef, useState } from 'react';

// Possible arrow keys for navigation.
const ARROWS = {
  horizontal: ['ArrowLeft', 'ArrowRight'],
  vertical: ['ArrowUp', 'ArrowDown'],
};

// Possible jump keys for navigation.
const JUMPS = ['End', 'Home'];

/**
 * The useRove hook.
 *
 * @param {Array<String>} keys - An array of unique keys in order of appearance.
 * @param {Object} options - configuration options.
 * @returns {Function} - A function to generate props for each focusable element.
 */
export function useRove(keys = [], options) {
  const { start, loop, rtl, orientation = 'both' } = options || {};

  /**
   * This creates the configuration of arrow key usage based on RTL.
   * The order of the keys in each array is important as we determine which direction to go
   * based on the index of the keypress in the given array.
   */
  const arrows = useMemo(
    function setArrows() {
      const horizontal = rtl ? ARROWS.horizontal.reverse() : ARROWS.horizontal;
      return {
        horizontal,
        vertical: ARROWS.vertical,
        both: [...horizontal, ...ARROWS.vertical],
      };
    },
    [rtl]
  );

  /**
   * Provides an array with at least one key.
   * The resulting usage should destructure the array for the first item.
   *
   * @param {String} key - The requested key.
   * @returns {Array<String>} - An array with at least one existing key.
   */
  function ensureKey(key) {
    return keys.includes(key) ? [key] : keys;
  }

  /**
   * Determines the direction that the keys index needs to shift based on
   * a given arrow key press.
   *
   * @param {String} keypress - A keyboard key representation as a string.
   * @returns {Number} - The amount to increment the current index in the keys array.
   */
  function getDirection(keypress) {
    return (arrows[orientation].indexOf(keypress) % 2) * 2 - 1;
  }

  /**
   * Determines the next key to be set in state by keyboard interaction.
   *
   * @param {String} keypress - A keyboard key representation as a string.
   * @returns {String} - The next key to set in state.
   */
  function nextKey(keypress) {
    if (keypress.length === 1 && /\w/.test(keypress)) return onInput(keypress);
    if (JUMPS.includes(keypress)) return keys.at(JUMPS.indexOf(keypress) - 1);
    if (!arrows[orientation].includes(keypress)) return state.key;
    const index = keys.indexOf(state.key) + getDirection(keypress);
    if (loop) return keys.at(index) ? keys.at(index) : keys.at(0);
    return keys[index] ? keys[index] : state.key;
  }

  // Ensure the given key exists.
  const [init] = ensureKey(start);

  // Set the initial state of the hook.
  const [state, setState] = useState({ key: init, focus: false });

  /**
   * If the list of keys changes or the starting key
   * the entire setup will need to be reset.
   */
  useEffect(
    function reset() {
      const [update] = ensureKey(start);
      setState({ key: update, focus: false });
    },
    [
      /**
       * Checking if the values of an array change as a dependency.
       * Since the dependency is an array, equality is not easy as an array.
       * ['a'] === ['a'] -> false
       * However, since keys is a shallow array of strings, this approach is fine.
       * JSON.stringify(['a']) === JSON.stringify(['a']) -> true
       */
      // https://github.com/facebook/react/issues/14476#issuecomment-471199055
      JSON.stringify(keys),
      start,
    ]
  );

  // Collection of refs for each child
  const refs = new Map();

  /**
   * We hold a reference for focusing the element.
   * We'll also need to reset the focus trigger here so focus doesn't occur
   * if the component re-renders.
   *
   * This should only fire if the state.key changes. This function does not change the state.key itself.
   */
  useEffect(
    function manageFocus() {
      if (state.focus) {
        setState((s) => ({ ...s, focus: false }));
        refs.get(state.key).current.focus();
      }
    },
    [state.key]
  );

  /**
   * Returns the key that matches the text content or label
   * 
   * @param {String} keypress - Alphanumeric keyboard key
   * @returns {String} - A valid key to focus
   */
  function onInput(keypress) {
    const rgx = new RegExp(`^${keypress}{1}`, 'i')
    for (const [key, ref] of refs.entries()) {
      if (
        rgx.test(ref.current.textContent) ||
        rgx.test(ref.current.getAttribute('aria-label'))
        )
      return key;
    }
    return state.key;
  }

  /**
   * This function provides the props to each element expected to be focusable by key
   * @param {String|Object} identifier - The key that represents this element or the props for the element.
   * @returns {Object} - Props to represent the state of focus for each key.
   */
  return function getTargetProps(identifier) {
    const {
      key,
      ref = useRef(null),
      tabIndex, // Drop this, needs to be controlled by the hook
      onClick = Function.prototype,
      onKeyDown = Function.prototype,
      ...rest
    } = typeof identifier === 'string' ? { key: identifier } : identifier;

    if (!key) return identifier;

    refs.set(key, ref);

    const props = {
      // The unique key.
      key,

      // The element reference, used to call focusRef.current.focus().
      ref,

      // The tabIndex, only as 0 for the state.key element.
      tabIndex: state.key === key ? 0 : -1,

      // Event handler for click/tap of the element.
      onClick: (ev) => {
        if (typeof onClick === 'function') onClick(ev);

        setState({ key, focus: true });
      },

      // Event handler for keyboard navigation.
      onKeyDown: (ev) => {
        if (typeof onKeyDown === 'function') onKeyDown(ev);

        // Skip this key
        if (ev.key === 'Tab') return;

        // Prevent default behavior.
        ev.preventDefault();

        // Set the next key based on keyboard navigation and focus.
        setState({ key: nextKey(ev.key), focus: true });
      },

      // Spread the rest of the props
      ...rest,
    };

    return props;
  };
}
