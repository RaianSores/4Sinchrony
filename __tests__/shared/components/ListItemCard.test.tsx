import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import ListItemCard from '../../../src/shared/components/ListItemCard';

describe('ListItemCard', () => {
  it('renders title, subtitle and badge label', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <ListItemCard
          icon="person"
          title="Ana Silva"
          subtitle="ana@email.com"
          badge={{ label: 'Ativo', variant: 'success' }}
        />
      );
    });
    const texts = root!.root.findAllByType(Text).map(n => n.props.children);
    expect(texts).toContain('Ana Silva');
    expect(texts).toContain('ana@email.com');
    expect(texts).toContain('Ativo');
  });

  it('calls onPress when tapped, and is not touchable without onPress', async () => {
    const onPress = jest.fn();
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<ListItemCard icon="person" title="Ana Silva" onPress={onPress} />);
    });
    await act(async () => {
      root!.root.findByType(TouchableOpacity).props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);

    await act(async () => {
      root = ReactTestRenderer.create(<ListItemCard icon="person" title="Ana Silva" />);
    });
    expect(root!.root.findAllByType(TouchableOpacity)).toHaveLength(0);
  });
});
