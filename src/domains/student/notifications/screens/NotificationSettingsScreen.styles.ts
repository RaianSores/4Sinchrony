import { StyleSheet } from 'react-native';
import { borderRadius } from '../../../../shared/theme';

export const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40, paddingTop: 8 },
  sectionHeader: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
  channelRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: 16, marginHorizontal: 16, marginVertical: 4, borderWidth: 1, borderColor: colors.border },
  channelIcon: { width: 40, height: 40, borderRadius: borderRadius.md, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  channelText: { flex: 1, marginRight: 12 },
  channelTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  channelDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  loading: { marginTop: 40 },
  footer: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 24, paddingHorizontal: 32 },
});
