import { useState, useEffect, useRef, useMemo } from 'react';

const ARROWS = {
  horizontal: ['ArrowLeft', 'ArrowRight'],
  vertical: ['ArrowUp', 'ArrowDown'],
};

const JUMPS = ['End', 'Home'];

export default function useRove(keys = [], options) {
  const { start, loop, rtl, orientation = 'both' } = options || {};

  const arrows = useMemo(() => {
    const horizontal = rtl 
      ? ARROWS.horizontal.reverse()
      : ARROWS.horizontal;
    return {
      horizontal,
      veritcal: ARROWS.vertical,
      both: [...horizontal, ...ARROWS.vertical]
    };
  }, [rtl]);

  function ensureKey(key) {
    return keys.includes(key) ? [key] : keys;
  }

  function getDirection(keypress) {
    return (arrows[orientation].indexOf(keypress) % 2) * 2 - 1;
  }

  function nextKey(keypress, original) {
    if (JUMPS.includes(keypress)) return keys.at(JUMPS.indexOf(keypress) - 1);
    const index = keys.indexOf(original) + getDirection(keypress);
    if (loop) return keys.at(index) ? keys.at(index) : keys.at(0);
    return keys[index] ? keys[index] : original;
  }

  const [init] = ensureKey(start);
  const [state, setState] = useState({ key: init, focus: false });
  const ref = useRef(null);

  useEffect(
    function reset() {
      const [update] = ensureKey(start);
      setState({ key: update, focus: false });
    },
    [
      // https://github.com/facebook/react/issues/14476#issuecomment-471199055
      JSON.stringify(keys),
      start,
    ]
  );

  useEffect(
    function manageFocus() {
      if (state.focus && ref?.current) {
        setState((s) => ({ ...s, focus: false }));
        ref.current.focus();
      }
    },
    [state.key]
  );

  return function getTargetProps(key) {
    return {
      key,
      ref: state.key === key ? ref : null,
      tabIndex: state.key === key ? 0 : -1,
      onClick: () => setState({ key, focus: true }),
      onKeyDown: (ev) => {
        if (!arrows[orientation].concat(JUMPS).includes(ev.key)) return;
        ev.preventDefault();
        setState({ key: nextKey(ev.key, key), focus: true });
      },
    };
  };
}
