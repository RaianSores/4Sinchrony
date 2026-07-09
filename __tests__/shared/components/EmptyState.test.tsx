import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import EmptyState from '../../../src/shared/components/EmptyState';

describe('EmptyState', () => {
  it('renders title and optional subtitle', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(
        <EmptyState icon="people-outline" title="Nenhum aluno encontrado" subtitle="Cadastre o primeiro aluno" />
      );
    });
    const texts = root!.root.findAllByType(Text).map(n => n.props.children);
    expect(texts).toContain('Nenhum aluno encontrado');
    expect(texts).toContain('Cadastre o primeiro aluno');
  });

  it('omits the subtitle text node when not provided', async () => {
    let root: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      root = ReactTestRenderer.create(<EmptyState icon="people-outline" title="Nenhum aluno encontrado" />);
    });
    expect(root!.root.findAllByType(Text)).toHaveLength(1);
  });
});
