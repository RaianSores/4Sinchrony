import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { borderRadius } from '../../../../shared/theme';
import { NotificationPreference } from '../../../../shared/types';

interface NotificationToggleProps {
  preference: NotificationPreference;
  onToggle: (id: string) => void;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({ preference, onToggle }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name={preference.icon} size={22} color={colors.primary} />
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.title}>{preference.title}</Text>
        <Text style={styles.description}>{preference.description}</Text>
      </View>

      <Switch
        value={preference.enabled}
        onValueChange={() => onToggle(preference.id)}
        trackColor={{ false: colors.grayLight, true: colors.primary }}
        thumbColor={colors.white}
      />
    </View>
  );
};

const mkStyles = (colors: any) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textWrap: { flex: 1, marginRight: 12 },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  description: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
});

export default NotificationToggle;
