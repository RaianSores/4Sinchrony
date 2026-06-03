import { StyleSheet } from 'react-native';

export const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40, paddingTop: 8 },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 20,
    lineHeight: 20,
  },
  loading: { marginTop: 60 },
  emptyState: { alignItems: 'center', marginTop: 60, marginBottom: 32 },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 20 },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 48,
  },
  cardList: { marginBottom: 8 },
});
