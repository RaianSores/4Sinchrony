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
    scrollContent: { padding: 16, paddingBottom: 40 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 12 },
    sectionTitleFirst: { marginTop: 0 },
    row: { flexDirection: 'row', gap: 12 },
    rowItem: { flex: 1 },
    divider: { height: 1, backgroundColor: colors.divider, marginVertical: 8 },
  });
