# use-rove

Customize roving tabindex behavior using a React hook.

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
  const getTargetProps = useRove(keys);
  return (
    <ul>
      { items.map({ key, ...item } =>
        <li { ...getTargetProps(key) } { ...item } />)
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

#### Merging props

You can also provide the component props into the argument instead as long as the `key` prop is included. The props used within the hook will be merged with the ones incoming. In other words, event listeners will fire and refs will be set. The only prop that will not be honored is `tabIndex` since this hook needs to control this.

```jsx
function Item(props) {
  // props.key will need to exist here otherwise the return will just be the given props.

  return (
    <li { ...getTargetProps(props) }/>
  )
}
```
- The hook will handle `Home` and `End` keys; jumping to the beginning and end of the collection respectedly.
- The hook will jump to the child based on the starting character of the text content or `aria-label` of each child.

#### `disabled` items

Use the following pattern to handle disabled items.

```jsx
function Listbox(props) {
  // Assume items is an array of props to build buttons, each with a unique key.
  const { items } = props;
  // Filter the list of items, looking for non-disabled keys.
  const activeKeys = items.filter(({ disabled }) => !disabled).map(({ key }) => key);
  // Setup the hook.
  const getTargetProps = useRove(activeKeys);
  // Render items.
  return items.map(item => <button { ...( item.disabled ? { tabIndex: -1, ...item } : getTargetProps(item) ) }/> );
}
```

The hook does not check if an item is disabled when setting the next item. It is merely selecting the next key in the given list of keys from the initial setup. Setting an item as disabled is fundamentally changing the state of the available items and will require a new list.

#### "visual" focus

In some cases, you might not want to move the DOM focus when traversing the children. Setting `focus: false` will avoid shifting the DOM focus. However, the `tabIndex` attribute will still cycle accordingly so you may target the element with a focused style.

```css
ul [tabindex=0] {
  /* https://css-tricks.com/copy-the-browsers-native-focus-styles/ */
  outline: 5px auto Highlight;
  outline: 5px auto -webkit-focus-ring-color;
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
| `focus` | `Boolean` | Calls `.focus()` on the DOM element ref. Defaults to `true` |

#### Example

```jsx
const getTargetProps = useRove(keys, {
  start: 'my-selected-item', // Start at the item with the key 'my-selected-item'.
  loop: true, // Do not stop at the ends when using arrow keys.
  rtl: false, // Use left-to-right navigational pattern.
  orientation: 'horizontal', // Do not listen for up or down arrow keys.
  focus: false, // Will not call `.focus()`, useful for showing a visual appearance of focus.
});
```

### Prior art

The concept of "roving tabindex" is [explained on web.dev by Rob Dodson](https://web.dev/control-focus-with-tabindex/). Some experiences require navigation to be performed by using the arrow keys instead of the tab key.

Much of this package is modeled after features from [`roving-ux-react`](https://www.npmjs.com/package/roving-ux-react) except it was missing some options. The most important is setting the starting item. Many experiences will have a selected item on load which should be the item that receives first focus in some roving scenarios. I've also taken some features embedded within the original hook (like right-to-left support) and allowed them as options as well.

The source code is not a direct copy of the original. As one example, the way the next item to be focused is determined is unique to this implementation. However, the test suite is nearly identical (except coverage for the new options) and kudos to [Dangoo](https://github.com/Dangoo) for the testing approach of [`roving-ux-react`](https://www.npmjs.com/package/roving-ux-react).

I've also noticed that some other roving tabindex solutions avoided the parent container altogether by listening for `onKeyDown` on each item. I found this to be a good solution so the hook didn't need to control both the parent and the children. Also many solutions could not handle roving tabindex with a dynamic list (such as one found within a search result panel). This hook is also designed to handle this case as well.
