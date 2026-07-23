import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { borderRadius } from '../theme';

// Filtro de status padrão de todas as listas (App e ERP usam o mesmo desenho: chips).
// Por padrão as listas carregam apenas os ATIVOS — ver DEFAULT_STATUS_FILTER.
export type StatusFilterValue = 'active' | 'inactive' | '';

export const DEFAULT_STATUS_FILTER: StatusFilterValue = 'active';

const BASE_OPTIONS: { label: string; value: StatusFilterValue }[] = [
  { label: 'Todos', value: '' },
  { label: 'Ativos', value: 'active' },
  { label: 'Inativos', value: 'inactive' },
];

/** Aplica o filtro a um item que tenha `active: boolean`. */
export function matchesStatus(value: StatusFilterValue, isActive: boolean): boolean {
  if (value === '') return true;
  return value === 'active' ? isActive : !isActive;
}

interface Props<T extends string = StatusFilterValue> {
  value: T;
  onChange: (value: T) => void;
  /** Opções extras além de Todos/Ativos/Inativos (ex: "Bloqueados" em alunos). */
  extraOptions?: { label: string; value: T }[];
}

function StatusFilter<T extends string = StatusFilterValue>({ value, onChange, extraOptions }: Props<T>) {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const options = [...(BASE_OPTIONS as unknown as { label: string; value: T }[]), ...(extraOptions ?? [])];

  return (
    <View style={styles.filterRow}>
      {options.map(opt => {
        const selected = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value || 'all'}
            style={[styles.filterChip, selected && styles.filterChipActive]}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.filterChipText, selected && styles.filterChipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const mkStyles = (colors: any) =>
  StyleSheet.create({
    filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12, flexWrap: 'wrap' },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
    filterChipTextActive: { color: colors.white },
  });

export default StatusFilter;
