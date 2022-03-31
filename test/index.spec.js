import React, { useState } from 'react';
import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import { useRove } from '../src';

function List ({ keys = ['first', 'second', 'third'], ...options }) {
  const getTargetProps = useRove(keys, options);
  return (
    <div>
      { keys.map((k, i) => <button {...getTargetProps(k)} aria-label={ `${i}-label` }>{k}</button>) }
    </div>
  );
}

function ButtonProps ({ keys = ['first', 'second', 'third'], ...options }) {
  const [value, setValue] = useState('');
  const getTargetProps = useRove(keys, options);
  const onClick = ({ target }) => setValue(target.value);
  return (
   <>
     <div>
      { keys.map((k) => <button {...getTargetProps({ key: k, onClick, value: k })}>{k}</button>) }
     </div>
     <span data-testid='status'>{ value }</span>
   </>
  );
}

function MissingKey ({ keys = ['first', 'second', 'third'], ...options }) {
  const [value, setValue] = useState('');
  const getTargetProps = useRove(keys, options);
  const onClick = ({ target }) => setValue(target.value);
  return (
   <>
     <div>
      { keys.map((k) => <button {...getTargetProps({ onClick, value: k })} key={ k }>{k}</button>) }
     </div>
     <span data-testid='status'>{ value }</span>
   </>
  );
}

function IgnoreSecond ({ keys = ['first', 'second', 'third'], ...options }) {
  const getTargetProps = useRove(keys.filter((k) => k !== 'second'), options);
  return (
    <div>
      { keys.map((k) => <button {...getTargetProps({ key: k })}>{k}</button>) }
    </div>
  );
}

describe(useRove.name, function () {
  it('should return defined function', function () {
    const { result } = renderHook(() => useRove());
    expect(result.current).toBeInstanceOf(Function);
  });

  describe('rendering', function () {

    it('should default to first key', function () {
      const { getByText } = render(<List />);
      expect(document.body).toHaveFocus();
      userEvent.tab();
      expect(getByText('first')).toHaveFocus();
    });

    it('should default to starting key', function () {
      const { getByText } = render(<List start='second' />);
      expect(document.body).toHaveFocus();
      userEvent.tab();
      expect(getByText('second')).toHaveFocus();
    });
  });

  describe('interactions', function () {

    it('should set focus by horizontal arrow keys', function () {
      const { getByText } = render(<List />);

      expect(document.body).toHaveFocus();
      userEvent.tab();
      expect(getByText('first')).toHaveFocus();

      userEvent.keyboard('{arrowLeft}');
      expect(getByText('first')).toHaveFocus();

      userEvent.keyboard('{arrowRight}');
      expect(getByText('second')).toHaveFocus();

      userEvent.keyboard('{arrowRight}');
      expect(getByText('third')).toHaveFocus();

      userEvent.keyboard('{arrowRight}');
      expect(getByText('third')).toHaveFocus();

      userEvent.keyboard('{arrowLeft}');
      expect(getByText('second')).toHaveFocus();
    });

    it('should set focus by vertical arrow keys', function () {
      const { getByText } = render(<List />);

      expect(document.body).toHaveFocus();
      userEvent.tab();
      expect(getByText('first')).toHaveFocus();

      userEvent.keyboard('{arrowUp}');
      expect(getByText('first')).toHaveFocus();

      userEvent.keyboard('{arrowDown}');
      expect(getByText('second')).toHaveFocus();

      userEvent.keyboard('{arrowDown}');
      expect(getByText('third')).toHaveFocus();

      userEvent.keyboard('{arrowDown}');
      expect(getByText('third')).toHaveFocus();

      userEvent.keyboard('{arrowUp}');
      expect(getByText('second')).toHaveFocus();
    });

    it('should restrict focus by arrow key orientation', function () {
      const { getByText } = render(<List orientation='horizontal' />);

      expect(document.body).toHaveFocus();
      userEvent.tab();
      expect(getByText('first')).toHaveFocus();

      userEvent.keyboard('{arrowUp}');
      expect(getByText('first')).toHaveFocus();

      userEvent.keyboard('{arrowDown}');
      expect(getByText('first')).toHaveFocus();

      userEvent.keyboard('{arrowRight}');
      expect(getByText('second')).toHaveFocus();

      userEvent.keyboard('{arrowDown}');
      expect(getByText('second')).toHaveFocus();

      userEvent.keyboard('{arrowUp}');
      expect(getByText('second')).toHaveFocus();
    });

    it('restore focus when returning', function () {
      const { getByText, getByRole } = render(
        <>
          <List/>
          <a href="#">Link</a>
        </>
      );

      expect(document.body).toHaveFocus();
      userEvent.tab();
      expect(getByText('first')).toHaveFocus();

      userEvent.keyboard('{arrowRight}');
      expect(getByText('second')).toHaveFocus();

      userEvent.tab();
      expect(getByRole('link')).toHaveFocus();

      userEvent.tab({ shift: true })
      expect(getByText('second')).toHaveFocus();

      userEvent.keyboard('{arrowRight}');
      expect(getByText('third')).toHaveFocus();
    });

    it('should focus by click/tap', function () {
      const { getByText } = render(<List />);

      const clickTarget = getByText('second');

      expect(document.body).toHaveFocus();
      userEvent.tab();
      expect(getByText('first')).toHaveFocus();

      userEvent.click(clickTarget);
      expect(clickTarget).toHaveFocus();

      userEvent.tab({ shift: true });
      userEvent.tab();
      expect(clickTarget).toHaveFocus();
    });

    it('should jump to first and last', function () {
      const { getByText } = render(<List start='second' />);

      expect(document.body).toHaveFocus();
      userEvent.tab();
      expect(getByText('second')).toHaveFocus();

      userEvent.keyboard('{end}');
      expect(getByText('third')).toHaveFocus();

      userEvent.keyboard('{home}');
      expect(getByText('first')).toHaveFocus();

      userEvent.keyboard('{arrowRight}');
      expect(getByText('second')).toHaveFocus();
    });

    it('should jump on valid keypress', function () {
      const { getByText } = render(<List start='second' />);

      expect(document.body).toHaveFocus();
      userEvent.tab();
      expect(getByText('second')).toHaveFocus();

      userEvent.keyboard('{f}');
      expect(getByText('first')).toHaveFocus();

      // Does not exist, no change
      userEvent.keyboard('{v}');
      expect(getByText('first')).toHaveFocus();

      // aria-label rendered as {index}-label for example
      userEvent.keyboard('{2}');
      expect(getByText('third')).toHaveFocus();

      // Does not exist, no change
      userEvent.keyboard('{7}');
      expect(getByText('third')).toHaveFocus();
    });

    it('should loop past the ends', function () {
      const { getByText } = render(<List loop />);

      expect(document.body).toHaveFocus();
      userEvent.tab();
      expect(getByText('first')).toHaveFocus();

      userEvent.keyboard('{arrowLeft}');
      expect(getByText('third')).toHaveFocus();

      userEvent.keyboard('{arrowLeft}');
      expect(getByText('second')).toHaveFocus();

      userEvent.keyboard('{arrowRight}');
      expect(getByText('third')).toHaveFocus();

      userEvent.keyboard('{arrowRight}');
      expect(getByText('first')).toHaveFocus();
    });

    it('should flip horizontally when RTL', function () {
      const { getByText } = render(<List rtl/>);

      // Remember all directions are inverted to reflect RTL behavior
      expect(document.body).toHaveFocus();
      userEvent.tab();
      expect(getByText('first')).toHaveFocus();

      userEvent.keyboard('{arrowRight}');
      expect(getByText('first')).toHaveFocus();

      userEvent.keyboard('{arrowLeft}');
      expect(getByText('second')).toHaveFocus();

      userEvent.keyboard('{arrowLeft}');
      expect(getByText('third')).toHaveFocus();

      userEvent.keyboard('{arrowLeft}');
      expect(getByText('third')).toHaveFocus();

      userEvent.keyboard('{arrowRight}');
      expect(getByText('second')).toHaveFocus();
    });
  });

  describe('alternative behavior', function() {
    it('should merge props', function () {
      const { getByTestId, getByText } = render(<ButtonProps />);

      const clickTarget = getByText('second');
      const status = getByTestId('status');

      expect(status).toHaveTextContent('');

      expect(document.body).toHaveFocus();
      userEvent.tab();
      expect(getByText('first')).toHaveFocus();

      userEvent.click(clickTarget);
      expect(clickTarget).toHaveFocus();

      expect(status).toHaveTextContent('second');
    });

    it('should return given props when key is missing', function () {
      const { getByTestId, getByText } = render(<MissingKey />);

      const clickTarget = getByText('second');
      const status = getByTestId('status');

      userEvent.click(clickTarget);
      expect(clickTarget).toHaveFocus();

      expect(status).toHaveTextContent('second');

    });

    it('ignore items that are not provided', function () {
      const { getByText } = render(<IgnoreSecond />);

      expect(document.body).toHaveFocus();
      userEvent.tab();
      expect(getByText('first')).toHaveFocus();

      userEvent.keyboard('{arrowRight}');
      expect(getByText('third')).toHaveFocus();

      userEvent.keyboard('{arrowLeft}');
      expect(getByText('first')).toHaveFocus();
    });
  })
});