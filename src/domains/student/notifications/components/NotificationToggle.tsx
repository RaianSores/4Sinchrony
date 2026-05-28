import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../../shared/theme';
import { NotificationPreference } from '../../../../shared/types';

interface NotificationToggleProps {
  preference: NotificationPreference;
  onToggle: (id: string) => void;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({ preference, onToggle }) => {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name={preference.icon} size={22} color={theme.colors.primary} />
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.title}>{preference.title}</Text>
        <Text style={styles.description}>{preference.description}</Text>
      </View>

      <Switch
        value={preference.enabled}
        onValueChange={() => onToggle(preference.id)}
        trackColor={{ false: theme.colors.grayLight, true: theme.colors.primary }}
        thumbColor={theme.colors.white}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textWrap: { flex: 1, marginRight: 12 },
  title: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  description: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2, lineHeight: 16 },
});

export default NotificationToggle;
