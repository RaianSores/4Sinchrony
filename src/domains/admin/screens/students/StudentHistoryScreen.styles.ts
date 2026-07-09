import { StyleSheet } from 'react-native';
import { borderRadius } from '../../../../shared/theme';

export const mkStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    title: { fontSize: 18, fontWeight: '700', color: colors.text },
    subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
    listContent: { paddingHorizontal: 16, flexGrow: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 8,
    },
    rowLeft: { flex: 1 },
    className: { fontSize: 14, fontWeight: '600', color: colors.text },
    date: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: borderRadius.full },
    badgeText: { fontSize: 11, fontWeight: '600' },
  });
