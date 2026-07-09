import { StyleSheet } from 'react-native';

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
    scrollContent: { padding: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    row: { flexDirection: 'row', gap: 12 },
    rowItem: { flex: 1 },
    helperText: { fontSize: 12, color: colors.textSecondary, marginTop: -10, marginBottom: 16 },
    divider: { height: 1, backgroundColor: colors.divider, marginVertical: 20 },
  });
