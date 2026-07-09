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
    title: { fontSize: 18, fontWeight: '700', color: colors.text },
    addButton: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchContainer: { paddingHorizontal: 16, marginBottom: 10 },
    filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
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
    listContent: { paddingHorizontal: 16, flexGrow: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    resultCount: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },
  });
