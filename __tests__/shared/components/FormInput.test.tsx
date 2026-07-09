import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, TextInput } from 'react-native';
import FormInput from '../../../src/shared/components/FormInput';

describe('FormInput', () => {
  it('renders label and current value', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <FormInput label="Nome completo" value="Ana" onChangeText={() => {}} />
      );
    });
    const texts = root!.root.findAllByType(Text).map(n => n.props.children).flat();
    expect(texts).toContain('Nome completo');
    expect(root!.root.findByType(TextInput).props.value).toBe('Ana');
  });

  it('shows required marker and error message', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <FormInput label="Email" value="" onChangeText={() => {}} required error="Email inválido" />
      );
    });
    const texts = root!.root.findAllByType(Text).map(n => n.props.children).flat();
    expect(texts.join('')).toContain('Email *');
    expect(texts).toContain('Email inválido');
  });
});
