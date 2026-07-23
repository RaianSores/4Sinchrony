import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/theme/useTheme';
import { borderRadius } from '../../../shared/theme';
import FormSelect from '../../../shared/components/FormSelect';
import { unitAdminService, AdminUnit } from '../services/unitAdminService';
import { captureError } from '../../../lib/sentry';

// Busca as unidades uma vez e mantém em cache no módulo (a lista muda pouco).
let cache: AdminUnit[] | null = null;
function useUnits() {
  const [units, setUnits] = useState<AdminUnit[]>(cache ?? []);
  useEffect(() => {
    if (cache) return;
    unitAdminService.list()
      .then(list => { cache = list; setUnits(list); })
      .catch(error => captureError(error));
  }, []);
  return units;
}

interface SingleProps {
  value: string;
  onChange: (unitId: string) => void;
  label?: string;
}

/** Seletor de UMA unidade (Aluno, Studio, Pacote). */
export function UnitSelect({ value, onChange, label = 'Unidade' }: SingleProps) {
  const units = useUnits();
  const options = useMemo(() => {
    const active = units.filter(u => u.active || u.id === value);
    return active.map(u => ({ label: u.name, value: u.id }));
  }, [units, value]);
  return (
    <FormSelect
      label={label}
      value={value || null}
      options={options}
      onSelect={onChange}
      placeholder="A qual filial (prédio) pertence"
    />
  );
}

interface MultiProps {
  value: string[];
  onChange: (unitIds: string[]) => void;
  label?: string;
}

/** Seletor de VÁRIAS unidades (Professor — relação N:N). */
export function UnitMultiSelect({ value, onChange, label = 'Unidades' }: MultiProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const units = useUnits();
  const shown = units.filter(u => u.active || value.includes(u.id));

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      {shown.length === 0 ? (
        <Text style={styles.hint}>Nenhuma unidade cadastrada ainda.</Text>
      ) : (
        <View style={styles.chips}>
          {shown.map(u => {
            const selected = value.includes(u.id);
            return (
              <TouchableOpacity
                key={u.id}
                style={[styles.chip, selected && styles.chipActive]}
                onPress={() => toggle(u.id)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextActive]}>{u.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
      <Text style={styles.hint}>Um professor pode atender mais de uma filial.</Text>
    </View>
  );
}

const mkStyles = (colors: any) =>
  StyleSheet.create({
    wrap: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.full,
      borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
    chipTextActive: { color: colors.white },
    hint: { fontSize: 12, color: colors.textSecondary, marginTop: 6 },
  });
