import { StyleSheet } from 'react-native';
import { borderRadius } from '../../../../shared/theme';

export const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40 },
  loadingText: { color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text, paddingHorizontal: 20, marginTop: 16, marginBottom: 12 },
  bookingCard: { backgroundColor: colors.card, borderRadius: borderRadius.xl, marginHorizontal: 16, marginVertical: 6, padding: 16, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  // Sem flex:1 aqui, um nome de aula longo transbordava por cima do badge de status.
  cardTexts: { flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  className: { fontSize: 17, fontWeight: '600', color: colors.text },
  instructor: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  statusBadge: { flexShrink: 0, maxWidth: '45%', alignSelf: 'flex-start', backgroundColor: colors.success + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.sm },
  statusText: { color: colors.success, fontSize: 12, fontWeight: '600' },
  cardDetails: { marginTop: 14, gap: 6 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  // flex:1 — nome de estúdio longo quebra em linha em vez de estourar a largura do card.
  detailText: { flex: 1, color: colors.textSecondary, fontSize: 14 },
  cancelButton: { marginTop: 14, paddingVertical: 10, alignItems: 'center', borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.danger },
  cancelText: { color: colors.danger, fontSize: 15, fontWeight: '600' },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 24, fontWeight: '700', color: colors.text, marginTop: 24, textAlign: 'center' },
  emptySubtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 40, marginTop: 8 },
  historyLink: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, padding: 12 },
  historyLinkText: { color: colors.primary, fontSize: 16, fontWeight: '500', marginRight: 4 },
});
