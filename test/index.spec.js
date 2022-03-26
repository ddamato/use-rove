import React from 'react';
import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import useRove from '../src';

describe(useRove.name, function () {
  it('should return defined function', function () {
    const { result } = renderHook(() => useRove(['key']));
    expect(result.current).toBeInstanceOf(Function);
  });

  describe('interactions', function () {
    const Component = (options) => {
      const keys = ['first', 'second', 'third'];
      const getTargetProps = useRove(keys, options);
      return (
        <ul>
          { keys.map((k) => <li {...getTargetProps(k)}>{k}</li>) }
        </ul>
      );
    }

    it('should set focus to first target initially', function () {
      const { getByText } = render(<Component />);
      expect(document.body).toHaveFocus();
      userEvent.tab();
      expect(getByText('first')).toHaveFocus();
    });

    it('should set the activeIndex correct when using horizontal arrow keys', function () {
      const { getByText } = render(<Component />)

      expect(document.body).toHaveFocus()
      userEvent.tab()
      expect(getByText('first')).toHaveFocus()

      userEvent.keyboard('{arrowLeft}')
      expect(getByText('first')).toHaveFocus()

      userEvent.keyboard('{arrowRight}')
      expect(getByText('second')).toHaveFocus()

      userEvent.keyboard('{arrowRight}')
      expect(getByText('third')).toHaveFocus()

      userEvent.keyboard('{arrowRight}')
      expect(getByText('third')).toHaveFocus()

      userEvent.keyboard('{arrowLeft}')
      expect(getByText('second')).toHaveFocus()
    });
  });
});