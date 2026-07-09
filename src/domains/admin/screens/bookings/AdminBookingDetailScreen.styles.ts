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
    scrollContent: { padding: 16 },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 16,
    },
    badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: borderRadius.full, marginBottom: 14 },
    badgeText: { fontSize: 13, fontWeight: '700' },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
    rowLast: { borderBottomWidth: 0 },
    rowLabel: { fontSize: 13, color: colors.textSecondary },
    rowValue: { fontSize: 14, fontWeight: '600', color: colors.text, flexShrink: 1, textAlign: 'right' },
    actionsColumn: { gap: 12 },
    cancelButton: {
      height: 48,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.danger,
    },
    cancelButtonText: { fontSize: 14, fontWeight: '700', color: colors.white },
    noShowButton: {
      height: 48,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.warning,
    },
    noShowButtonText: { fontSize: 14, fontWeight: '700', color: colors.warning },
  });
