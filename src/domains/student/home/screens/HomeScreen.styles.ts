import { StyleSheet } from 'react-native';
import { borderRadius } from '../../../../shared/theme';

export const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40 },
  greeting: { paddingHorizontal: 20, paddingVertical: 24 },
  welcome: { fontSize: 28, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 17, color: colors.textSecondary, marginTop: 4 },
  statsContainer: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 28 },
  creditsBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginBottom: 28, paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: colors.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border,
  },
  creditsBannerText: { flex: 1, marginLeft: 8, color: colors.textSecondary, fontSize: 15, fontWeight: '500' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text, paddingHorizontal: 20, marginBottom: 12 },
  progressContainer: {
    backgroundColor: colors.card, marginHorizontal: 16, borderRadius: borderRadius.xl,
    padding: 20, borderWidth: 1, borderColor: colors.border,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressText: { color: colors.text, fontSize: 17, fontWeight: '600' },
  progressPct: { color: colors.primary, fontSize: 17, fontWeight: '700' },
  progressBar: { height: 10, backgroundColor: colors.border, borderRadius: 6, overflow: 'hidden' },
  progress: { height: '100%', backgroundColor: colors.primary },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, marginTop: 8 },
  actionButton: {
    backgroundColor: colors.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border,
    paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', gap: 6,
  },
  actionText: { color: colors.text, fontSize: 13, fontWeight: '600' },
});
