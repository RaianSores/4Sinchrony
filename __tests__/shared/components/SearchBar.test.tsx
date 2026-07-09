import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { TextInput, TouchableOpacity } from 'react-native';
import SearchBar from '../../../src/shared/components/SearchBar';

describe('SearchBar', () => {
  it('calls onChangeText as the user types', async () => {
    const onChangeText = jest.fn();
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<SearchBar value="" onChangeText={onChangeText} />);
    });
    await act(async () => {
      root!.root.findByType(TextInput).props.onChangeText('ana');
    });
    expect(onChangeText).toHaveBeenCalledWith('ana');
  });

  it('only shows the clear button when there is text, and clears on press', async () => {
    const onChangeText = jest.fn();
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<SearchBar value="" onChangeText={onChangeText} />);
    });
    expect(root!.root.findAllByType(TouchableOpacity)).toHaveLength(0);

    await act(async () => {
      root = ReactTestRenderer.create(<SearchBar value="ana" onChangeText={onChangeText} />);
    });
    const clearButton = root!.root.findAllByType(TouchableOpacity)[0];
    await act(async () => {
      clearButton.props.onPress();
    });
    expect(onChangeText).toHaveBeenCalledWith('');
  });
});
