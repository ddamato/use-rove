import { useState, useEffect, useRef } from 'react';

const arrows = {
  horizontal: ['ArrowLeft', 'ArrowRight'],
  vertical: ['ArrowUp', 'ArrowDown'],
};

arrows.both = [...arrows.horizontal, ...arrows.vertical];

export default function useRove(keys = [], options) {
 const { 
    start,
    loop,
    orientation = 'both'
  } = options || {};

  function ensureKey(key) {
    return keys.includes(key) ? [key] : keys;
  }

  function getDirection(arrow) {
    return (arrows[orientation].indexOf(arrow) % 2 * 2) - 1;
  }

  function nextKey(arrow, original) {
    const index = keys.indexOf(original) + getDirection(arrow);
    if (loop) return keys.at(index) ? keys.at(index) : keys.at(0);
    return keys[index] ? keys[index] : original;
  }

  const [init] = ensureKey(start);
  const [state, setState] = useState({ key: init, focus: false });
  const ref = useRef(null);

  useEffect(function reset() {
    const [update] = ensureKey(start);
    setState({ key: update, focus: false });
  }, [
    // https://github.com/facebook/react/issues/14476#issuecomment-471199055
    JSON.stringify(keys),
    start
  ]);

  useEffect(function manageFocus() {
    if (state.focus && ref?.current) {
      setState(s => ({ ...s, focus: false }));
      ref.current.focus();
    }
  }, [
    state.key
  ]);

  return function getTargetProps(key) {
    return {
      key,
      ref: state.key === key ? ref : null,
      tabIndex: state.key === key ? 0 : -1,
      onClick: () => setState({ key, focus: true }),
      onKeyDown: ev => {
        if (!arrows[orientation].includes(ev.key)) return;
        ev.preventDefault();
        setState({ key: nextKey(ev.key, key), focus: true });
      },
    }
  }
}
