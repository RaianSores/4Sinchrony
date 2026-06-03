import { StyleSheet } from 'react-native';

export const mkStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  dialog: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 8,
    width: '82%',
    maxWidth: 340,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  buttonTextDestructive: {
    color: colors.danger,
  },
  buttonTextCancel: {
    color: colors.textSecondary,
  },
});
