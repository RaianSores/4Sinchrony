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
    listContent: { paddingHorizontal: 16, paddingTop: 4, flexGrow: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    resultCount: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },
  });
