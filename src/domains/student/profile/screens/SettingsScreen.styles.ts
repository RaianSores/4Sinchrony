import { StyleSheet } from 'react-native';

export const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 8, marginTop: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 0.5, borderBottomColor: colors.border, gap: 12 },
  menuLabel: { flex: 1, color: colors.text, fontSize: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, marginTop: 16, gap: 8 },
  logoutText: { color: colors.danger, fontSize: 17, fontWeight: '600' },
  version: { color: colors.textSecondary, textAlign: 'center', fontSize: 13, marginTop: 16 },
});
