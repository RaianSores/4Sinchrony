import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Switch } from 'react-native';
import FormToggle from '../../../src/shared/components/FormToggle';

describe('FormToggle', () => {
  it('reflects the current value and calls onValueChange when toggled', async () => {
    const onValueChange = jest.fn();
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <FormToggle label="Usa bicicletas" value={false} onValueChange={onValueChange} />
      );
    });
    const sw = root!.root.findByType(Switch);
    expect(sw.props.value).toBe(false);

    await act(async () => {
      sw.props.onValueChange(true);
    });
    expect(onValueChange).toHaveBeenCalledWith(true);
  });
});
