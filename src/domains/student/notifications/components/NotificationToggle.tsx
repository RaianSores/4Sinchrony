import React, { useMemo } from 'react';
import { View, Text, Switch } from 'react-native';
import { mkStyles } from './NotificationToggle.styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
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


export default NotificationToggle;
