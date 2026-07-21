import { StyleSheet } from 'react-native';
import { borderRadius } from '../../../../shared/theme';

export const mkStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    title: { fontSize: 18, fontWeight: '700', color: colors.text },
    subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
    scrollContent: { padding: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    statusButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    statusButtonText: { fontSize: 12, fontWeight: '600', color: colors.text },
    row: { flexDirection: 'row', gap: 12 },
    rowItem: { flex: 1 },
    helperText: { fontSize: 12, color: colors.textSecondary, marginTop: -10, marginBottom: 16 },
    benefitsSection: { marginBottom: 16 },
    benefitsLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
    benefitsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    benefitChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
    },
    benefitChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
    benefitChipOff: { backgroundColor: 'transparent', borderColor: colors.border },
    benefitChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    benefitChipTextOn: { color: '#FFFFFF' },
  });
