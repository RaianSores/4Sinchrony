import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { TouchableOpacity, Text } from 'react-native';
import FormSelect from '../../../src/shared/components/FormSelect';

const OPTIONS = [
  { label: 'Yoga', value: 'yoga' },
  { label: 'Pilates', value: 'pilates' },
];

describe('FormSelect', () => {
  it('shows the placeholder when nothing is selected', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <FormSelect label="Tipo" value={null} options={OPTIONS} onSelect={() => {}} placeholder="Escolha um tipo" />
      );
    });
    const texts = root!.root.findAllByType(Text).map(n => n.props.children).flat();
    expect(texts).toContain('Escolha um tipo');
  });

  it('shows the selected option label', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <FormSelect label="Tipo" value="pilates" options={OPTIONS} onSelect={() => {}} />
      );
    });
    const texts = root!.root.findAllByType(Text).map(n => n.props.children).flat();
    expect(texts).toContain('Pilates');
  });

  it('calls onSelect with the chosen value when an option is tapped', async () => {
    const onSelect = jest.fn();
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <FormSelect label="Tipo" value={null} options={OPTIONS} onSelect={onSelect} />
      );
    });

    // Abre o modal tocando no campo (primeiro TouchableOpacity)
    await act(async () => {
      root!.root.findAllByType(TouchableOpacity)[0].props.onPress();
    });

    // Sobe da Text "Pilates" até o TouchableOpacity mais próximo (a linha da opção) —
    // não dá pra pegar o primeiro TouchableOpacity que contém esse texto em algum lugar
    // da subárvore, porque o overlay do modal também "contém" ele indiretamente.
    const pilatesText = root!.root.findAllByType(Text).find(t => t.props.children === 'Pilates');
    expect(pilatesText).toBeDefined();
    let node = pilatesText!.parent;
    while (node && node.type !== TouchableOpacity) node = node.parent;
    expect(node).not.toBeNull();

    await act(async () => {
      node!.props.onPress();
    });
    expect(onSelect).toHaveBeenCalledWith('pilates');
  });
});
