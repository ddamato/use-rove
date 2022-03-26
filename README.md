# use-rove

<div>
  <img src="https://img.shields.io/npm/dt/use-rove.svg" alt="Total Downloads">
  <img src="https://img.shields.io/npm/v/use-rove.svg" alt="Latest Release">
  <img src="https://img.shields.io/npm/l/use-rove.svg" alt="License">
</div>

## Install

```sh
npm i use-rove
```

## Usage

Assuming `items` is an array of objects (`props`) where each `item` has a unique `key` property.

```jsx
import React from 'react';
import { useRove } from 'use-rove';

function MyList(props) {
  const { items = [] } = props || {};
  const keys = items.map(item => item.key);
  const getTargetProps = useRove(keys, options);
  return (
    <ul>
      { items.map(item =>
        <li { ...getTargetProps(item.key) } { ...item } />)
      }
    </ul>
  );
}
```

### `useRove(keys, options)`

The hook requires the first argument (`keys`) to be an array of unique values that are expected to represent each item to be focused in tab order. This can be the `id` of each item or the `index` in loose usage.

```js
// Not recommended, use unique id values instead.
const keys = items.map((_, index) => index);
const getTargetProps = useRove(keys);
```

The hook uses this list of `keys` to determine which item in the collection to focus.

### `getTargetProps(key)`

This is the result of the hook; a function expected to be run for each unique key when rendering each item in the collection to be focused. The function will return the following props:

```js
const {
  key, // Applies the given key to the element.
  ref, // Stores element reference to use .focus().
  onClick, // Click/tap event callback; setting this item as document.activeElement.
  onKeyDown, // Keyboard event callback; setting the next item as document.activeElement.
} = getTargetProps(key);
```

If you also need to listen to an event, be sure to call the resulting listener in your callback as well.

```jsx
function Item(props) {
  // Props for the resulting component.
  const {
    key,
    onClick: propsClick,
    ...rest,
  } = props;

  // Props to handle roving tabindex.
  const { 
    onClick: targetClick,
    ...targetProps
  } = getTargetProps(key);

  // Combine event handlers.
  const onClick = ev => {
    targetClick(ev);
    propsClick(ev);
  };

  return (
    <li
      { ...rest }
      { ...targetProps }
      onClick={ onClick }/>
  )
}
```

### Options

These are options you can pass as an object to the second argument of `useRove()`.

| Option | Value | Description |
| ------ | ----- | ----------- |
| `start` | `String` | A `key` (found in the list of `keys`) to set as the first item to receive focus on tab. Defaults to the first key in `keys`. |
| `loop` | `Boolean` | Determines if the arrow keys can loop around past the ends of the list. Defaults to `false`. |
| `rtl` | `Boolean` | Determines if the user is expecting to control the focus in a right-to-left language. This will flip the horizontal arrow keys. Defaults to `false` |.
| `orientation` | `'horizontal'` `'vertical'` `'both'` | Determines which keyboard arrow keys to trigger next focus. Defaults to `'both'` |