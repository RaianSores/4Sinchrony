import { StyleSheet } from 'react-native';
import { borderRadius } from '../../../../shared/theme';

export const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  profileHeader: { alignItems: 'center', paddingVertical: 40, backgroundColor: colors.card, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 4, borderColor: colors.primary },
  name: { fontSize: 26, fontWeight: '700', color: colors.text },
  email: { fontSize: 16, color: colors.textSecondary, marginTop: 6 },
  creditsContainer: { marginTop: 20, alignItems: 'center', backgroundColor: colors.background, paddingHorizontal: 24, paddingVertical: 12, borderRadius: borderRadius.lg },
  creditsLabel: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  creditsValue: { fontSize: 36, fontWeight: '700', color: colors.primary },
  menu: { paddingHorizontal: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 18, borderRadius: borderRadius.lg, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  menuText: { flex: 1, marginLeft: 16, fontSize: 17, color: colors.text, fontWeight: '500' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { backgroundColor: colors.success, borderRadius: 10, minWidth: 22, height: 22, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: '700' },
});
