import { StyleSheet } from 'react-native';
import { borderRadius, shadow } from '../../../shared/theme';

export const mkStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
    title: { fontSize: 28, fontWeight: '700', color: colors.text },
    subtitle: { fontSize: 15, color: colors.textSecondary, marginTop: 2 },
    scrollContent: { padding: 16, paddingBottom: 40 },
    loadingText: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
    emptyState: { alignItems: 'center', marginTop: 60, gap: 8 },
    emptyText: { fontSize: 16, color: colors.grayLight },
    classCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: borderRadius.lg,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadow.sm,
    },
    classTime: {
      alignItems: 'center',
      paddingRight: 16,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      minWidth: 55,
    },
    classTimeText: { fontSize: 16, fontWeight: '700', color: colors.text },
    classDuration: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
    classInfo: { flex: 1, paddingLeft: 16, gap: 3 },
    className: { fontSize: 16, fontWeight: '600', color: colors.text },
    classStudio: { fontSize: 13, color: colors.textSecondary },
    classOccupancy: { fontSize: 12, color: colors.primaryDark, fontWeight: '500' },
  });
