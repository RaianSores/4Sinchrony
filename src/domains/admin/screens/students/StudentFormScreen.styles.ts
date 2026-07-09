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
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      height: 46,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      marginBottom: 16,
    },
    secondaryButtonText: { fontSize: 13, fontWeight: '600', color: colors.text },
  });
