import React from 'react';
import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import { useRove } from '../src';

function List ({ keys = ['first', 'second', 'third'], ...options }) {
  const getTargetProps = useRove(keys, options);
  return (
    <ul>
      { keys.map((k) => <li {...getTargetProps(k)}>{k}</li>) }
    </ul>
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
          <button type="button">Button</button>
        </>
      );

      expect(document.body).toHaveFocus();
      userEvent.tab();
      expect(getByText('first')).toHaveFocus();

      userEvent.keyboard('{arrowRight}');
      expect(getByText('second')).toHaveFocus();

      userEvent.tab();
      expect(getByRole('button')).toHaveFocus();

      userEvent.tab({ shift: true })
      expect(getByText('second')).toHaveFocus();

      userEvent.keyboard('{arrowRight}');
      expect(getByText('third')).toHaveFocus();
    });

    it('should focus by click/tap', function () {
      const { getByText } = render(<List />);

      const clickTarget = getByText('second')

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
});