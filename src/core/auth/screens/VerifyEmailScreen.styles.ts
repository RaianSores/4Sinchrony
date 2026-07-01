import { StyleSheet } from 'react-native';
import { borderRadius } from '../../../shared/theme';

export const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#7C3AED' },
  content: { flex: 1 },
  topSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backButton: { position: 'absolute', left: 16, zIndex: 10 },
  iconCircle: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { color: '#FFF', fontWeight: '700', textAlign: 'center' },
  bottomSheet: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 24,
  },
  formTitle: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  formSubtitle: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  emailText: {
    color: colors.primary,
    fontWeight: '600',
    marginVertical: 12,
  },
  instructions: {
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 32,
  },
  resendSection: { marginBottom: 24 },
  resentText: {
    color: colors.success,
    textAlign: 'center',
    marginTop: 8,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  backLinkText: { color: colors.primaryDark },
});
